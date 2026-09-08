import styles from './TopBanner.module.css';

export default function TopBanner() {
  return (
    <div className={styles.topBanner}>
      <span className={styles.sparkle}>✨</span>
      <span className={styles.mainText}>Special Launch Offer:</span>
      <span className={styles.highlightText}>100% OFF Shipping</span>
      <span className={styles.subText}>on all orders &bull; Limited Time</span>
    </div>
  );
}
