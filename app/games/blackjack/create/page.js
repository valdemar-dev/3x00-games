"use client";

export default function CreateBJGame() {
  const createGame = async (event) => {
    event.preventDefault();

    const maxPlayers = event.target[0].value || 1;

    const data = {
      maxPlayers: maxPlayers,
    };

    const options = {
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",  
      },
      method: "POST",
    };

    await fetch("/api/games/blackjack/createGame", options);
  }

  return (
    <div>
      <h1>Create Blackjack Game!</h1>
      <form onSubmit={(event) => {createGame(event)}}>
        <input placeholder="Max players" type="number" max={4} min={1} required/>
        <button type="submit">Create game</button>
      </form>
    </div>
  )
}
