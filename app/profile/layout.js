"use client"; 
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Layout({ children }) {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/validateSessionData").then((result) => {
      if (!result.ok) {
        setLoading(false);
        return router.push("/login");
      }

      setLoading(false);
    })
  }, []);

  if (loading) {
    return (
      <div></div>
    )
  }

  return (
    <div>{ children }</div>
  )
}
