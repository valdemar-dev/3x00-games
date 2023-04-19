import validateSessionData from "@/utils/validateSessionData";

export async function GET(req) {
  const sessionToken = req.cookies.get("sessionToken")?.value;
  const userId = req.cookies.get("userId")?.value;

  if (await validateSessionData(sessionToken, userId) === false) {
    return new Response("Invalid session data", {
      status: 401,
    });
  } 

  return new Response("Valid session data", {
    status: 200,
  })
}
