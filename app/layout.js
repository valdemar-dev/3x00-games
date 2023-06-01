"use client";

import Link from 'next/link'
import './globals.css'
import { useEffect, useState } from 'react';

export default function RootLayout({ children }) {
  const [ userWallet, setUserWallet ] = useState(null);

  useEffect(() => {
    fetch("/api/user/getWallet").then(async (result) => {
      if(!result.ok) return;

      const wallet = await result.json();
      
      setUserWallet(wallet.balance > 0 ? `+$${wallet.balance}` : `${wallet.balance}`);
  
      return;
    });
  }, []);

  return (
    <html lang="en">
      <body>
        <nav className="nav">
          <div className="nav_logo">
            <Link className='link_secondary' href="/">3x00-Games</Link>
          </div>

          <div className="nav_hide">
            <a className='link_secondary'></a>
            <Link href="/games">Games</Link>
            <Link href="/store">Store</Link>
            <span className='highlight_tag'>
	      {userWallet || "+$0"}
            </span>
          </div>
        </nav>
        {children}
      </body>
    </html>
  )
}
