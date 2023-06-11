"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

//
// verifies that the user is logged in
//
export default function Layout({ children }) {
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  useEffect(() => {
    fetch("/api/validateSessionData").then((result) => {
      if (result.ok) return setLoading(false);
      router.push("/login");
      setLoading(false);
      router.refresh();
    })
  }, [])

  if (loading) {
    return (
      <div></div>
    )
  }

  return (
    <>{ children }</>
  )
}
