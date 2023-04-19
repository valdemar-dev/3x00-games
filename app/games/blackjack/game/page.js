"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Cookies from "universal-cookie";
  
export default function BlackjackApp() {
  const [ gameData, setGameData ] = useState(null);
  const [ loading, setLoading ] = useState(true);

  const router = useRouter();

  const cookies = new Cookies();

  // fetch game data once on page load for faster load times
  // then refresh the data with a three second interval.
  useEffect(() => {
    const interval = setInterval(() => {
      fetch("/api/games/blackjack/getGameData")
      .then(async (res) => {
        if (!res.ok || !res) {
          return clearInterval(interval);
        }

        const resJSON = await res.json();

        setGameData(resJSON.gameData);
        setLoading(false);

        if (resJSON.gameData.isGameOver === true) {
          clearInterval(interval);
        }

        return;
      })
      .catch((error) => {
          console.error(error);

          clearInterval(interval);

          return;
      });
    }, 3000);
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
        <span key={`${card.value}${card.house}`}><br/>{card.value} of {card.house}</span>
      )
    })
  };

  const drawCard = async () => {
    setLoading(true);

    await fetch("/api/games/blackjack/drawCard")
      .then(async (res) => {
        if (!res.ok || !res) {
          return clearInterval(interval); 
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
          return clearInterval(interval);
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
          <p>Cards: [{mapCards(player.cards)}<br/>]</p>
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

  return (
    <div>
      <h1>Blackjack game!</h1>
      <h4>Current turn: {gameData.currentTurn}</h4>

      <div>
        <h4>Dealer</h4>
        <p>Cards: [{mapCards(gameData.dealerCards)}<br/>]</p>
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
      </div>
      <p>Game ID: {gameData.id}</p>

      <button onClick={() => {console.log(gameData)}}>Log all gameData</button>
      <button onClick={() => {console.log(gameData.cards)}}>Log deck cards</button> 
    </div>
  )
}
