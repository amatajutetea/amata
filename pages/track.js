import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../src/components/layout/Layout';
import OrderIssueModal from '../src/components/ui/OrderIssueModal';
import { WarningCircle } from '@phosphor-icons/react';
import styles from '../src/styles/checkout.module.css';

export default function TrackPage() {
  const router = useRouter();
  const { id } = router.query;
  const [queryInput, setQueryInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [issueModalOpen, setIssueModalOpen] = useState(false);

  useEffect(() => {
    if (id) {
      setQueryInput(id);
      fetchTracking(id);
    }
  }, [id]);

  async function fetchTracking(searchId) {
    if (!searchId) return;
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch(`/api/shipping/track?id=${encodeURIComponent(searchId)}`);
      const data = await res.json();

      if (res.ok && data.success) {
        setResult(data);
      } else {
        setError(data.error || 'Tracking details not found. Please check your Order ID or Waybill number.');
      }
    } catch (err) {
      console.error('Track error:', err);
      setError('Unable to reach shipment tracking server. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(e) {
    e.preventDefault();
    if (queryInput.trim()) {
      fetchTracking(queryInput.trim());
    }
  }

  return (
    <Layout title="Amata | Track Your Order">
      <div style={{ maxWidth: '800px', margin: '5rem auto 6rem auto', padding: '0 1.5rem', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <span style={{ fontSize: '0.8rem', letterSpacing: '0.15em', textTransform: 'uppercase', opacity: 0.6 }}>
            DELIVERY TRACKING
          </span>
          <h1 className="serif" style={{ fontSize: '2.5rem', marginTop: '0.5rem' }}>
            Track Your Amata Ritual Order
          </h1>
          <p style={{ opacity: 0.8, maxWidth: '500px', margin: '0.8rem auto 0 auto' }}>
            Enter your Order ID (e.g. AMT-123456) or Delhivery Waybill Tracking Number to view real-time status.
          </p>
        </div>

        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.8rem', marginBottom: '3rem' }}>
          <input
            type="text"
            value={queryInput}
            onChange={(e) => setQueryInput(e.target.value)}
            placeholder="Enter Order ID or Waybill Number (e.g. AMT-104928)"
            style={{
              flex: 1,
              padding: '0.9rem 1.2rem',
              border: '1px solid rgba(0,0,0,0.15)',
              borderRadius: '4px',
              fontSize: '1rem',
              outline: 'none',
              background: '#fcfbfa'
            }}
          />
          <button
            type="submit"
            className="amata-btn"
            disabled={loading}
            style={{ whiteSpace: 'nowrap', minWidth: '140px' }}
          >
            {loading ? 'Searching...' : 'Track Order'}
          </button>
        </form>

        {error && (
          <div style={{ padding: '1.2rem', background: '#fff0f0', color: '#c00', borderRadius: '6px', textAlign: 'center', marginBottom: '2rem' }}>
            {error}
          </div>
        )}

        {result && (
          <div style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '8px', padding: '2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f0eee8', paddingBottom: '1.2rem', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.85rem', color: '#777' }}>Order Reference</span>
                <h3 className="serif" style={{ fontSize: '1.4rem', margin: '0.2rem 0' }}>
                  {result.order?.orderId || result.queryId}
                </h3>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.85rem', color: '#777' }}>Delhivery Waybill</span>
                <div style={{ fontWeight: 600, fontSize: '1.1rem', color: '#333' }}>
                  {result.waybill !== 'pending_dispatch' ? result.waybill : 'Dispatch Pending'}
                </div>
              </div>
            </div>

            {result.order && (
              <div style={{ marginBottom: '1.5rem', background: '#fdfbf7', padding: '1rem 1.2rem', borderRadius: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontWeight: 500 }}>
                  <span>Status: <strong style={{ textTransform: 'capitalize', color: result.order.status === 'paid' ? '#2e7d32' : '#d84315' }}>{result.order.status}</strong></span>
                  <span>Amount: ₹{result.order.amount?.toFixed(2)}</span>
                </div>
                {result.order.items && (
                  <div style={{ fontSize: '0.9rem', color: '#555' }}>
                    Items: {result.order.items.map(i => `${i.name} (x${i.qty})`).join(', ')}
                  </div>
                )}
              </div>
            )}

            <div style={{ borderTop: '1px dashed #e0ded7', paddingTop: '1.5rem' }}>
              <h4 className="serif" style={{ marginBottom: '1rem' }}>Delivery Progress</h4>
              <p style={{ color: '#444', lineHeight: 1.6 }}>
                {result.tracking?.remarks || 'Your shipment has been created and is being prepared for pickup by Delhivery.'}
              </p>
              
              <div style={{ marginTop: '1.5rem', textAlign: 'center', display: 'flex', gap: '0.8rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                {result.waybill && result.waybill !== 'pending_dispatch' && (
                  <a
                    href={`https://www.delhivery.com/track/package/${result.waybill}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="amata-btn amata-btn--sand"
                    style={{ display: 'inline-block' }}
                  >
                    View Official Delhivery Live Map ↗
                  </a>
                )}

                <button
                  type="button"
                  onClick={() => setIssueModalOpen(true)}
                  style={{
                    padding: '0.75rem 1.2rem',
                    border: '1px solid rgba(0,0,0,0.15)',
                    borderRadius: '4px',
                    background: '#ffffff',
                    color: '#444',
                    fontSize: '0.88rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem'
                  }}
                >
                  <WarningCircle size={16} />
                  <span>Facing problems with your order?</span>
                </button>
              </div>
            </div>
          </div>
        )}

        <div style={{ marginTop: '3rem', textAlign: 'center' }}>
          <Link href="/" style={{ color: '#666', textDecoration: 'underline', fontSize: '0.95rem' }}>
            ← Return to Storefront
          </Link>
        </div>
      </div>

      <OrderIssueModal
        isOpen={issueModalOpen}
        onClose={() => setIssueModalOpen(false)}
        orderId={result?.order?.orderId || result?.queryId || queryInput}
        orderStatus={result?.order?.status}
      />
    </Layout>
  );
}
