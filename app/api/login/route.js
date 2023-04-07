import prisma from "@/utils/prismaClient";
import hashText from "@/utils/hashText";
import generateSessionToken from "@/utils/generateSessionToken";

export async function POST(request) {
  const req = await request.json();

  const username = hashText(req.username);
  const password = hashText(req.password);

  // i use || null here to be certain the query returns null if nothing is found.
  // merely a precaution, most likely not necessary. but it helps me understand whats happening better.
  const user = await prisma.user.findUnique({
    where: {
      username: username,
    },
  }) || null;

  if (!user) return new Response("Incorrect username or password!", {
    status: 401,
  });

  if (user.password !== password) return new Response("Incorrect username or password.", {
    status: 401,
  });

  const sessionToken = hashText(generateSessionToken());
  
  await prisma.user.update({
    where: {
      username: username,
    },
    data: {
      sessionToken: sessionToken,
    },
  });

  return new Response("Logged in!", {
    headers: {
      //cookie needs to be renewed every 90 days.
      "Set-Cookie": `sessionToken=${sessionToken}; Secure; Max-Age=${90 * 86400}; HttpOnly=False; SameSite=None; Path=/;`,
    },
  })
}

