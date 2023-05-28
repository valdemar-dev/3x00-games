"use client";

import Link from 'next/link'
import './globals.css'
import { useEffect, useState } from 'react';

export const metadata = {
  title: '3x00 Games',
  description: 'All the games!',
  content:"text/html; charset=utf-8"
}

export default function RootLayout({ children }) {
  const [ userWallet, setUserWallet ] = useState(null);

  children.pageProps = {cum: "test"};
  console.log(children);

  const getData = async () => {
    fetch("/api/user/getWallet").then(async (result) => {
      if(!result.ok) return;

      const wallet = await result.json();
      
      setUserWallet(wallet?.balance);
  
      return;
    });
  
    return;
  };

  useEffect(() => {
    getData();

    const interval = setInterval(() => {
      getData().catch(() => {
        clearInterval(interval)
      });
    }, 10000)
  }, []);

  const isPositiveInt = (num) => {
    if (num >= 0) return true;

    return false;
  }

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
              {isPositiveInt(userWallet) ? "+" : "-"}${userWallet?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
            </span>
          </div>
        </nav>
        {children}
      </body>
    </html>
  )
}
