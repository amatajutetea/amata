import { useRef, useState, useEffect } from 'react';
import { MusicNotes, MusicNotesSimple } from '@phosphor-icons/react';
import styles from './BgmToggle.module.css';

export default function BgmToggle() {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  function toggle() {
    // Lazily instantiate audio on user demand to avoid downloading 3.5MB on initial load
    if (!audioRef.current) {
      audioRef.current = new Audio('/audio/bgm.mp3');
      audioRef.current.loop = true;
      audioRef.current.volume = 0.4;
    }

    const audio = audioRef.current;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio.play().then(() => setPlaying(true)).catch(() => {});
    }
  }

  return (
    <button
      className={`${styles.toggle} ${!playing ? styles.paused : ''}`}
      onClick={toggle}
      aria-label="Toggle background music"
    >
      {playing
        ? <MusicNotes size={20} weight="fill" />
        : <MusicNotesSimple size={20} />
      }
    </button>
  );
}
