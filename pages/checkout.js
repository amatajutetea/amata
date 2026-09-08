import { useState, useEffect } from 'react';
import Link from 'next/link';
import Script from 'next/script';
import Layout from '../src/components/layout/Layout';
import { useCart } from '../src/context/CartContext';
import styles from '../src/styles/checkout.module.css';
import { auth, db } from '../src/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [placedOrderInfo, setPlacedOrderInfo] = useState(null);
  const [user, setUser] = useState(null);
  const [pincodeStatus, setPincodeStatus] = useState(null);

  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
  });

  // Auto-lookup city & state when a 6-digit Indian pincode is entered
  useEffect(() => {
    const cleanPin = form.pincode.trim().replace(/\D/g, '');
    if (cleanPin.length === 6) {
      let isMounted = true;
      setPincodeStatus('Looking up pincode...');
      fetch(`https://api.postalpincode.in/pincode/${cleanPin}`)
        .then((res) => res.json())
        .then((data) => {
          if (!isMounted) return;
          if (data && data[0] && data[0].Status === 'Success' && data[0].PostOffice?.length > 0) {
            const po = data[0].PostOffice[0];
            const detectedCity = po.District || po.Block || po.Name;
            const detectedState = po.State;
            setForm((prev) => ({
              ...prev,
              city: detectedCity || prev.city,
              state: detectedState || prev.state,
            }));
            setPincodeStatus(`✓ Auto-filled: ${detectedCity}, ${detectedState}`);
          } else {
            setPincodeStatus(null);
          }
        })
        .catch(() => {
          if (isMounted) setPincodeStatus(null);
        });
      return () => {
        isMounted = false;
      };
    } else {
      setPincodeStatus(null);
    }
  }, [form.pincode]);

  // Fetch user profile if logged in to pre-fill shipping address
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setForm((prev) => ({
              ...prev,
              name: data.name || currentUser.displayName || prev.name,
              phone: data.phone || currentUser.phoneNumber || prev.phone,
              email: data.email || currentUser.email || prev.email,
              address: data.address || prev.address,
              city: data.city || prev.city,
              state: data.state || prev.state,
              pincode: data.pincode || prev.pincode,
              country: 'India',
            }));
          } else {
            setForm((prev) => ({
              ...prev,
              name: currentUser.displayName || prev.name,
              email: currentUser.email || prev.email,
              phone: currentUser.phoneNumber || prev.phone,
            }));
          }
        } catch (err) {
          console.error('Error fetching user profile:', err);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  function handleFormChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function saveProfile() {
    if (user) {
      try {
        await setDoc(doc(db, 'users', user.uid), form, { merge: true });
      } catch (err) {
        console.error('Error saving user profile:', err);
      }
    }
  }

  async function handleProceedToPayment(e) {
    e.preventDefault();

    if (!form.name || !form.phone || !form.email || !form.address || !form.city || !form.state || !form.pincode) {
      alert('Please fill in all required shipping address fields.');
      return;
    }

    setLoading(true);
    try {
      await saveProfile();

      // 1. Create order on server
      const res = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          address: form,
          uid: user?.uid || 'guest',
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        alert(data.error || 'Failed to initialize order.');
        setLoading(false);
        return;
      }

      // 2. Open Razorpay Checkout modal
      if (window.Razorpay) {
        const options = {
          key: data.key_id,
          amount: data.amount,
          currency: data.currency,
          name: 'Amata Brew',
          description: 'Moroheiya Prebiotic Tea Infusion',
          order_id: data.razorpayOrderId,
          prefill: {
            name: form.name,
            email: form.email,
            contact: form.phone,
          },
          theme: {
            color: '#b7b198',
          },
          handler: async function (response) {
            setLoading(true);
            try {
              // 3. Verify payment server-side
              const verifyRes = await fetch('/api/payment/verify-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_signature: response.razorpay_signature,
                  orderId: data.orderId,
                }),
              });

              const verifyData = await verifyRes.json();

              if (verifyRes.ok && verifyData.success) {
                setPlacedOrderInfo({
                  orderId: data.orderId,
                  delhiveryAwb: verifyData.delhiveryAwb,
                  email: form.email,
                  total: data.amount / 100,
                });
                clearCart();
              } else {
                alert(verifyData.error || 'Payment verification failed.');
              }
            } catch (err) {
              console.error('Verification error:', err);
              alert('Error verifying payment.');
            } finally {
              setLoading(false);
            }
          },
          modal: {
            ondismiss: function () {
              setLoading(false);
            },
          },
        };

        const rzp1 = new window.Razorpay(options);
        rzp1.on('payment.failed', function (response) {
          alert('Payment Failed: ' + response.error.description);
          setLoading(false);
        });
        rzp1.open();
      } else {
        alert('Razorpay Checkout SDK failed to load. Please refresh the page.');
        setLoading(false);
      }
    } catch (err) {
      console.error('Checkout error:', err);
      alert('An unexpected error occurred during checkout.');
      setLoading(false);
    }
  }

  if (items.length === 0 && !placedOrderInfo) {
    return (
      <Layout title="Amata | Checkout" hideFooter>
        <div className={styles.emptyState}>
          <h2 className="serif">Your satchel bag is empty.</h2>
          <p style={{ margin: '1rem 0 2rem 0', opacity: 0.8 }}>
            Add your preferred Moroheiya tea blends to proceed with checkout.
          </p>
          <Link href="/products" className="amata-btn">
            Explore the Blends
          </Link>
        </div>
      </Layout>
    );
  }

  if (placedOrderInfo) {
    return (
      <Layout title="Amata | Order Confirmed" hideFooter>
        <div className={styles.successState}>
          <div className={styles.successIcon}>茶</div>
          <h2 className="serif">Thank you! Your order has been placed.</h2>
          <p style={{ marginTop: '0.8rem', fontSize: '1.05rem', color: '#444' }}>
            Order Reference ID: <strong>{placedOrderInfo.orderId}</strong>
          </p>
          <p style={{ marginTop: '0.4rem', opacity: 0.8, fontSize: '0.92rem' }}>
            A confirmation invoice has been sent to <strong>{placedOrderInfo.email}</strong>.
          </p>

          <div style={{ margin: '2rem 0', display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              href={`/track?id=${placedOrderInfo.orderId}`}
              className="amata-btn"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <span>Track Delivery Live</span> ↗
            </Link>
            <Link href="/" className="amata-btn amata-btn--sand">
              Return to Storefront
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Amata | Direct Checkout" hideFooter>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <div className={styles.page}>
        <div className={styles.formCol}>
          <div className={styles.stepsBreadcrumb}>
            <span className={`${styles.breadcrumbStep} ${styles.breadcrumbActive}`}>
              1. Delivery Address & Payment
            </span>
          </div>

          <form className={styles.form} onSubmit={handleProceedToPayment}>
            <h2 className={`serif ${styles.formTitle}`}>Delivery Address</h2>

            <div className={styles.row}>
              <div className={styles.field}>
                <label>Full Name *</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleFormChange}
                  placeholder="Arjun Sharma"
                  required
                />
              </div>
              <div className={styles.field}>
                <label>Phone Number *</label>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleFormChange}
                  placeholder="+91 98765 43210"
                  required
                />
              </div>
            </div>

            <div className={styles.field}>
              <label>Email Address *</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleFormChange}
                placeholder="you@example.com"
                required
              />
            </div>

            <div className={styles.field}>
              <label>Shipping Address *</label>
              <input
                name="address"
                value={form.address}
                onChange={handleFormChange}
                placeholder="Street address, Flat, House No."
                required
              />
            </div>

            <div className={styles.row}>
              <div className={styles.field}>
                <label>City *</label>
                <input
                  name="city"
                  value={form.city}
                  onChange={handleFormChange}
                  placeholder="Kolkata"
                  required
                />
              </div>
              <div className={styles.field}>
                <label>State *</label>
                <input
                  name="state"
                  value={form.state}
                  onChange={handleFormChange}
                  placeholder="West Bengal"
                  required
                />
              </div>
            </div>

            <div className={styles.row}>
              <div className={styles.field}>
                <label>Pincode *</label>
                <input
                  name="pincode"
                  value={form.pincode}
                  onChange={handleFormChange}
                  placeholder="700001"
                  required
                />
                {pincodeStatus && (
                  <span style={{ fontSize: '0.78rem', color: pincodeStatus.startsWith('✓') ? '#2e7d32' : '#888', marginTop: '0.3rem', display: 'block' }}>
                    {pincodeStatus}
                  </span>
                )}
              </div>
              <div className={styles.field}>
                <label>Country</label>
                <input name="country" value="India" disabled style={{ opacity: 0.6 }} />
              </div>
            </div>

            <button
              type="submit"
              className="amata-btn"
              disabled={loading}
              style={{ marginTop: '2rem', width: '100%', padding: '1.1rem' }}
            >
              {loading ? 'Initializing Secure Payment...' : `Pay ₹${total.toFixed(2)} with Razorpay`}
            </button>

            <div style={{ marginTop: '1rem', textAlign: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: '#777' }}>
                🔒 256-bit Encrypted SSL Payment via Razorpay Gateway
              </span>
            </div>
          </form>
        </div>

        <div className={styles.summaryCol}>
          <h3 className={`serif ${styles.summaryTitle}`}>Satchel Bag Summary</h3>
          <div className={styles.summaryItems}>
            {items.map((item) => (
              <div key={item.id} className={styles.summaryItem}>
                <img src={item.primaryImage} alt={item.name} className={styles.summaryImg} />
                <div className={styles.summaryInfo}>
                  <div className="serif">{item.name}</div>
                  <div className={styles.summaryQty}>Qty: {item.qty}</div>
                </div>
                <div className={styles.summaryPrice}>₹{(item.price * item.qty).toFixed(2)}</div>
              </div>
            ))}
          </div>
          <div className={styles.summaryTotal}>
            <span className="serif">Total</span>
            <span className="serif">₹{total.toFixed(2)}</span>
          </div>

          <div style={{ marginTop: '2rem', textAlign: 'center' }}>
            <Link href="/" className="amata-btn amata-btn--sand" style={{ display: 'block', width: '100%' }}>
              ← Return to Main Site
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}

