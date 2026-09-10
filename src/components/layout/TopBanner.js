import styles from './TopBanner.module.css';

export default function TopBanner() {
  const marqueeContent = (
    <div className={styles.marqueeItem}>
      <span className={styles.sparkle}>✨</span>
      <span className={styles.mainText}>SPECIAL LAUNCH OFFER:</span>
      <span className={styles.highlightText}>100% OFF SHIPPING</span>
      <span className={styles.subText}>on all orders &bull; Limited Time</span>
    </div>
  );

  return (
    <div className={styles.topBanner}>
      <div className={styles.marqueeBox}>
        <div className={styles.marqueeTrack}>
          {marqueeContent}
          {marqueeContent}
          {marqueeContent}
        </div>
      </div>
    </div>
  );
}
