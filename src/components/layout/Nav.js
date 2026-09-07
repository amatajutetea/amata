import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '../../context/CartContext';
import AuthModal from '../ui/AuthModal';
import { auth } from '../../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import styles from './Nav.module.css';

export default function Nav({ theme = 'auto' }) {
  const { count, setIsOpen, lang, setLang } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Close menu on route change / resize
  useEffect(() => {
    const close = () => setMenuOpen(false);
    window.addEventListener('resize', close);
    return () => window.removeEventListener('resize', close);
  }, []);

  // Prevent body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  return (
    <>
      <nav className={`${styles.nav} ${styles[theme] || ''}`}>
        <Link href="/" className={styles.logo}>
          <div className={styles.logoContainer}>
            <img src="/images/crane_logo.png" alt="Amata Crane Logo" className={`${styles.logoImg} ${styles.logo1}`} />
            <img src="/images/logo.png" alt="Amata Logo" className={`${styles.logoImg} ${styles.logo2}`} />
          </div>
        </Link>

        {/* Desktop links */}
        <div className={styles.links}>
          <div className={styles.controls}>
            <select className={styles.switcher} value={lang} onChange={(e) => setLang(e.target.value)} aria-label="Language">
              <option value="EN">EN</option>
              <option value="JP">JP</option>
            </select>
          </div>
          <Link href="/learn" className={styles.link}>{lang === 'JP' ? '学ぶ' : 'Learn'}</Link>
          <Link href="/journal" className={styles.link}>{lang === 'JP' ? 'ジャーナル' : 'Journal'}</Link>
          <Link href="/track" className={styles.link}>{lang === 'JP' ? '追跡' : 'Track Order'}</Link>

          <button
            className={styles.link}
            onClick={() => setAuthModalOpen(true)}
            aria-label="Account Login"
          >
            {user ? (lang === 'JP' ? 'プロフィール' : 'Profile') : (lang === 'JP' ? 'ログイン' : 'Login')}
          </button>

          <a
            href="https://amazon.in/AMATA-Jute-Leaf-Tea-ANTIOXIDANT/dp/B0FC6TVHFC"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.navAmazonBtn}
            title="Buy on Amazon"
          >
            <img src="/images/amazon-icon.svg" alt="Amazon Logo" className={styles.navAmazonIcon} />
            <span>Amazon</span>
          </a>

          <button
            className={`${styles.link} ${styles.cartBtn}`}
            onClick={() => setIsOpen(true)}
            aria-label="Open cart"
          >
            <span
              className={styles.cartIcon}
              style={{
                WebkitMask: "url('/images/cart-icon.png') no-repeat center / contain",
                mask: "url('/images/cart-icon.png') no-repeat center / contain",
              }}
            />
            <span>{lang === 'JP' ? 'サッチェル' : 'Satchel Bag'}</span>
            {count > 0 && <span className={styles.cartCount}>{count}</span>}
          </button>
        </div>

        {/* Hamburger (mobile only) */}
        <button
          className={styles.hamburger}
          onClick={() => setMenuOpen((v) => !v)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
        >
          <span className={`${styles.bar} ${menuOpen ? styles.barTop : ''}`} />
          <span className={`${styles.bar} ${menuOpen ? styles.barMid : ''}`} />
          <span className={`${styles.bar} ${menuOpen ? styles.barBot : ''}`} />
        </button>
      </nav>

      {/* Mobile drawer */}
      <div className={`${styles.drawer} ${menuOpen ? styles.drawerOpen : ''}`} aria-hidden={!menuOpen}>
        <nav className={styles.drawerNav}>
          <Link href="/" className={styles.drawerLink} onClick={() => setMenuOpen(false)}>Home</Link>
          <Link href="/learn" className={styles.drawerLink} onClick={() => setMenuOpen(false)}>Learn</Link>
          <Link href="/journal" className={styles.drawerLink} onClick={() => setMenuOpen(false)}>Journal</Link>
          <Link href="/track" className={styles.drawerLink} onClick={() => setMenuOpen(false)}>Track Order</Link>
          <button
            className={styles.drawerLink}
            onClick={() => { setMenuOpen(false); setAuthModalOpen(true); }}
          >
            {user ? 'Profile' : 'Login'}
          </button>

          <a
            href="https://amazon.in/AMATA-Jute-Leaf-Tea-ANTIOXIDANT/dp/B0FC6TVHFC"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.drawerAmazonBtn}
            onClick={() => setMenuOpen(false)}
          >
            <img src="/images/amazon-icon.svg" alt="Amazon Logo" className={styles.navAmazonIcon} />
            <span>Buy on Amazon</span>
          </a>

          <button
            className={`${styles.drawerLink} ${styles.drawerCartBtn}`}
            onClick={() => { setMenuOpen(false); setIsOpen(true); }}
          >
            Satchel Bag {count > 0 && <span className={styles.drawerCartCount}>{count}</span>}
          </button>
        </nav>
        <div className={styles.drawerTagline}>
          <span>जू特茶 · ジュートティー</span>
        </div>
      </div>

      {/* Backdrop */}
      {menuOpen && (
        <div className={styles.backdrop} onClick={() => setMenuOpen(false)} aria-hidden="true" />
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        user={user}
      />
    </>
  );
}


