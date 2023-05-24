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

  if (bet > 15000 || bet > await prisma.userWallet.findFirst({where: {userId: userId}}).balance) {
    return new Response("Your bet is too large!", {
      status: 403,
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

  if (result === headsOrTails) {
    await updateUserBalance(bet);
  } else {
    await updateUserBalance((bet * -1))
  }
  
  return new Response(JSON.stringify({ result: result }));
}
