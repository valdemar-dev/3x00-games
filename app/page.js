import Image from "next/image";
import styles from "./page.module.css";

export default function Home() {
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
              <Image
                src={`/hearts.svg`} alt="card house" height="25" width="25" />
            </span>

            <span className={styles.card_center}>7</span>

            <Image
              className={styles.card_center_image}
              src={`/hearts.svg`} alt="card house" width="180" height="180"/>

            <span className={`${styles.card_br} ${styles.card_indicator}`}>
              7
              <Image
                src={`/hearts.svg`} alt="card house" width="25" height="25"/>
            </span>
          </div>

          <div className={styles.card}>
            <span className={`${styles.card_tl} ${styles.card_indicator}`}>
              3 
              <Image
                src={`/clubs.svg`} alt="card house" width="25" height="25"/>
            </span>

            <span className={styles.card_center}>3</span>

            <Image
              className={styles.card_center_image}
              src={`/clubs.svg`} alt="card house" width="180" height="180"/>

            <span className={`${styles.card_br} ${styles.card_indicator}`}>
              3 
              <Image
                src={`/clubs.svg`} alt="card clubs" width="25" height="25"/>
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
