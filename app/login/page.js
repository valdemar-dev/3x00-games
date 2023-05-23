'use client';

import { useRef } from "react";
import hashText from "@/utils/hashText";
import { useRouter } from "next/navigation";
import Cookies from "universal-cookie";
import styles from "./page.module.css";
import Link from "next/link";

export default function Login() {
  const router = useRouter();
  const infoBox = useRef();

  const handleLogin = async (event) => {
    event.preventDefault();

    const endpoint = "/api/login";

    const data = {
      username: hashText(event.target[0].value),
      password: hashText(event.target[1].value),
    };

    const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    };

    const result = await fetch(endpoint, options);
   
    if(!result.ok) {
      return infoBox.current.innerHTML = await result.text();
    }

    const cookies = new Cookies();

    const resultJSON = await result.json();

    cookies.set("sessionToken", resultJSON.sessionToken, { secure: true, sameSite: "none", maxAge: 90 * 86400, httpOnly: false, path:"/" });
    cookies.set("userId", resultJSON.userId, { secure: true, sameSite: "none", maxAge: 90 * 86400, httpOnly: false, path:"/" });
    cookies.set("username", event.target[0].value, { secure: true, sameSite: "none", maxAge: 90 * 86400, httpOnly: false, path:"/" });

    return router.push("/");
  };

  return(
    <div className={styles.login}>
      <div ref={infoBox}></div>
      <form onSubmit={(event) => {handleLogin(event)}}>
        <h2>Login</h2>
        <input type="text" placeholder="Enter your username" required/>
        <input type="password" placeholder="Enter your password" required/>
        <div className={styles.button_group}>
          <button className="button button_primary" type="submit">Login</button>
          <Link href="/register" className="unobstructive">Not a member?</Link>
        </div>
      </form>
    </div>
  )
}

