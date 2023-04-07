import generateSessionToken from "./generateSessionToken";
import prisma from "./prismaClient";

const validateSessionToken = async (sessionToken) => {
  if(!sessionToken) return false;

  if (!await prisma.user.findUnique({
    where: {
      sessionToken: sessionToken,
    },
  })) return false;

  // session token is valid.
  return true;
};

export default validateSessionToken;
