import bjGameManager from "@/utils/games/BJGameManager";
import validateSessionData from "@/utils/validateSessionData";

export async function GET(req) {
  const sessionToken = req.cookies.get("sessionToken")?.value;
  const userId = req.cookies.get("userId")?.value;
  const username = req.cookies.get("username")?.value;

  if (await validateSessionData(sessionToken, userId, username) === false) {
    return new Response("Invalid session token or user id.", {
      status: 401,
   });
  }

  const game = bjGameManager.getGameFromUserId(userId); 

  if (!game) return new Response("User is not in a game.", {
    status: 400,
  });

  let amountWon = 0;
  if (game.playerBust === true) {
    amountWon = await game.endGame();
  } 

  if (game.isCurrentTurnPlayer === false) {
    // delay dealers turn so it doesnt happen instantaneously after drawing, or standing or etc.
    // also add 1 when the condition passes so that
    // the client knows to play the sound effects
    if (game.dealerDelayTurnCount < 1) {
      game.dealerDelayTurnCount++;
    } else {
      if (game.dealer.cardTotal < 17) game.dealer.cards.push(game.deck.drawCard());
      else if (game.dealer.cardTotal >= 17) {  
        amountWon = await game.endGame();
      }

      game.dealerDelayTurnCount++;
    }
  }

  const gameData = {
    id: game.gameId,
    player: game.player,
    dealerCards: game.dealer.cards,
    dealerTotal: game.dealer.cardTotal,
    isCurrentTurnPlayer: game.isCurrentTurnPlayer,
    isGameOver: game.isGameOver,
    playerWin: game.playerWin,
    se: null,
    amountWon: 0,
    dealerDelayTurnCount: game.dealerDelayTurnCount,
  };

  if (game.se !== null) {
    gameData.se = game.se;
    game.se = null;
  }

  //hacky workaround to tell the user how much money they won
  if (game.isGameOver === true) {
    gameData.amountWon = Math.round(amountWon);
  }

  return new Response(JSON.stringify({gameData: gameData}));
}
