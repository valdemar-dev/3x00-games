import bjGameManager from "@/utils/games/BJGameManager";
import prisma from "@/utils/prismaClient";
import validateSessionData from "@/utils/validateSessionData";

export async function POST(req) {
  const sessionToken = req.cookies.get("sessionToken")?.value;
  const userId = req.cookies.get("userId")?.value;
  const username = req.cookies.get("username")?.value;

  // this makes sure that the user id matches the given session token, 
  // and that both are provided and valid
  if (await validateSessionData(sessionToken, userId, username) === false) {
    return new Response("Invalid session token or user id.", {
      status: 401,
    });
  }

  // make sure that the player is not a part of 2 games at once
  if (bjGameManager.isPlayerInGame(userId) === true) {
    return new Response("You are already in a game!", {
      status: 401,
    });
  }

  const reqJSON = await req.json();

  // default to 0 incase users want to have a casual game
  const bet = parseInt(reqJSON.bet) || 0;

  const userWallet = await prisma.userWallet.findFirst({
    where: {
      userId: userId,
    },
  }) || null;

  if (!userWallet) {
    return new Response("You don't have a wallet?", {
      status: 403,
    }) 
  }

  if (bet > 15000) {
    return new Response("Your bet is too large!", {
      status: 403,
    })
  }

  if (bet < 0) {
    return new Response("Your bet is too small!", {
      status: 400,
    })
  }

  if (bet > userWallet.balance) {
    return new Response("You don't have that much money!", {
      status: 400,
    })
  }

  bjGameManager.createGame(userId, username, bet);

  return new Response("OK.")
}
