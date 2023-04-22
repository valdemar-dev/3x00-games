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
    status: 401,
  }); 
  
  if (game.currentTurn !== userId) {
    return new Response("It's not your turn.", {
      status: 403,
    });
  } 

  const player = game.players.find((player) => player.id === userId);

  if (!player) return new Response("Player not found in game.", {
    status: 403,
  });

  player.isInGame = false;
  player.gameStatus = "Stand";

  const nextTurnHolder = game.players.find((player) => player.isInGame === true);
  
  if (!nextTurnHolder) {
    game.currentTurn = "dealer";
    game.doDealerTurn();
  } else {
    game.currentTurn = nextTurnHolder.id;
  }

  return new Response("OK.");
}
