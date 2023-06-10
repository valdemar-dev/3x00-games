"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./page.module.css";
import Link from "next/link";

export default function Store() {
  const [items, setItems] = useState([]);

  const [itemFilter, setItemFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState(null);

  const categoryRef = useRef(null);
  
  useEffect(() => {
    fetch("/api/store/getItems").then(async (result) => {
      if (!result.ok) return;

      const resultJSON = await result.json();

      setItems(resultJSON);
    });
  }, []);

  const mapItems = () => {
    const newItems = items.filter((item) => {
      if(!categoryFilter) return true;

      return item.category === categoryFilter;
    });

    if (newItems < 1) return (
      <div id={styles.no_items}>
        No items found!
      </div>
    );

    return newItems.map((item) => {
      if (itemFilter.length > 0 && !item.name.toLowerCase().includes(itemFilter.toLowerCase())) return;

      return (
        <Link
          href={`/store/${item.id}`}
          className={`${styles.item}`}
          key={item.id}
          as={Link}
        >
          <h3>{item.name}</h3>

          <span className="highlight_tag">${item.value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</span>

          <p>{item.description}</p>
        </Link>
      )
    })
  };

  return ( 
    <div id={styles.store}>
      <div id={styles.search_box}>
        <input onChange={(e) => setItemFilter(e.target.value)} type="text" placeholder="Search"/> 
      </div>
  
      <div
        id={styles.category_picker}
        ref={categoryRef}
      >
        <div className="button_group">
          <button 
            onClick={() => {setCategoryFilter(null)}}
            className={`button button_tirtiary button_no_hover ${categoryFilter === null ? "button_active" : ""}`}>
            All
          </button>

          <button 
            onClick={() => {setCategoryFilter("Upgrades")}}
            className={`button button_tirtiary button_no_hover ${categoryFilter === "Upgrades" ? "button_active" : ""}`}>
            Upgrades 
          </button>

          <button 
            onClick={() => {setCategoryFilter("Clothing")}}
            className={`button button_tirtiary button_no_hover ${categoryFilter === "Clothing" ? "button_active" : ""}`}>
            Clothing
          </button>

          <button 
            onClick={() => {setCategoryFilter("Blackjack")}}
            className={`button button_tirtiary button_no_hover ${categoryFilter === "Blackjack" ? "button_active" : ""}`}>
            Blackjack 
          </button>

          <button 
            onClick={() => {setCategoryFilter("Coinflip")}}
            className={`button button_tirtiary button_no_hover ${categoryFilter === "Coinflip" ? "button_active" : ""}`}>
            Coinflip 
          </button>

          <button 
            onClick={() => {setCategoryFilter("Food")}}
            className={`button button_tirtiary button_no_hover ${categoryFilter === "Food" ? "button_active" : ""}`}>
            Food 
          </button>
        </div>
      </div>

      <div id={styles.item_list}>
        {mapItems()}
      </div>
    </div>
  )
}
