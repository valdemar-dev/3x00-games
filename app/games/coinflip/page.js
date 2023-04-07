"use client";

import { useEffect, useRef, useState } from "react";

export default function Coinflip() {
  const [ userWalletBalance, setUserWallet ] = useState(null);

  const resultRef = useRef();

  useEffect(() => {
    fetch("/api/user/get-wallet").then(async (result) => {
      const wallet = await result.json();

      setUserWallet(wallet?.balance);

      return;
    });

    return;
  }, []);

  const coinFlip = async (event) => {
    event.preventDefault();

    const bet = event.target[0].value || 0;
    const headsOrTails = event.target[1].value || "heads";

    const data = {
      bet: bet, 
      headsOrTails: headsOrTails,
    };

    const options = {
      method: "POST",
      body: JSON.stringify(data), 
      headers: {
        "Content-Type": "application/json",
      },
    };

    const response = await fetch("/api/games/coinflip/", options);

    if(!response.ok) return;

    const responseJSON = await response.json();

    resultRef.current.innerHTML = responseJSON.result;
    setUserWallet(responseJSON.newBalance);

    return;
  }

  return (
    <div>
      <h1>Coinflip!</h1>
      <div ref={resultRef}></div>
      <div>Coins: {userWalletBalance}</div>

      <form onSubmit={(event) => {coinFlip(event)}}>
        <input type="number" placeholder="Bet" required/>

        <select>
          <option value="heads">Heads</option>
          <option value="tails">Tails</option>
        </select>

        <button type="submit">Flip the coin!</button>
      </form>
    </div>
  )
}
