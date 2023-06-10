"use client";

import useSound from "use-sound";
import styles from "./page.module.css";
import { useEffect, useRef, useState } from "react";

export default function Coinflip(props) {
  const [coinflip] = useSound("/coinflip.mp3");

  const infoRef = useRef();
  const resultRef = useRef();

  const [loadingDisplay, setLoadingDisplay] = useState("none");
  const [areControlsDisabled, setAreControlsDisabled] = useState(false);
  const [headsOrTails, setHeadsOrTails] = useState(null);

  const showInfoBox = (text, duration) => {
    infoRef.current.innerHTML = text;
    infoRef.current.style.animation = "info_slide_in 0.5s ease-out forwards";
    
    try {
      setTimeout(() => {
        infoRef.current.style.animation = "info_slide_out 0.5s ease-in forwards";
      }, ((duration * 1000) || 4000));
    } catch {
      return;
    }
  };

  const coinFlip = async (event) => {
    event.preventDefault();

    //prevents user from spamming spin
    setAreControlsDisabled(true);

    const bet = event.target[2].value || 0;

    // Confirm bet size.
    if (!bet || bet < 1) {
      showInfoBox("You must provide a bet greater than $0.");
      setAreControlsDisabled(false);
      return;
    } else if (bet > 15000) {
      showInfoBox("The provided bet is too large!");
      setAreControlsDisabled(false);
      return;
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

    setLoadingDisplay("block");

    const result = await fetch("/api/games/coinflip/", options);

    if (!result.ok) {
      showInfoBox(await result.text());
      setAreControlsDisabled(false);
      return setLoadingDisplay("none");
    }

    const resultJSON = await result.json();

    setLoadingDisplay("none");

    coinflip();

    if (resultJSON.result === "heads") {
      resultRef.current.style.animation = `${styles.coinflip_heads} 5s ease-out forwards`;
    } else {
      resultRef.current.style.animation = `${styles.coinflip_tails} 5s ease-out forwards`;
    }

    setTimeout(() => {
      showInfoBox(resultJSON.win  ? "You win!" : "You lose!");
    }, 5000)

    setTimeout(() => {
      resultRef.current.style.animation = `${styles.coinflip_idle} 2s ease-in-out forwards infinite`;
      setAreControlsDisabled(false);
    }, 8000);
  }

  return (
    <div className={styles.coinflip}>
      <form id={styles.coinflip_form} onSubmit={(event) => {coinFlip(event)}}>
        <div id={styles.coin_call}>
          <button 
            className="button button_secondary" 
            disabled={areControlsDisabled} 
            type="submit"
            onClick={() => {setHeadsOrTails("heads")}}
          >
            Heads?
            </button>

          <div id={styles.coin} ref={resultRef}></div>    
          <button 
            className="button button_secondary" 
            disabled={areControlsDisabled} 
            type="submit"
            onClick={() => {setHeadsOrTails("tails")}}
          >
            Tails?
          </button>  
        </div>

        <input disabled={areControlsDisabled} type="number" placeholder="Enter your bet.." required/>
      </form>

      <img style={{display: loadingDisplay}} className="loading_icon" src="/loading.svg"/>
      <div ref={infoRef} className="info_box">
      </div>
    </div>
  )
}
