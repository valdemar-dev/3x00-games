import bjGameManager from "@/utils/games/BJGameManager";
import validateSessionData from "@/utils/validateSessionData";

export async function POST(req) {
  const sessionToken = req.cookies.get("sessionToken")?.value;
  const userId = req.cookies.get("userId")?.value;
  const username = req.cookies.get("username")?.value;

  // this makes sure that the user id matches the given session token, 
  // and that both are provided and valid
  if (await validateSessionData(sessionToken, userId, username) === false) {
    return new Response("Invalid session token or user id.", {
      status: 401,
    });
  }

  // make sure that the player is not a part of 2 games at once
  if (bjGameManager.isPlayerInGame(userId) === true) {
    return new Response("You are already in a game!", {
      status: 401,
    });
  }

  const reqJSON = await req.json();

  // default to 0 incase users want to have a casual game
  const bet = parseInt(reqJSON.bet) || 0;

  if (bet > 20000 || isNaN(bet)) {
    return new Response("Incorrect betting information!", {
      status: 400,
    });
  }

  console.log(bjGameManager.createGame(userId, username, bet));

  return new Response("OK.")
}
