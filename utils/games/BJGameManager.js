import prisma from "../prismaClient";
import crypto from "crypto";
import updateUserBalance from "../updateUserBalance";

class GameDeck {
  constructor() {
    this.cards = [];

    const houses = ["spades", "hearts", "clubs", "diamonds"];
    const values = [1,2,3,4,5,6,7,8,9,10,11,12,13];  

    houses.forEach((house) => {
      values.forEach((value) => {
        let face = value;

        if (value === 11) {
          value = 10;
          face = "J";
        } else if (value === 12) {
          value = 10;
          face = "Q";
        } else if (value === 13) {
          value = 10;
          face = "K";
        } else if (value === 1) {
          value = 11;
          face = "A";
        }

        this.cards.push({
          house: house,
          value: value,
          face: face,
        });
      });
    });

    //Fish-Yates algorithm
    //source: https://dev.to/codebubb/how-to-shuffle-an-array-in-javascript-2ikj
    const shuffleArray = array => {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = array[i];
        array[i] = array[j];
        array[j] = temp;
      }
    }

    shuffleArray(this.cards);
  }

  drawCard() {
    return this.cards.pop();
  };
}

class Game {
  constructor (playerId, playerUsername, playerBet, creationDate) {
    this.gameId = crypto.randomUUID();

    this.mgCreationDate = creationDate;
    this.dealerDelayTurnCount = 0;
    //create game deck
    this.deck = new GameDeck();

    this.isGameOver = false;
    this.playerWin = false;

    this.isCurrentTurnPlayer = true;

    this.player = {
      id: playerId,
      username: playerUsername,
      bet: playerBet || 0,
      cards: [
        this.deck.drawCard(),
        this.deck.drawCard(),
      ],

      get cardTotal() {
        let total = 0;

        this.cards.forEach((card) => {
          total += card.value; 
        });

        // aces default to 1 if they would make the total go over 21
        if (total > 21) {
          this.cards.forEach((card) => {
            if (card.face === "A") total -= 10;
          })
        }

        return total;
      },
    };

    this.dealer = {
      cards: [
        this.deck.drawCard(),
      ],
      
      get cardTotal() {
        let total = 0;

        this.cards.forEach((card) => {
          total += card.value; 
        });

        // aces default to 1 if they would make the total go over 21
        if (total > 21) {
          this.cards.forEach((card) => {
            if (card.face === "A") total -= 10;
          })
        }

        return total;
      },
    };
  }

  endGame() {
    if (this.isGameOver === true) return;

    this.isGameOver = true;

    const changeUserBalance = async (amount) => {
      if (amount === 0) return;

      const response = await updateUserBalance(this.player.id, amount, "game", "blackjack");
      return response;
   };

    if (this.player.cards.length >= 5) {
      this.playerWin = true;
      return changeUserBalance((this.player.bet * 1));
    }
    // player buest
    else if (this.player.cardTotal > 21) {
      return changeUserBalance((this.player.bet * -1));
    } 
    
    // player blackjack
    else if (this.player.cardTotal === 21) {
      if (this.dealer.cardTotal === 21)  {
        this.playerWin = true;
        return changeUserBalance(this.player.bet);;
      } else {
        this.playerWin = true;
        return changeUserBalance(this.player.bet);
      }
    } 

    // player under 21
    else {
      if (this.dealer.cardTotal > 21) {
        this.playerWin = true;
        return changeUserBalance(this.player.bet);
      } 

      else if (this.dealer.cardTotal >= this.player.cardTotal) {
        return changeUserBalance((this.player.bet * -1));
      } else {
        this.playerWin = true;
        return changeUserBalance(this.player.bet);
      }    
    }
  }
}

class BJGameManager {
  constructor () {
    this.creationDate = new Date();
    this.games = [];
  }
  
  createGame(userId, username, bet) {
    if (!userId || !username || bet < 0) return;

    const userInGame = this.games.find(game => game.player.id === userId);

    if(!userInGame) {
      this.games.push(new Game(userId, username, bet, this.creationDate));

      return `all good homie ${this.creationDate}`;
    }

    else return "I HATE YOU";
  }

  deleteGame(gameId) {
    const gameInList = this.games.find(game => game.id === gameId);

    this.games.splice(this.games.indexOf(gameInList));
  }

  getGameFromUserId(userId) {
    let resultGame = null;

    this.games.forEach((game) => {
      if (game.player.id === userId) resultGame = game;
    });

    return resultGame;
  }

  isPlayerInGame(userId) {
    let isPlayerInGame = false;

    this.games.forEach((game) => {
      if (game.player.id === userId) isPlayerInGame = true;
    });

    return isPlayerInGame;
  }
}

let bjGameManager;

if(!global.bjGameManager) {
  global.bjGameManager = new BJGameManager();
}

bjGameManager = global.bjGameManager;

export default bjGameManager;
