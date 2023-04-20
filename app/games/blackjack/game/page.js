"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Cookies from "universal-cookie";
import styles from "./blackjackGame.module.css";

export default function BlackjackApp() {
  const [ gameData, setGameData ] = useState(null);
  const [ loading, setLoading ] = useState(true);

  const router = useRouter();

  const cookies = new Cookies();

  const getData = async () => {
    fetch("/api/games/blackjack/getGameData")
      .then(async (res) => {
        if(!res.ok || !res) {
          router.push("/games/blackjack");
          router.refresh();
          return;
        }

        const resJSON = await res.json();

        setGameData(resJSON.gameData);
        setLoading(false);
      }).catch((error) => {
          console.error(error);
          return;
        })
  };

  useEffect(() => {
    getData();

    const dataInterval = setInterval(() => {
      getData();
      return;
    }, 1500)

    // clears interval when component unloads
    return () => clearInterval(dataInterval);
  }, []);

  // next 13 loading page doesnt seem to apply for-
  // useEffect fetch calls? so i do it the old fashioned way
  if (loading) {
    return (
      <div></div>
    )
  }

  const mapCards = (cards) => {
    return cards.map((card) => {
      return (
        <span 
          className={styles.card} 
          key={`${card.value}${card.house}`}
        >
          {card.value} <img src={`/${card.house}.svg`} alt="Card house" height="30px"/> 
        </span>
      )
    })
  };

  const drawCard = async () => {
    setLoading(true);

    await fetch("/api/games/blackjack/drawCard")
      .then(async (res) => {
        if (!res.ok || !res) {
          router.push("/games/blackjack/");
          return router.refresh();
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
      })  

    setLoading(false);
    return;
  };

  const stand = async () => {
    setLoading(true);

    await fetch("/api/games/blackjack/stand")
      .then(async (res) => {
        if (!res.ok || !res)  {
          router.push("/games/blackjack/");
          return router.refresh();
        }

        gameData.me.isInGame = false;
        gameData.me.gameStatus = "stand";
      })


    setLoading(false);
    return;
  };

  const mapPlayers = (playerList) => {
    return playerList.map((player) => {
      return (
        <div key={player.id}>
          <h4>{player.id}</h4>
          <div id={styles.card_container}>
            {mapCards(player.cards)}
          </div>
          <br/>
          <span>Total: {player.cardTotal}</span>
          <br/>
          <span>Game status: ({player.gameStatus})</span>
          <br/>
          <span>Bet: {player.bet}</span>
          <hr/>
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

  return (
    <div id={styles.page}>
      <h1>Blackjack game!</h1>
      <h4>Current turn: {gameData.currentTurn}</h4>

      <div>
        <h4>Dealer</h4>
        <div id={styles.card_container}>{mapCards(gameData.dealerCards)}</div>
        <span>Total: {gameData.dealerTotal}</span>
        <hr/>

        {mapPlayers(gameData.players)}
      </div>


      <div>
        <h4>Game tools</h4>

        <button 
          onClick={async () => {await drawCard()}}
          //disable controls if it is not the players turn
          disabled={cookies.get("userId") !== gameData.currentTurn || gameData.me.isInGame === false}
        >Draw card</button>

        <button
          onClick={async () => {await stand()}}

          disabled={cookies.get("userId") !== gameData.currentTurn || gameData.me.isInGame === false}
        >Stand</button>

        <button 
          onClick={async () => {await leaveGame()}}>Exit game</button>
      </div>
      <p>Game ID: {gameData.id}</p>

      <button onClick={() => {console.log(gameData)}}>Log all gameData</button>
      <button onClick={() => {console.log(gameData.cards)}}>Log deck cards</button> 
    </div>
  )
}
