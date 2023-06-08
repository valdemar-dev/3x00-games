"use client";

import { useEffect, useState } from "react"

export default function Item({ params, searchParams }) {
  const [item, setItem] = useState({});
  const [inventoryItem, setInventoryItem] = useState({});

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

      console.log(resultJSON.items);
      const item = resultJSON.items.find(item => item.itemId === params.item);

      setInventoryItem(item);
    })
  }, []);

  return (
    <div>
      ID: {item.id}
      <br/>
      Name: {item.name}
      <br/>
      Category: {item.category}

      <br/>
      Value: ${item.value}
      <br/>
      Desc: {item.description}

      <br/>
      Owned: {inventoryItem?.itemCount}
    </div>
  )
}
