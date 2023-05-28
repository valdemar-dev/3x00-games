import styles from "./page.module.css";

export default function Home(pageProps) {
  console.log(pageProps);
  
  return (
    <div>
      <div className={styles.home}>
        <div id={styles.hero_text}>
          <h1>Gambling,<br/>but with fake money.</h1>

          <p>What if you could feed your never-ending gambling addiction, <br/> without spending any actual money?</p>

          <div className="button_group">
            <a className="button button_primary" href="/register">Register</a>
            <a className="button button_secondary" href="/games">Games</a>
          </div>
        </div>

        <div id={styles.card_image}>
          <div className={styles.card}>
            <span className={`${styles.card_tl} ${styles.card_indicator}`}>
              7 
              <img
                src={`/hearts.svg`} alt="card house" height="25px"/>
            </span>

            <span className={styles.card_center}>7</span>

            <img
              className={styles.card_center_image}
              src={`/hearts.svg`} alt="card house" height="180px"/>

            <span className={`${styles.card_br} ${styles.card_indicator}`}>
              7
              <img
                src={`/hearts.svg`} alt="card house" height="25px"/>
            </span>
          </div>

          <div className={styles.card}>
            <span className={`${styles.card_tl} ${styles.card_indicator}`}>
              3 
              <img
                src={`/clubs.svg`} alt="card house" height="25px"/>
            </span>

            <span className={styles.card_center}>3</span>

            <img
              className={styles.card_center_image}
              src={`/clubs.svg`} alt="card house" height="180px"/>

            <span className={`${styles.card_br} ${styles.card_indicator}`}>
              3 
              <img
                src={`/clubs.svg`} alt="card house" height="25px"/>
            </span>
          </div>
        </div>
      </div>
    
      <span style={{position:"absolute", left: "1rem", bottom: "1rem", opacity:"20%"}}>Made with Next 13, hosted on Vercel.</span>
    </div>
  )
}
