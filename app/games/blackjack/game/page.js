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
  const [areControlsDisabled, setAreControlsDisabled] = useState(false);

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

  // sound effects
  const [cardFlip] = useSound("/card-flip.wav", { volume: 0.40 });
  const [win] = useSound("/win.wav", { volume: 0.30 });
  const [loss] = useSound("/loss.wav", { volume: 0.30 });
  const [click] = useSound("/click.mp3", { volume: 0.40 });
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
    }, 900)

    // clears interval when component unloads
    return () => clearInterval(dataInterval);
  }, []);

  useEffect(() => {
    if (!gameData) return;
    
    if(gameData?.se !== null) {
      if (gameData.se === "cardflip") {
        cardFlip();
      } else if (gameData.se === "click") {
        click();
      }
    }

    // plays sound that indicates that the dealer is drawing a card
    if (gameData?.isCurrentTurnPlayer === false && gameData?.isGameOver === false && gameData?.dealerDelayTurnCount > 1) {
      cardFlip();
    }

    if (isGESoundPlayed == false && gameData?.isGameOver === true) {
      console.log(gameData);
      if (gameData?.playerWin === true) {
        win();

        setIsGESoundPlayed(true);

        showInfoBox("You win!", 30);

      } else {
        loss();

        setIsGESoundPlayed(true);

        showInfoBox("You lose!", 30);
      };

      setAreControlsDisabled(true);
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
            <Image
              src={`/${card.house}.svg`} alt="card house" height="20" width="20"/>
          </span>

          <span className={styles.card_center}>{card.face}</span>

          <Image
            className={styles.card_center_image}
            src={`/${card.house}.svg`} alt="card house" height="180" width="180"/>

          <span className={`${styles.card_br} ${styles.card_indicator}`}>
            {card.face} 
            <Image
              src={`/${card.house}.svg`} alt="card house" height="20" width="20"/>
          </span>
        </div>
      )
    })
  };

  const drawCard = async () => {
    setLoadingDisplay("block");

    await fetch("/api/games/blackjack/drawCard").then(async (result) => {
      setLoadingDisplay("none");

      if (!result.ok) {  
        return showInfoBox("You can't do that right now!");
      }
    });
  };

  const stand = async () => {
    setLoadingDisplay("block");

    await fetch("/api/games/blackjack/stand").then(async (result) => {
      setAreControlsDisabled(true);
      setLoadingDisplay("none");

      if (!result.ok) {
        return showInfoBox("You can't do that right now!")
      }
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
        </p>

        <div className={styles.card_container}>
          {mapCards(gameData.player.cards)}
        </div>

        <div id={styles.control_buttons}>
          <button
            disabled={areControlsDisabled}
            onClick={async () => {await drawCard()}}
            className={`${styles.control_button} button button_secondary`}>
            Hit 
          </button>
          <button
            disabled={areControlsDisabled}
            onClick={async () => {await stand()}}
            className={`${styles.control_button} button button_secondary`}>
            Stand
          </button>
          <button
            disabled={!gameData?.isGameOver}
            className="button button_secondary"
            onClick={() => {leaveGame()}}>
            Quit 
          </button>
        </div>
      </div>

      <div id={styles.dealer}>
        <p className={styles.player_name}>Dealer [{gameData.dealerTotal}]</p>
        <div className={styles.card_container}>
          {mapCards(gameData.dealerCards)}
        </div>
      </div>

      <Image style={{display: loadingDisplay}} width="50" height="50" className="loading_icon" src="/loading.svg"/>
      <div ref={infoRef} className="info_box"></div>
    </div>
  )
}
