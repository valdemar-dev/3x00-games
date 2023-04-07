'use client';

import { useRef } from "react";
import hashText from "@/utils/hashText";
import { useRouter } from "next/navigation";

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
    <div>
      <h1>Register</h1>
      <div ref={infoBox}></div>
      <form onSubmit={(event) => {handleRegister(event)}}>
        <input type="text" placeholder="username" required/>
        <input type="password" placeholder="password" required/>
        <button type="submit">Register</button>
      </form>
    </div>
  )
}
