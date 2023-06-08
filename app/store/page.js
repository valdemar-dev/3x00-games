"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./page.module.css";
import Link from "next/link";

export default function Store() {
  const [items, setItems] = useState([]);
  const [showCategories, setShowCategories] = useState(true);
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
    if (items.length < 1) return;

    return items.map((item) => {
      if (categoryFilter !== null && item.category !== categoryFilter) return;

      return (
        <Link
          href={`/store/${item.id}`}
          className={`${styles.item} ${item.value > 100000 ? styles.high_value : null}`}
          key={item.id}
        >
          <h3>{item.name}</h3>

          <p>{item.description}</p>

          <span className="unobstructive">Value: ${item.value}</span>
          <Link id={styles.view_button} className="link_primary" href={`/store/${item.id}`}>View</Link> 
        </Link>
      )
    })
  };

  return ( 
    <div id={styles.store}>
      <div id={styles.search_box}>
        <input type="number" placeholder="Search"/> 
      </div>
  
      <div
        id={styles.category_picker}
        ref={categoryRef}
      >
        <div className="button_group">
          <button 
            onClick={() => {setCategoryFilter(null)}}
            className="button button_secondary button_no_hover">
            All
          </button>

          <button 
            onClick={() => {setCategoryFilter("Upgrades")}}
            className="button button_secondary button_no_hover">
            Upgrades 
          </button>

          <button 
            onClick={() => {setCategoryFilter("Clothing")}}
            className="button button_secondary button_no_hover">
            Clothing
          </button>

          <button 
            onClick={() => {setCategoryFilter("Blackjack")}}
            className="button button_secondary button_no_hover">
            Blackjack 
          </button>

          <button 
            onClick={() => {setCategoryFilter("Coinflip")}}
            className="button button_secondary button_no_hover">
            Coinflip 
          </button>

          <button 
            onClick={() => {setCategoryFilter("Food")}}
            className="button button_secondary button_no_hover">
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
