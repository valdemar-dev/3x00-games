"use client";

import { useRouter } from "next/navigation";

export default function Blackjack() {
  const router = useRouter();

  const createGame = async (event) => {
    event.preventDefault();

    // TODO: parse multiple ids
    const playerIds = event.target[0].value;
    const bet = event.target[1].value || 100;

    const data = {
      bet: bet,
      playerIds: playerIds,
    };

    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    };

    await fetch("/api/games/blackjack/createGame", options);
  
    router.push("/games/blackjack/game");
  };

  return (
    <div>
      <h1>Blackjack!</h1>
      <form onSubmit={(event) => {createGame(event)}}>
        <label htmlFor="idlist">Enter list of user ID&apos;s separated by a comma and a space.</label><br/>
        <input name="idlist" type="text"/><br/>

        <label htmlFor="bet">Enter bet: (cannot be larger than balance or less than 0)</label><br/>
        <input name="bet" type="number" required/><br/>

        <button type="submit">Create game</button>
      </form>

    </div>
  )
}
