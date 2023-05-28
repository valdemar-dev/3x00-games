'use client';

import { useRef, useState } from "react";
import hashText from "@/utils/hashText";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import Link from "next/link";

export default function Register() {
  const infoRef = useRef();
  const router = useRouter();

  const [loadingDisplay, setLoadingDisplay] = useState("none");

  const showInfoBox = (text, duration) => {
    infoRef.current.innerHTML = text;
    infoRef.current.style.animation = "info_slide_in 0.5s ease-out forwards";

    setTimeout(() => {
      infoRef.current.style.animation = "info_slide_out 0.5s ease-in forwards";
    }, ((duration * 1000) || 4000));
  };

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

    setLoadingDisplay("block");

    const result = await fetch(endpoint, options);

    if(!result.ok) {
      setLoadingDisplay("none");
      return showInfoBox(await result.text());
    }

    setLoadingDisplay("none");
    return router.push("/login");
  };
  return(
    <div className={styles.register}>
      <form onSubmit={(event) => {handleRegister(event)}}>
        <h2>Register</h2>
        <input type="text" placeholder="Enter your username" required/>
        <input type="password" placeholder="Create a strong password" required/>
        <div className={styles.button_group}>
          <button className="button button_primary" type="submit">Register</button>
          <Link href="/login" className="unobstructive">Already a member?</Link>
        </div>
      </form>

      <img style={{display: loadingDisplay}} className="loading_icon" src="/loading.svg"/>
      <div ref={infoRef} className="info_box"></div>  
    </div>
  )
}
