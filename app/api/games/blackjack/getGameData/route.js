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

  if (game.isCurrentTurnPlayer === false) {
    if (game.dealerDelayTurnCount < 1) {
      console.log("NO DEALER DELAY TURN");
      game.dealerDelayTurnCount++;
    } else {
      if (game.dealer.cardTotal < 17) game.dealer.cards.push(game.deck.drawCard());
      else if (game.dealer.cardTotal >= 17) {  
        game.endGame();
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
    dealerDelayTurnCount: game.dealerDelayTurnCount,
  };

  if (game.se !== null) {
    gameData.se = game.se;
    game.se = null;
  }

  return new Response(JSON.stringify({gameData: gameData}));
}
