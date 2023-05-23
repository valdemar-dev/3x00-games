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

  // remove bet if they left whilst the game was still going on
  if (game.isGameOver === false) {
    await prisma.userWallet.update({
      where: {
        userId: userId,
      },
      data: {
        balance: { decrement: parseInt(game.player.bet) },
      },
    });
  }

  // destroy game
  bjGameManager.deleteGame(game.id);

  return new Response("OK.");
}
