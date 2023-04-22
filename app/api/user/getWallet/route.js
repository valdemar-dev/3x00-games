import prisma from "@/utils/prismaClient";
import validateSessionData from "@/utils/validateSessionData";

export async function GET(req) {
  const sessionToken = req.cookies.get("sessionToken")?.value;
  const userId = req.cookies.get("userId")?.value;
  const username = req.cookies.get("username")?.value;

  if (await validateSessionData(sessionToken, userId, username) === false) {
    return new Response("Invalid session token.", {
      status: 401,
    });
  }

  const user = await prisma.user.findUnique({
    where: {
      sessionToken: sessionToken,
    },
    include: {
      wallet: true,
    },
  });

  return new Response(JSON.stringify(user.wallet));
};
