import prisma from "@/utils/prismaClient";
import validateSessionToken from "@/utils/validateSessionToken";

export async function GET(request) {
  const sessionToken = request.cookies.get("sessionToken")?.value;

  if (await validateSessionToken(sessionToken) === false) {
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

  return new Response(JSON.stringify(user.wallet), {
    status: 200,
  });
};
