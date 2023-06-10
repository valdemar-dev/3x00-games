"use client";

import Link from 'next/link'
import './globals.css'
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

export default function RootLayout({ children }) {
  const [ userWallet, setUserWallet ] = useState(null);

  const getData = async () => {
    await fetch("/api/user/getWallet").then(async (result) => {
      if (!result.ok) return;

      const wallet = await result.json();

      const formattedWallet = Intl.NumberFormat('en-US', {
        notation: "compact",
        maximumFractionDigits: 1
      }).format(wallet.balance);

      setUserWallet(`$${formattedWallet}`);
    })
  };

  useEffect(() => {
    getData();

    setInterval(() => {
      getData();
    }, 10000)
  }, []);

  return (
    <html lang="en">
      <body>
        <nav className="nav">
          <div className="nav_logo">
            <Link id="nav_logo" className='link_secondary' href="/">3x00</Link>
          </div>

          <div 
            className="nav_hide">
            <Link href="/games">Games</Link>
            <Link href="/store">Store</Link>
            <Link href="/profile" className="highlight_tag">
              {userWallet?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") || "+$0"}
              <Image
                src={"/profile.svg"}
                height="25"
                width="25"/>
            </Link>
          </div>
        </nav>
        {children}
      </body>
    </html>
  )
}
