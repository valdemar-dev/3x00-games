"use client";

import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import Link from "next/link";
import { useRef, useState } from "react";
import Image from "next/image";

export default function Blackjack() {
  const router = useRouter();

  const infoRef = useRef();
  const [loadingDisplay, setLoadingDisplay] = useState("none");

  const showInfoBox = (text, duration) => {
    infoRef.current.innerHTML = text;
    infoRef.current.style.animation = "info_slide_in 0.5s ease-out forwards";

    setTimeout(() => {
      //try catch because the user can navigate outside of the page
      //before the timeout has time to complete
      try {
        infoRef.current.style.animation = "info_slide_out 0.5s ease-in forwards";
      } catch {
        return;
      }
    }, ((duration * 1000) || 4000));
  };

  const createGame = async (event) => {
    event.preventDefault();

    setLoadingDisplay("block");

    const bet = event.target[0].value;

    const data = {
      bet: bet,
    };

    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    };

    const response = await fetch("/api/games/blackjack/createGame", options);

    setLoadingDisplay("none");

    if(!response.ok) {
      showInfoBox(await response.text(), 3);
    } else {
      router.push("/games/blackjack/game");
    }
  };

  return (
    <div className={styles.blackjack}>
      <form className={styles.blackjack_form} onSubmit={(event) => {createGame(event)}}>
        <div id={styles.form_header}>
          <h2>Blackjack</h2>
        </div>

        <div id={styles.form_inputs}>
          <input name="bet" type="number" min={0} max={20000} required placeholder="Bet"/>

          <button
            className="button button_primary"
            type="submit">Play</button>
        </div>

        <div id={styles.form_footer} className="unobstructive">Note: 5 card charlie is on.</div>
      </form>

      <Image style={{display: loadingDisplay}} width="50" height="50" className="loading_icon" src="/loading.svg"/>
      <div ref={infoRef} className="info_box"></div>
    </div>
  )
}
