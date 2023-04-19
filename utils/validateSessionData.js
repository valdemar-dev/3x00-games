import prisma from "./prismaClient";

const validateSessionData = async (sessionToken, userId) => {
  if(!sessionToken || !userId) return false;

  const user = await prisma.user.findFirst({
    where: {
      sessionToken: sessionToken,
    },
  }) || null;

  if (user?.id !== userId || !user) return false;


  return true;
}

export default validateSessionData;
