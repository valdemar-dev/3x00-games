"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Cookies from "universal-cookie";
import styles from "./page.module.css";
import useSound from "use-sound"; 

export default function BlackjackApp() {
  const [ gameData, setGameData ] = useState(null);
  const [ loading, setLoading ] = useState(true);

  const [ isGESoundPlayed, setIsGESoundPlayed ] = useState(false);

  const router = useRouter();

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
          router.push("/games/blackjack");
          return;
        }

        const resJSON = await res.json();
        
        setGameData(resJSON.gameData);
        setLoading(false); 
      })
      .catch((error) => {
        console.error(error);
        return;
      })
  };
  
  useEffect(() => {
    getData();

    const dataInterval = setInterval(async () => {
      await getData();
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
            src={`/${card.house}.svg`} alt="card house" height="140px"/>

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
    await fetch("/api/games/blackjack/drawCard");
    cardFlip();
    
    return;
  };

  const stand = async () => {
    await fetch("/api/games/blackjack/stand");
    click();
    
    return;
  };

  const leaveGame = async () => {
    router.push("/games/blackjack");
    router.refresh();

    await fetch("/api/games/blackjack/leaveGame");

    return alert("You are leaving the game!");
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
        {gameData.isCurrentTurnPlayer ? <span>{gameData.player.username} </span> : <span><s>{gameData.player.username}</s> </span>}
        </p>

        <div className={styles.card_container}>
          {mapCards(gameData.player.cards)}
        </div>

        <p className={styles.card_total}>{gameData.player.cardTotal}</p>
      </div>

      <div id={styles.dealer}>
        <p className={styles.player_name}>Dealer</p>
        <div className={styles.card_container}>
          {mapCards(gameData.dealerCards)}
        </div>
        <p className={styles.card_total}>{gameData.dealerTotal}</p>
      </div>

      <div id={styles.game_tools}>
        <div id={styles.game_tools_inner}>
          <button 
            onClick={async () => {await drawCard()}}
          >Hit</button>

          <button
            onClick={async () => {await stand()}}
          >Stand</button>

          <button onClick={async () => {await leaveGame()}}>leave</button>
        </div>
      </div>
    </div>
  )
}
