import prisma from "../prismaClient";
import crypto from "crypto";

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
  constructor (players) {
    //give unique id to game so that it can be found later.
    this.isGameOver = false;

    this.gameId = crypto.randomUUID();

    //create game deck
    this.deck = new GameDeck();

    this.statusMessage = "";

    //create player list
    this.players = [];

    players.forEach((player) => {
      this.players.push({
        id: player.id,
        bet: player.bet,
        username: player.username,
        win: false,
        gameStatus: "playing",
        isInGame: true,

        cards: [
          this.deck.drawCard(),
          this.deck.drawCard(),
        ],

        get cardTotal() {
          let total = 0;

          this.cards.forEach((card) => {
            total += card.value;
          });

          return total;
        },
      });
    });
    
    this.players?.forEach((player) => {
      if (player.cardTotal >= 21) {
        player.isInGame = false;

        if (player.cardTotal === 21) {
          player.gameStatus = "blackjack!";
        } else {
          player.gameStatus = "bust";
        }
      }
    });

    const firstTurnHolder = this.players.find((player) => player.isInGame === true);

    if(!firstTurnHolder) {
      this.currentTurn = "dealer";
    } else {
      this.currentTurn = firstTurnHolder.id;
    }

    this.dealer = {
      cards: [
        this.deck.drawCard(),
        this.deck.drawCard(),
      ],
      
      get cardTotal() {
        let total = 0;

        this.cards.forEach((card) => {
          total += card.value;
        });

        return total;
      },
    };
  }

  doDealerTurn() {
    while (this.dealer.cardTotal < 18) {
      this.dealer.cards.push(this.deck.drawCard());
    }
    
    return this.endGame();
  }

  endGame() {
    // prevents from giving people an infinite amount of money
    // or removing an infinite amount of money
    if (this.isGameOver === true) return;

    const updateUserBalance = async (id, amount) => {
      if (amount === 0) return;

      await prisma.userWallet.update({
        where: {
          userId: id,
        },
        data: {
          balance: { increment: amount },
        },
      }) || null;
    };

    this.players.forEach(async (player) => {
      if (player.cardTotal > 21) {
        // ***BUST***
        await updateUserBalance(player.id, (player.bet * -1)); 
      } else if (player.cardTotal === 21 && this.dealer.cardTotal !== 21) {
        // ***BLACKJACK***
        await updateUserBalance(player.id, (player.bet));
        player.win = true;
      } else if (player.cardTotal < 21) {
        // ***NORMAL***
        if (this.dealer.cardTotal > 21 || this.dealer.cardTotal < player.cardTotal) {
          // ***WIN***
          await updateUserBalance(player.id, (player.bet));
          player.win = true;
        } else if (this.dealer.cardTotal >= player.cardTotal) {
          // ***LOSS***
          await updateUserBalance(player.id, (player.bet * -1));
        }
      }
    });

    this.statusMessage = "The game has ended!";
    this.isGameOver = true;
    return;
  }
}

class BJGameManager {
  constructor () {
    this.games = [];
  }
  
  createGame(players) {
    if (players.length < 1) {
      return false;
    }
    
    players.forEach((player) => {
      if(!player.bet || !player.id) return false;
    });

    this.games.push(new Game(players));
  }

  deleteGame(gameId) {
    const gameInList = this.games.find(game => game.id === gameId);

    this.games.splice(this.games.indexOf(gameInList));
    // this method might be horribly inefficient, will double check later, though.
  }

  getGameFromUserId(userId) {
    let resultGame = null;

    this.games.forEach((game) => {
      game.players.forEach((player) => {
        if (player.id === userId) resultGame = game;
      })
    });

    return resultGame;
  }

  isPlayerInGame(userId) {
    let isPlayerInGame = false;

    this.games.forEach((game) => {
      game.players.forEach((player) => {
        if (player.id === userId) return isPlayerInGame = true;
      });
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
