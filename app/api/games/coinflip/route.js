import prisma from "@/utils/prismaClient";
import validateSessionData from "@/utils/validateSessionData";

export async function POST(req) {
  const sessionToken = req.cookies.get("sessionToken")?.value;
  const userId = req.cookies.get("userId")?.value;
  const username = req.cookies.get("username")?.value;

  if (await validateSessionData(sessionToken, userId, username) === false) {
    return new Response("Invalid session token or user id.", {
      status: 401,
   });
  }

  const reqJSON = await req.json();

  const bet = parseInt(reqJSON.bet);
  const headsOrTails = reqJSON.headsOrTails; 

  if (!bet || !headsOrTails || isNaN(bet) || bet <= 0) {
    return new Response({ status: 401, })
  };

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

  if (bet > userWallet.balance) {
    return new Response("You don't have that much money!", {
      status: 400,
    })
  }

  const result = (Math.random() > 0.5 ? "heads" : "tails");

  const updateUserBalance = async (amount) => {
    await prisma.userWallet.update({
      where: {
        userId: userId,
      },
      data: {
        balance: { increment: amount },
      },
    });
  };

  let win = false;

  if (result === headsOrTails) {
    await updateUserBalance(bet);
    win = true;
  } else {
    await updateUserBalance((bet * -1))
    win = false;
  }
  
  return new Response(JSON.stringify({ result: result, win: win }));
}
