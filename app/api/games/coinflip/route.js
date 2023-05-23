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

  let bet = reqJSON.bet;
  const headsOrTails = reqJSON.headsOrTails; 

  // we have to make sure that the provided betting information is valid or the code will not work
  if (!bet || !headsOrTails || isNaN(bet) || parseInt(bet) < 0) {
    return new Response("Incorrect bet information.", {
      status: 401,
    })
  };
 
  bet = parseInt(bet);

  const user = await prisma.user.findUnique({
    where: {
      sessionToken: req.cookies.get("sessionToken").value,
    },
    include: {
      wallet: true,
    },
  });

  // limit bet to 10k
  // make sure that users do not go into neg account bal
  if (bet > 10000 || bet > user.wallet.balance) {
    return new Response("Bet is too large!", {
      status: 403,
    });
  }

  // calculate game result 
  let result;

  const isFlipResultHeads = Math.random() > 0.5;

  if (isFlipResultHeads === true) {
    result = "heads";
  } else {
    result = "tails";
  }

  // increment or decrement user balance by bet based on win/loss respectively
  if (result === headsOrTails) {  
    await prisma.userWallet.update({
      where: {
        userId: user.id,
      },
      data: {
        balance: { increment: bet },
      },
    });

    user.wallet.balance = user.wallet.balance + bet;
  } else {
    await prisma.userWallet.update({
      where: {
        userId: user.id,
      },
      data: {
        balance: { decrement: bet },
      },
    });

    user.wallet.balance = user.wallet.balance - bet;
  }
  
  return new Response(JSON.stringify({result: result, newBalance: user.wallet.balance}));
}
