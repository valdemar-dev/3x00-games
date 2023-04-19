import validateSessionData from "@/utils/validateSessionData";
import bjGameManager from "@/utils/games/BJGameManager";

export async function GET(req) {
  const sessionToken = req.cookies.get("sessionToken")?.value;
  const userId = req.cookies.get("userId")?.value;

  if (await validateSessionData(sessionToken, userId) === false) {
    return new Response("Invalid session token or user id.", {
      status: 401,
   });
  }

  const game = bjGameManager.getGameFromUserId(userId); 

  if (!game) return new Response("User is not in a game.", {
    status: 401,
  }); 
  
  if (game.currentTurn !== userId) {
    return new Response("It's not your turn.", {
      status: 403,
    });
  } 

  const card = game.deck.drawCard();

  const player = game.players.find((player) => player.id === userId);

  player.cards.push(card);

  if (player.cardTotal >= 21) {
    player.isInGame = false;

    if (player.cardTotal > 21) {
      player.gameStatus = "bust";
    } else {
      player.gameStatus = "blackjack!";
    }

    const nextPlayer = game.players.find((player) => player.isInGame === true);

    if (!nextPlayer) {
      game.currentTurn = "dealer";
      game.doDealerTurn();
    } else {
      game.currentTurn = nextPlayer.id;
    }
  }

  //return new game data
  return new Response(JSON.stringify(card));
}
