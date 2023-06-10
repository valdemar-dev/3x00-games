import validateSessionData from "@/utils/validateSessionData";
import bjGameManager from "@/utils/games/BJGameManager";

export async function GET(req) {
  const sessionToken = req.cookies.get("sessionToken")?.value;
  const userId = req.cookies.get("userId")?.value;
  const username = req.cookies.get("username")?.value;

  if (await validateSessionData(sessionToken, userId, username) === false) {
    return new Response("Invalid session token or user id.", {
      status: 401,
   });
  }

  const game = bjGameManager.getGameFromUserId(userId); 

  if (!game) return new Response("User is not in a game.", {
    status: 403,
  }); 
  
  if (game.isCurrentTurnPlayer === false) {
    return new Response("It's not your turn.", {
      status: 403,
    });
  } 

  const card = game.deck.drawCard();

  const player = game.player;

  game.se = "cardflip";

  player.cards.push(card);

  if (player.cardTotal >= 21) {
    if (player.cardTotal > 21) {
      game.isCurrentTurnPlayer = false;
      game.playerBust = true;
      player.gameStatus = "Bust 🚫";
    } else {
      player.gameStatus = "Blackjack!";
      game.isCurrentTurnPlayer = false;
    }
  }

  //return new game data
  return new Response(JSON.stringify(card));
}
