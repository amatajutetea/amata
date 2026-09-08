import { useEffect, useRef, useState } from 'react';
import { SpeakerSimpleHigh, SpeakerSimpleSlash } from '@phosphor-icons/react';
import styles from './ImageBreak.module.css';

export default function ImageBreak() {
  const videoRef   = useRef(null);
  const sectionRef = useRef(null);
  const [muted, setMuted] = useState(true);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: '300px' }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  function toggleSound() {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !muted;
    setMuted(!muted);
  }

  return (
    <section ref={sectionRef} className={styles.imgBreak}>
      <video
        ref={videoRef}
        src={shouldLoad ? "/videos/showreel.webm" : undefined}
        className={styles.video}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
      />
      <div className={`serif ${styles.text}`}>Purity in Process</div>
      <button className={styles.soundToggle} onClick={toggleSound} aria-label="Toggle sound">
        {muted
          ? <SpeakerSimpleSlash size={20} />
          : <SpeakerSimpleHigh  size={20} />
        }
        <span>{muted ? 'Sound Off' : 'Sound On'}</span>
      </button>
    </section>
  );
}

