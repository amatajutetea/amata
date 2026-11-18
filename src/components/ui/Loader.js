import { useEffect, useRef } from 'react';
import styles from './Loader.module.css';

export default function Loader({ onComplete }) {
  const loaderRef = useRef(null);

  useEffect(() => {
    // On mobile, immediately complete to not block rendering
    if (window.innerWidth <= 768) {
      if (loaderRef.current) loaderRef.current.style.display = 'none';
      onComplete?.();
      return;
    }

    let gsap, tl;
    let completed = false;

    const finish = () => {
      if (completed) return;
      completed = true;
      if (loaderRef.current) {
        loaderRef.current.classList.add(styles.loaded);
        setTimeout(() => {
          if (loaderRef.current) loaderRef.current.style.display = 'none';
          onComplete?.();
        }, 350);
      } else {
        onComplete?.();
      }
    };

    // Failsafe timer: loader will NEVER block user for more than 750ms even on slow connections
    const failsafe = setTimeout(finish, 750);

    async function init() {
      try {
        const mod = await import('gsap');
        gsap = mod.gsap || mod.default;

        const loader = loaderRef.current;
        if (!loader || completed) return;

        tl = gsap.timeline({
          onComplete: () => {
            clearTimeout(failsafe);
            finish();
          },
        });

        tl.to(`.${styles.loaderInner}`,    { y: 0,      duration: 0.25, ease: 'power4.out' })
          .to(`.${styles.loaderSubInner}`,  { y: 0, opacity: 1, duration: 0.2, ease: 'power3.out' }, '-=.1')
          .to(`.${styles.loaderInner}`,     { y: '-100%', duration: 0.25, ease: 'power4.in', delay: 0.1 })
          .to(`.${styles.loaderSubInner}`,  { y: '-100%', opacity: 0, duration: 0.18, ease: 'power4.in' }, '<');
      } catch (e) {
        finish();
      }
    }

    init();
    return () => {
      clearTimeout(failsafe);
      tl?.kill();
    };
  }, [onComplete]);

  return (
    <div ref={loaderRef} className={styles.loader} id="loader">
      <div className={styles.loaderText}>
        <span className={styles.loaderInner}>A M A T A</span>
      </div>
      <div className={styles.loaderSub}>
        <span className={styles.loaderSubInner}>不死の緑 · अमृत हरित</span>
      </div>
    </div>
  );
}
