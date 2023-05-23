'use client';

import { useRef } from "react";
import hashText from "@/utils/hashText";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import Link from "next/link";

export default function Register() {
  const infoBox = useRef();
  const router = useRouter();

  const handleRegister = async (event) => {
    event.preventDefault();

    const endpoint = "/api/register";

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
   
    infoBox.current.innerHTML = await result.text();

    if (result.status === 200) router.push("/login");
  };
  return(
    <div className={styles.register}>
      <div ref={infoBox}></div>
      <form onSubmit={(event) => {handleRegister(event)}}>
        <h2>Register</h2>
        <input type="text" placeholder="Enter your username" required/>
        <input type="password" placeholder="Create a strong password" required/>
        <div className={styles.button_group}>
          <button className="button button_primary" type="submit">Register</button>
          <Link href="/login" className="unobstructive">Already a member?</Link>
        </div>
      </form>
    </div>
  )
}
