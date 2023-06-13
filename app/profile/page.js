"use client";
import { useEffect, useState } from "react"
import styles from "./page.module.css";
import Link from "next/link";
import Cookies from "universal-cookie";

export default function Profile() {
  const cookies = new Cookies();
  const userId = cookies.get("userId");
  const username = cookies.get("username");

  const logOut = async () => {
    fetch("/api/user/logout").then(async (result) => {
      if (!result.ok) {
        return;
      }

      return router.push("/");
    });
  }

  return (
    <div id={styles.profile_container}>
      <div id={styles.profile}>
        <h2>{username}</h2>
        
        <div id={styles.profile_menu}>
          <Link disabled={true} href="/bonuses" className="button button_primary">Bonuses</Link>
          <Link href="/profile/wallet" className="button button_tirtiary">Wallet</Link>
          <Link href="/profile/inventory" className="button button_tirtiary">Inventory</Link>
          <Link href="/options" className="button button_tirtiary">Options</Link>
          <button onClick={() => {logOut()}} className="button button_secondary">Log out</button>
        </div>

        <span className="unobstructive">ID: {userId}</span>
      </div>
    </div>
  )
}
