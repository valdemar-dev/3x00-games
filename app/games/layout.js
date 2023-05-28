"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function GamesLayout({ pageProps, children }) {
  console.log(pageProps);
  const router = useRouter();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/validateSessionData").then((result) => {
      if (!result.ok) router.push("/login"); 
      setLoading(false);
      return;
    })
  }, [])

  if (loading) return (
    <div></div>
  )

  return (
    <div>
      { children }
    </div>
  )
}
