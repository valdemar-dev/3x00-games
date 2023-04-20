"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function GamesLayout({ children }) {
  const router = useRouter();

  // this is for auto-redirecting the user if they aren't logged in
  useEffect(() => {
    fetch("/api/validateSessionData").then((result) => {
      if (!result.ok) router.push("/login"); 
      return;
    })
  }, [])

  return (
    <div>
      { children }
    </div>
  )
}
