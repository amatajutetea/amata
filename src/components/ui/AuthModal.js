import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { auth } from '../../lib/firebase';
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut
} from 'firebase/auth';
import { X, Package, ArrowRight } from '@phosphor-icons/react';
import styles from './ComingSoonModal.module.css';

export default function AuthModal({ isOpen, onClose, user }) {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && user?.uid) {
      fetchUserOrders(user.uid);
    }
  }, [isOpen, user?.uid]);

  async function fetchUserOrders(uid) {
    setOrdersLoading(true);
    try {
      const res = await fetch(`/api/user/orders?uid=${encodeURIComponent(uid)}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setOrders(data.orders || []);
      }
    } catch (err) {
      console.error('Error fetching user orders:', err);
    } finally {
      setOrdersLoading(false);
    }
  }

  function handleTrackClick(orderId) {
    onClose();
    router.push(`/track?id=${encodeURIComponent(orderId)}`);
  }

  if (!isOpen) return null;

  async function handleGoogleSignIn() {
    setLoading(true);
    setError('');
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      onClose();
    } catch (err) {
      console.error('Google Sign In Error:', err);
      setError(err.message || 'Failed to sign in with Google');
    } finally {
      setLoading(false);
    }
  }

  async function handleEmailAuth(e) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      onClose();
    } catch (err) {
      console.error('Email Auth Error:', err);
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  }

  async function handleSignOut() {
    try {
      await signOut(auth);
      setOrders([]);
      onClose();
    } catch (err) {
      console.error('Sign Out Error:', err);
    }
  }

  return (
    <>
      <div className={styles.overlay} onClick={onClose} />
      <div className={styles.modal} role="dialog" aria-modal="true" style={{ maxWidth: '460px', padding: '2.2rem 2rem' }}>
        <button className={styles.closeBtn} onClick={onClose} aria-label="Close modal">
          <X size={20} />
        </button>

        {user ? (
          <div>
            <div style={{ textAlign: 'center', borderBottom: '1px solid #eee', paddingBottom: '1rem', marginBottom: '1.2rem' }}>
              <span style={{ fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase', opacity: 0.6 }}>
                MY AMATA ACCOUNT
              </span>
              <h2 className="serif" style={{ fontSize: '1.6rem', marginTop: '0.2rem', marginBottom: '0.2rem' }}>
                {user.displayName || user.email?.split('@')[0]}
              </h2>
              <p style={{ opacity: 0.7, fontSize: '0.85rem' }}>
                {user.email || user.phoneNumber}
              </p>
            </div>

            <div style={{ margin: '1.8rem 0' }}>
              <h3 className="serif" style={{ fontSize: '1.1rem', marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Package size={18} /> Recent Orders
              </h3>

              {ordersLoading ? (
                <div style={{ textAlign: 'center', padding: '1rem', fontSize: '0.9rem', color: '#666' }}>
                  Loading your recent orders...
                </div>
              ) : orders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '1.2rem', background: '#fcfbfa', borderRadius: '6px', border: '1px solid #eee' }}>
                  <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>No recent orders found under this account.</p>
                </div>
              ) : (
                <div style={{ maxHeight: '240px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.8rem', paddingRight: '4px' }}>
                  {orders.map((ord) => (
                    <div
                      key={ord.orderId}
                      style={{
                        background: '#fcfbfa',
                        border: '1px solid rgba(0,0,0,0.08)',
                        borderRadius: '6px',
                        padding: '0.9rem 1rem',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                        <strong style={{ fontSize: '0.95rem' }}>{ord.orderId}</strong>
                        <span
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            padding: '0.2rem 0.6rem',
                            borderRadius: '12px',
                            background: ord.status === 'paid' ? '#e8f5e9' : '#fff3e0',
                            color: ord.status === 'paid' ? '#2e7d32' : '#e65100',
                            textTransform: 'capitalize',
                          }}
                        >
                          {ord.status}
                        </span>
                      </div>

                      <div style={{ fontSize: '0.82rem', color: '#666', marginBottom: '0.6rem' }}>
                        {ord.items ? ord.items.map((i) => i.name).join(', ') : 'Amata Infusion'} · ₹{ord.amount?.toFixed(2)}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleTrackClick(ord.orderId)}
                        className="amata-btn amata-btn--sand"
                        style={{
                          width: '100%',
                          padding: '0.55rem',
                          fontSize: '0.82rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.4rem',
                        }}
                      >
                        <span>Track Shipment Live</span>
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={handleSignOut}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: 'none',
                background: '#f5f5f5',
                color: '#666',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.88rem',
              }}
            >
              Sign Out
            </button>
          </div>
        ) : (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '1.8rem' }}>
              <span style={{ fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase', opacity: 0.6 }}>
                AMATA ACCOUNT
              </span>
              <h2 className="serif" style={{ fontSize: '1.8rem', marginTop: '0.3rem' }}>
                {isSignUp ? 'Create an Account' : 'Sign In to Amata'}
              </h2>
            </div>

            {error && (
              <div style={{ padding: '0.8rem', background: '#fff0f0', color: '#c00', borderRadius: '4px', fontSize: '0.85rem', marginBottom: '1rem', textAlign: 'center' }}>
                {error}
              </div>
            )}

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.85rem',
                border: '1px solid rgba(0,0,0,0.15)',
                borderRadius: '4px',
                background: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.8rem',
                fontSize: '0.95rem',
                fontWeight: 500,
                cursor: 'pointer',
                marginBottom: '1.2rem',
                transition: 'all 0.2s ease'
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Continue with Google</span>
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', margin: '1.2rem 0', opacity: 0.5 }}>
              <div style={{ flex: 1, height: '1px', background: '#ccc' }} />
              <span style={{ fontSize: '0.8rem' }}>or email</span>
              <div style={{ flex: 1, height: '1px', background: '#ccc' }} />
            </div>

            <form onSubmit={handleEmailAuth}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', marginBottom: '0.3rem', opacity: 0.8 }}>Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid rgba(0,0,0,0.15)', borderRadius: '4px', outline: 'none' }}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', marginBottom: '0.3rem', opacity: 0.8 }}>Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid rgba(0,0,0,0.15)', borderRadius: '4px', outline: 'none' }}
                />
              </div>

              <button
                type="submit"
                className="amata-btn"
                disabled={loading}
                style={{ width: '100%', padding: '0.85rem' }}
              >
                {loading ? 'Please wait...' : isSignUp ? 'Create Account' : 'Sign In'}
              </button>
            </form>

            <div style={{ marginTop: '1.2rem', textAlign: 'center', fontSize: '0.88rem' }}>
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', textDecoration: 'underline' }}
              >
                {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
