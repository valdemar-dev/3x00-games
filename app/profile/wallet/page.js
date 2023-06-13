"use client";

import { useEffect, useState } from "react";
import styles from "./page.module.css";
import Link from "next/link";

export default function Wallet() {
  const [wallet, setWallet] = useState(null);

  useEffect(() => {
    fetch("/api/user/getWallet").then(async result => {
      if (!result.ok) return;

      const resultJSON = await result.json();

      setWallet(resultJSON);
    })
  }, []);

  const mapTransactions = () => {
    const reversedTransactions = wallet.transactions.reverse();
    const slicedTransactions = reversedTransactions.slice(0, 10);

    return slicedTransactions.map(transaction => {
      //format transaction source to
      //have a capitalised first letter
      transaction.transactionSource = transaction.transactionSource[0].toUpperCase() + transaction.transactionSource.slice(1);
      transaction.transactionAmount = transaction.transactionAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

      return (
        <div key={transaction.id} className={styles.transaction}>
          {transaction.transactionSource + ": "}
          <span className="highlight_tag">
            {`${transaction.transactionAmount < 0 ? `-$${transaction.transactionAmount *= -1}` : `+$${transaction.transactionAmount}`}`}
          </span>

          <br/>
          <p className={styles.transaction_date}>{new Date(parseInt(transaction.occuredAt)).toLocaleString()}</p>
        </div>
      )
    })
  }

  if (!wallet) {
    return (
      <div></div>
    )
  }

  return (
    <div id={styles.wallet_container}>
      <div id={styles.wallet}>
        <Link href="/profile" className="link link_primary">Back to profile</Link>

        <h3 id={styles.account_balance}>{`Account balance: `} 
          <span id={styles.balance_amount} className="highlight_tag">
            ${wallet.balance.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
          </span>
        </h3>

        <div className="button_group">
          <button className="button button_primary">Send money</button>
        </div>

        <p>
          Transaction log
          <br/>
          <span className="unobstructive">Note: only the latest 10 are shown.</span>
        </p>

        <div id={styles.transaction_log}>{mapTransactions()}</div>
      </div>
    </div>
  );
}
