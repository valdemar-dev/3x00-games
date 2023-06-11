"use client";

import { useEffect, useRef, useState } from "react"
import styles from "./page.module.css";

export default function Item({ params, searchParams }) {
  const infoRef = useRef();

  const [loadingDisplay, setLoadingDisplay] = useState("none");

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

  const [item, setItem] = useState([]);
  const [inventoryItem, setInventoryItem] = useState({ itemCount: 0, });
  const [buyOrSell, setBuyOrSell] = useState(null);
  
  // fetch relevant data
  useEffect(() => {
    fetch("/api/store/getItems").then(async (result) => {
      if (!result.ok) return;

      const resultJSON = await result.json();

      const item = resultJSON.find(item => item.id === params.item); 

      setItem(item);
    })

    fetch("/api/store/getInventory").then(async (result) => {
      if (!result.ok) return;

      const resultJSON = await result.json();

      const item = resultJSON.items.find(item => item.itemId === params.item);

      setInventoryItem(item || null);
    })
  }, []);

  const handleShopForm = async (event) => {
    event.preventDefault();

    if (!buyOrSell) return;

    const amount = event.target[2].value;

    const data = {
      item: item.id,
      amount: amount,
    }

    const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    };

    const endpoint = `/api/store/${buyOrSell}`;

    setLoadingDisplay("block");

    const result = await fetch(endpoint, options);

    setLoadingDisplay("none");

    if (result.ok) {
      if (buyOrSell === "buy") {
        setInventoryItem(inventoryItem => ({
          itemCount: inventoryItem.itemCount += parseInt(amount), 
        }));
      } else {
        setInventoryItem(inventoryItem => ({
          itemCount: inventoryItem.itemCount -= parseInt(amount),
        }))
      }
    }

    return showInfoBox(await result.text());
  };

  return (
    <div id={styles.item}>
      <div id={styles.item_inner}>
        <h3>{item.name}</h3>
        <p
          className="highlight_tag"
          id={styles.item_price}>${item.value}</p>
        
        <p>{item.description}</p>
        
        <p className="unobstructive">You own {inventoryItem?.itemCount || 0} of this item.</p>

        <form onSubmit={(event) => {handleShopForm(event)}}>
          <button
            onClick={() => {setBuyOrSell("buy")}}
            type="submit"
            className="button button_primary">
            Buy
          </button>
          <button
            onClick={() => {setBuyOrSell("sell")}}
            type="submit"
            className="button button_tirtiary">
            Sell
          </button>

          <input required type="number" placeholder="Amount to buy/sell"/>
        </form>
      </div>

      <img style={{display: loadingDisplay}} className="loading_icon" src="/loading.svg"/>
      <div ref={infoRef} className="info_box"></div> 
    </div>
  )
}
