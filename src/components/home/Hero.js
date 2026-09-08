import { useEffect, useRef } from 'react';
import Link from 'next/link';
import styles from './Hero.module.css';

/* ── Mandala SVG (inlined, no external request) ── */
function MandalaDecor({ className }) {
  return (
    <svg className={className} viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
      <circle cx="200" cy="200" r="195" fill="none" stroke="#0a2d33" strokeWidth="1" />
      <circle cx="200" cy="200" r="158" fill="none" stroke="#0a2d33" strokeWidth=".5" />
      <circle cx="200" cy="200" r="118" fill="none" stroke="#0a2d33" strokeWidth=".5" />
      <circle cx="200" cy="200" r="78"  fill="none" stroke="#0a2d33" strokeWidth=".5" />
      <g opacity=".5">
        <ellipse cx="200" cy="122" rx="18" ry="78" fill="none" stroke="#0a2d33" strokeWidth=".4" />
        <ellipse cx="200" cy="122" rx="18" ry="78" fill="none" stroke="#0a2d33" strokeWidth=".4" transform="rotate(45 200 200)" />
        <ellipse cx="200" cy="122" rx="18" ry="78" fill="none" stroke="#0a2d33" strokeWidth=".4" transform="rotate(90 200 200)" />
        <ellipse cx="200" cy="122" rx="18" ry="78" fill="none" stroke="#0a2d33" strokeWidth=".4" transform="rotate(135 200 200)" />
        <ellipse cx="200" cy="122" rx="18" ry="78" fill="none" stroke="#0a2d33" strokeWidth=".4" transform="rotate(180 200 200)" />
        <ellipse cx="200" cy="122" rx="18" ry="78" fill="none" stroke="#0a2d33" strokeWidth=".4" transform="rotate(225 200 200)" />
        <ellipse cx="200" cy="122" rx="18" ry="78" fill="none" stroke="#0a2d33" strokeWidth=".4" transform="rotate(270 200 200)" />
        <ellipse cx="200" cy="122" rx="18" ry="78" fill="none" stroke="#0a2d33" strokeWidth=".4" transform="rotate(315 200 200)" />
      </g>
    </svg>
  );
}

export default function Hero() {
  const sectionRef = useRef(null);
  const titleRef   = useRef(null);
  const imgRef     = useRef(null);

  useEffect(() => {
    let ctx;
    async function init() {
      const { gsap }        = await import('gsap');
      const { ScrollTrigger } = await import('gsap/ScrollTrigger');
      gsap.registerPlugin(ScrollTrigger);

      ctx = gsap.context(() => {
        gsap.to(`.${styles.left}`, {
          opacity: 0, y: -40,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: '20% top', end: 'bottom 20%', scrub: true,
          },
        });
        
        // Hero title fade up
        gsap.fromTo(titleRef.current,
          { opacity: 0, y: 40 },
          { opacity: 1, y: 0, duration: 1.5, ease: 'power3.out', delay: 0.2 }
        );
        
        // No right image mask to animate anymore
      }, sectionRef);
    }
    init();
    return () => ctx?.revert();
  }, []);

  return (
    <section ref={sectionRef} className={styles.hero}>
      <video
        src="/videos/hero.mp4"
        className={styles.bgVideo}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster="/images/Corchorus_olitorius.jpg"
      />
      <div className={styles.overlay} />

      <MandalaDecor className={styles.mandala} />
      <div className={`${styles.orb} ${styles.orb1}`} />
      <div className={`${styles.orb} ${styles.orb2}`} />

      {/* Floating Sanskrit & Japanese Typographic Watermarks */}
      <div className={styles.sanskritWatermark} aria-hidden="true">अमृत</div>
      <div className={styles.japaneseWatermark} aria-hidden="true">生薬</div>

      <div className={styles.left}>
        <div className={styles.subtitleJp}>
          Pesticide-Free &bull; No Preservatives &bull; Pure by Nature
        </div>
        <h1 ref={titleRef} className={`${styles.title} serif`}>
          Moroheiya<br />Infusion
        </h1>
        <div className={styles.meta}>
          Master the Gut Brain Axis Naturally
        </div>
        <div style={{ marginTop: '3rem' }}>
          <Link href="#products" className="amata-btn amata-btn--glass">Explore all Moroheiya / Jute infusion blends</Link>
        </div>
      </div>
    </section>
  );
}
