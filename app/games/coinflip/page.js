"use client";

import useSound from "use-sound";
import styles from "./page.module.css";
import { useEffect, useRef, useState } from "react";

export default function Coinflip() {
  const [coinflip] = useSound("/coinflip.mp3");

  const resultRef = useRef();

  const coinFlip = async (event) => {
    event.preventDefault();

    coinflip();
    resultRef.current.style.animation = `${styles.coinflip_loading} 0.3s linear forwards infinite`;

    const bet = event.target[0].value || 0;
    const headsOrTails = event.target[1].value || "heads";

    if (!bet || bet < 1) {
      return;
      // INFORM THA THE BET IS BAD
    }

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

    const result = await fetch("/api/games/coinflip/", options);

    const resultJSON = await result.json();

    if (resultJSON.result === "heads") {
      resultRef.current.style.animation = `${styles.coinflip_heads} 5s ease-out forwards`;
    } else {
      resultRef.current.style.animation = `${styles.coinflip_tails} 5s ease-out forwards`;
    }
  }

  return (
    <div className={styles.coinflip}>
      <h1>Coinflip!</h1>
      <div id={styles.coin} ref={resultRef}>H</div>
      <form onSubmit={(event) => {coinFlip(event)}}>
        <input type="number" placeholder="Bet" required min={1}/>

        <select required>
          <option value="heads">Heads</option>
          <option value="tails">Tails</option>
        </select>

        <button type="submit">Flip the coin!</button>
      </form>
    </div>
  )
}
