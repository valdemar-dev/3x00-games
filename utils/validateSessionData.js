import prisma from "./prismaClient";

const validateSessionData = async (sessionToken, userId, username) => {
  if(!sessionToken || !userId || !username) return false;

  const user = await prisma.user.findFirst({
    where: {
      sessionToken: sessionToken,
    },
  }) || null;

  if (!user) return false;
  if (user.id !== userId) return false;

  return true;
}

export default validateSessionData;
