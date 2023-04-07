import validateSessionToken from "@/utils/validateSessionToken";

export async function GET(request) {
  const isTokenValid = await validateSessionToken(request.cookies.get("sessionToken")?.value);

  if (!isTokenValid) {
    return new Response("Invalid token.", {
      status: 401,
    });
  }

  else {
    return new Response("Valid token.");
  }
}
