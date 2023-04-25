"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Cookies from "universal-cookie";
import styles from "./blackjackGame.module.css";
import useSound from "use-sound"; 

export default function BlackjackApp() {
  const [ gameData, setGameData ] = useState(null);
  const [ loading, setLoading ] = useState(true);

  const [ isGESoundPlayed, setIsGESoundPlayed ] = useState(false);

  const router = useRouter();

  const cookies = new Cookies();

  // sound effects
  const [cardFlip] = useSound("/card-flip.wav");
  const [win] = useSound("/win.wav");
  const [loss] = useSound("/loss.wav");
  const [click] = useSound("/click.mp3");
  const [click2] = useSound("/click2.wav", { volume: 0.50 });

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
  
  // plays win or loss sound
  useEffect(() => {
    if (!gameData) return;
    if (gameData?.isGameOver === false) return;
    if (isGESoundPlayed === true) return;

    if (gameData?.me.win === true) {
      win();
      setIsGESoundPlayed(true);
    } else {
      loss();
      setIsGESoundPlayed(true);
    };

    return;
  }, [gameData]);

  // fetches data at a 1,5 second interval
  useEffect(() => {
    getData();

    const dataInterval = setInterval(async () => {
      await getData();
      return;
    }, 2000)

    // clears interval when component unloads
    return () => clearInterval(dataInterval);
  }, []);

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
    await getData().then(() => {
      cardFlip();
    });
    
    return;
  };

  const stand = async () => {
    await fetch("/api/games/blackjack/stand");
    await getData().then(() => {
      click();
    });

    return;
  };

  const mapPlayers = (playerList) => {
    return playerList.map((player) => {
      if (gameData.isGameOver === true) {
        if (player.win === true) {
          if (!isNaN(player.bet)) player.bet = `Winner! ${player.bet}`;
        }
      }

      return (
        <div 
          key={player.id}
          className={styles.player}
        >
            <p 
              className={styles.player_name}>
            {player.isInGame ? <span><b>{player.username}</b> | {player.gameStatus}</span> : <span><s><b>{player.username}</b></s> | {player.gameStatus}</span>}
            </p>

          <div id={styles.card_container}>
            {mapCards(player.cards)}
          </div>
          <span className={styles.card_total}>{player.cardTotal}</span>
          <p className={styles.player_bet}>{player.bet}</p>
        </div>
      )
    })
  };

  const leaveGame = async () => {
    fetch("/api/games/blackjack/leaveGame");

    alert("You are leaving the game!");

    router.push("/games/blackjack");
    return router.refresh();
  };

  const getCurrentTurnUsername = () => {
    if (gameData.currentTurn === "dealer") return "Dealers turn";

    const player = gameData.players.find((player) => player.id === gameData.currentTurn);

    return (`${player.username}s turn`);
  };

  if (loading) {
    return (
      <div id={styles.page}></div>
    )
  }

  return (
    <div id={styles.page}>
      <h1>BJ</h1>

      <div id={styles.game_alert}>
        {gameData.statusMessage}
      </div>

      <div id={styles.current_turn}>
        <span>
          {getCurrentTurnUsername()}
        </span>
      </div>

      <div>
        <div id={styles.dealer}>
          <p className={styles.player_name}>Dealer</p>
          <div id={styles.card_container}>{mapCards(gameData.dealerCards)}</div>
          <span className={styles.card_total}>{gameData.dealerTotal}</span>
        </div>


      <div id={styles.player_list}>
        {mapPlayers(gameData.players)}
      </div>

      </div>

      <div id={styles.game_tools}>
        <div id={styles.game_tools_inner}>
          <button 
            onClick={async () => {await drawCard()}}
            disabled={cookies.get("userId") !== gameData.currentTurn || gameData.me.isInGame === false}
          >Hit</button>

          <button
            onClick={async () => {await stand()}}
            disabled={cookies.get("userId") !== gameData.currentTurn || gameData.me.isInGame === false}
          >Stand</button>

          <button
            onClick={async () => {await doubleDown()}}
            disabled={cookies.get("userId") !== gameData.currentTurn || gameData.me.isInGame === false}
          >Double down</button>

          <button onClick={async () => {await leaveGame()}}>leave</button>
        </div>
      </div>

      <p id={styles.game_id}>Game ID: {gameData.id}</p>
    </div>
  )
}
