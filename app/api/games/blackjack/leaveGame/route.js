import bjGameManager from "@/utils/games/BJGameManager";
import prisma from "@/utils/prismaClient";
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
    status: 403,
  });

  const player = game.players.find((player) => player.id === userId);
  const playerIndex = game.players.indexOf(player);

  if (playerIndex < 0) {
    return new Response("User is not in a game.", {
      status: 403,
    });
  }

  // punish the user if they disconnect before the game is over
  if (game.isGameOver === false) {
    await prisma.userWallet.update({
      where: {
        userId: userId,
      },
      data: {
        balance: { decrement: player.bet }, 
      },
    }).catch(() => {
        return new Response("Could not remove balance from user.", {
          status: 500,
        });
      });
  }

  game.players.splice(playerIndex);

  if (game.players.length < 1) {
    bjGameManager.deleteGame(game.id);
  }

  return new Response("OK.");
}
