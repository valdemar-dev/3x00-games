import Link from "next/link";
import styles from "./page.module.css";

export default function Games() {
  return (
    <div className={styles.games}>
      <div id={styles.game_list}>
        <Link href="/games/blackjack" className={styles.game}>
          <h3>Blackjack</h3>

          <p>Aim for 21 without going over.</p>

          <span className="unobstructive">Max bet: 20k</span>
          <Link id={styles.play_button} className="link_primary" href="/games/blackjack">Play</Link>
        </Link>

        <Link href="/games/coinflip" className={styles.game}>
          <h3>Coinflip</h3>

          <p>Call the side before the flip.</p>

          <span className="unobstructive">Max bet: 15k</span>
          <Link id={styles.play_button} className="link_primary" href="/games/coinflip">Play</Link>
        </Link>

        <Link href="/games/diceroll" className={styles.game}>
          <h3>Dice roll</h3>

          <p>Roll an n-sided die.</p>

          <span className="unobstructive">Max bet: 10k</span>
          <Link id={styles.play_button} className="link_primary" href="/games/diceroll">Play</Link>
        </Link>
      </div>
    </div>
  )
}
