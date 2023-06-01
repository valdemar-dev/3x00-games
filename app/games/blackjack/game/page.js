"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Cookies from "universal-cookie";
import styles from "./page.module.css";
import useSound from "use-sound"; 
import Image from "next/image";

export default function BlackjackApp() {
  const [ gameData, setGameData ] = useState(null);
  const [ loading, setLoading ] = useState(true);

  const [ isGESoundPlayed, setIsGESoundPlayed ] = useState(false);

  const router = useRouter();

  const infoRef = useRef();
  const [loadingDisplay, setLoadingDisplay] = useState("none");

  const showInfoBox = (text, duration) => {
    infoRef.current.innerHTML = text;
    infoRef.current.style.animation = "info_slide_in 0.5s ease-out forwards";

    setTimeout(() => {
      infoRef.current.style.animation = "info_slide_out 0.5s ease-in forwards";
    }, ((duration * 1000) || 4000));
  };


  // sound effects
  const [cardFlip] = useSound("/card-flip.wav");
  const [win] = useSound("/win.wav");
  const [loss] = useSound("/loss.wav");
  const [click] = useSound("/click.mp3");
  const [click2] = useSound("/click2.wav", { volume: 0.30 });

  const getData = async () => {
    fetch("/api/games/blackjack/getGameData")
      .then(async (res) => {
        if(!res.ok || !res) {
          throw new Error("Forbidden!") 
        }

        const resJSON = await res.json();
        
        setGameData(resJSON.gameData);
        setLoading(false); 
      })
      .catch(() => {
        return;
      })
  };
  
  useEffect(() => {
    getData();

    const dataInterval = setInterval(async () => {
      await getData().catch(() => {
        clearInterval(dataInterval); 
      });

      return;
    }, 1000)

    // clears interval when component unloads
    return () => clearInterval(dataInterval);
  }, []);

  useEffect(() => {
    if (!gameData) return;
    
    if (isGESoundPlayed == false && gameData?.isGameOver === true) {
      if (gameData?.playerWin === true) {
        win();
        setIsGESoundPlayed(true);
      } else {
        loss();
        setIsGESoundPlayed(true);
      };
    }

    return;
  }, [gameData]);

  const mapCards = (cards) => {
    return cards.map((card) => {
      return (
        <div 
          className={styles.card}
          key={`${card.face}${card.house}`}
          onMouseEnter={() => {click2()}}
        >
          <span className={`${styles.card_tl} ${styles.card_indicator}`}>
            {card.face} 
            <img
              src={`/${card.house}.svg`} alt="card house" height="20px"/>
          </span>

          <span className={styles.card_center}>{card.face}</span>

          <img
            className={styles.card_center_image}
            src={`/${card.house}.svg`} alt="card house" height="180px"/>

          <span className={`${styles.card_br} ${styles.card_indicator}`}>
            {card.face} 
            <img
              src={`/${card.house}.svg`} alt="card house" height="20px"/>
          </span>
        </div>
      )
    })
  };

  const drawCard = async () => {
    setLoadingDisplay("block");

    await fetch("/api/games/blackjack/drawCard").then((result) => {
      setLoadingDisplay("none");

      if (!result.ok) {  
        return showInfoBox("You can't do that right now!");
      }

      return cardFlip();
    });
  };

  const stand = async () => {
    setLoadingDisplay("block");

    await fetch("/api/games/blackjack/stand").then((result) => {
      setLoadingDisplay("none");

      if (!result.ok) {
        return showInfoBox("You can't do that right now!")
      }

      return click();
    });
  };

  const leaveGame = async () => {
    router.push("/games/blackjack");
    router.refresh();

    return await fetch("/api/games/blackjack/leaveGame");
  };

  if (loading) {
    return (
      <div id={styles.page}></div>
    )
  }

  return (
    <div className={styles.blackjack}>
      <div id={styles.player}>
        <p
          className={styles.player_name}>
          {gameData.player.username} [{gameData.player.cardTotal}]

          <a
            className="exit_button"
            onClick={() => {leaveGame()}}
          >
            <Image
              src={"/exit.svg"}
              alt="exit icon"
              height="20"
              width="20"
            />
          </a>

        </p>

        <div className={styles.card_container}>
          {mapCards(gameData.player.cards)}


        </div>

        <div id={styles.control_buttons}>
          <button
            onClick={async () => {await drawCard()}}
            className={`${styles.control_button} button button_secondary`}>
            Draw 
          </button>
          <button
            onClick={async () => {await stand()}}
            className={`${styles.control_button} button button_secondary`}>
            Stand
          </button>
        </div>
      </div>

      <div id={styles.dealer}>
        <p className={styles.player_name}>Dealer [{gameData.dealerTotal}]</p>
        <div className={styles.card_container}>
          {mapCards(gameData.dealerCards)}
        </div>
      </div>

      <img style={{display: loadingDisplay}} className="loading_icon" src="/loading.svg"/>
      <div ref={infoRef} className="info_box"></div>
    </div>
  )
}
