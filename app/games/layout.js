"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function GamesLayout({ children }) {
  const router = useRouter();

  // this is for auto-redirecting the user if they aren't logged in
  useEffect(() => {
    fetch("/api/validate-token").then((result) => {
      if (!result.ok) return router.push("/login"); 
    })
  }, [])

  return (
    <div>
      { children }
    </div>
  )
}
