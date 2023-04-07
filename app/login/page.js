'use client';

import { useRef } from "react";
import hashText from "@/utils/hashText";
import { useRouter } from "next/navigation";

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

    return router.push("/");
  };

  return(
    <div>
      <h1>Login</h1>
      <div ref={infoBox}></div>
      <form onSubmit={(event) => {handleLogin(event)}}>
        <input type="text" placeholder="username" required/>
        <input type="password" placeholder="password" required/>
        <button type="submit">Login</button>
      </form>
    </div>
  )
}

