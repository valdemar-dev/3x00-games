"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
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

  const gameAlert = useRef(null);

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
    };

    if (gameData?.me.win === false) {
      loss();
      setIsGESoundPlayed(true);
    }

    console.log("Played winloss sound");
    return;
  }, [gameData]);

  // fetches data at a 1,5 second interval
  useEffect(() => {
    getData();

    const dataInterval = setInterval(async () => {
      await getData();
      return;
    }, 1500)

    // clears interval when component unloads
    return () => clearInterval(dataInterval);
  }, []);

  // next 13 loading page doesnt seem to apply for-
  // useEffect fetch calls? so i do it the old fashioned way
  if (loading) {
    return (
      <div id={styles.page}></div>
    )
  }

  const mapCards = (cards) => {
    return cards.map((card) => {
      return (
        <div 
          className={styles.card}
          key={`${card.face}${card.house}`}
        >
          <span className={styles.card_tl}>
            {card.face} 
            <img
              src={`/${card.house}.svg`} alt="card house" height="20px"/>
          </span>

          <span className={styles.card_center}>{card.face}</span>

          <span className={styles.card_br}>
            {card.face} 
            <img
              src={`/${card.house}.svg`} alt="card house" height="20px"/>
          </span>
        </div>
      )
    })
  };

  const drawCard = async () => {
    cardFlip();
    setLoading(true);

    await fetch("/api/games/blackjack/drawCard")
      .then(async (res) => {
        if (!res.ok || !res) {
          router.push("/games/blackjack/");
          return console.log(res.statusText); 
        }

        const resJSON = await res.json();

        // for some javascript magic reason, 
        // gameData.me.cardTotal += n and me.cards.push(card);
        // do not automatically update the data, instead we have to find the user in the gamedata player list
        // yes, i know it's jank. but it seems to be the only way this works.
        const me = gameData.players.find((player) => player.id === gameData.me.id);
        
        gameData.me.isInGame = false;
        me.cardTotal += resJSON.value;
        me.cards.push(resJSON);

        setLoading(false);
      })  


    return;
  };

  const stand = async () => {
    click();

    setLoading(true);

    await fetch("/api/games/blackjack/stand")
      .then(async (res) => {
        if (!res.ok || !res)  {
          router.push("/games/blackjack/");
          return console.log(res.statusText);
        }

        gameData.me.isInGame = false;
        gameData.me.gameStatus = "stand";

        setLoading(false);
      })


    return;
  };

  const mapPlayers = (playerList) => {
    return playerList.map((player) => {
      if (gameData.isGameOver === true) {
        if (player.win === true) {
          player.bet = `Winner! ${player.bet}`;
        }
      }

      return (
        <div key={player.id} className={styles.player}>
            <p 
              className={styles.player_name}>
            {player.isInGame ? <span><b>{player.username}</b> | {player.gameStatus}</span> : <s><b>{player.username}</b> | {player.gameStatus}</s>}
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

  return (
    <div id={styles.page}>
      <h1>BJ</h1>

      <div id={styles.game_alert} ref={gameAlert}>

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
