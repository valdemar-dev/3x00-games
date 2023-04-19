import bjGameManager from "@/utils/games/BJGameManager";
import validateSessionData from "@/utils/validateSessionData";

export async function GET(req) {
  const sessionToken = req.cookies.get("sessionToken")?.value;
  const userId = req.cookies.get("userId")?.value;

  if (await validateSessionData(sessionToken, userId) === false) {
    return new Response("Invalid session token or user id.", {
      status: 401,
   });
  }

  const game = bjGameManager.getGameFromUserId(userId); 

  if (!game) return new Response("User is not in a game.", {
    status: 401,
  });

  const gameData = {
    id: game.gameId,
    cards: game.deck.cards,
    players: game.players,
    dealerCards: [game.dealer.cards[0]],
    dealerTotal: [game.dealer.cards[0].value],
    currentTurn: game.currentTurn,
    isGameOver: game.isGameOver,
    me: game.players.find((player) => player.id === userId),
  };

  if (gameData.currentTurn === "dealer") {
    gameData.dealerCards = game.dealer.cards;
    gameData.dealerTotal = game.dealer.cardTotal;

    // easy way to do the dealer turn sneakily
    game.doDealerTurn();
  }

  if (game.isGameOver === true) {
    bjGameManager.deleteGame(game.id);
  }

  return new Response(JSON.stringify({gameData: gameData}));
}
