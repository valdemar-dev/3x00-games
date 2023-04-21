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
    return new Response("Player is already in a game.", {
      status: 401,
    });
  }

  const reqJSON = await req.json();

  // default to 0 incase users want to have a casual game
  const bet = reqJSON.bet || 0;
  const playerIds = reqJSON.playerIds || null;

  const playerList = [
    {
      id: userId,
      bet: parseInt(bet),
      username: username,
    },
  ];

  if (playerIds) {
    const playerIdsAsArray = playerIds.replace(/\s/g, "").split(",");

    playerIdsAsArray.forEach((playerId) => {
      playerList.push({
        id: playerId,
        bet: 100,
        username: "Dummy username",
      });
    });
  }

  bjGameManager.createGame(playerList);

  return new Response("OK.")
}
