import validateSessionData from "@/utils/validateSessionData";
import prisma from "@/utils/prismaClient";

export async function GET(req) {
  const sessionToken = req.cookies.get("sessionToken")?.value;
  const userId = req.cookies.get("userId")?.value;
  const username = req.cookies.get("username")?.value;

  if (await validateSessionData(sessionToken, userId, username) === false) {
    return new Response("Invalid session info.", {
      status: 401,
    });
  } 

  const userInventory = await prisma.userInventory.findUnique({
    where: {
      userId: userId,
    },
    include: {
      items: true,
    }
  }) || null;

  if (!userInventory) {
    return new Response("No inventory found", {
      status: 404,
    })
  }
  
  return new Response(JSON.stringify(userInventory));
}
