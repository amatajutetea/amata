import { useState, useEffect } from 'react';
import { X, WhatsappLogo, WarningCircle, Trash } from '@phosphor-icons/react';
import styles from './ComingSoonModal.module.css';

export default function OrderIssueModal({ isOpen, onClose, orderId, orderStatus }) {
  const [selectedIssue, setSelectedIssue] = useState('1. Damaged Product');
  const [customText, setCustomText] = useState('');
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const issuePresets = [
    { id: '1. Damaged Product', label: '📦 Damaged Product / Packaging', note: 'Requires unboxing photo or video proof within 48h of delivery.' },
    { id: '2. Incorrect Flavour', label: '🍵 Incorrect Flavour Received', note: 'e.g. Received Ginger instead of Elaichi Moroheiya.' },
    { id: '3. Didn\'t Receive Order', label: '🚚 Didn\'t Receive Order', note: 'Marked delivered but package has not arrived.' },
    { id: '4. Something Else', label: '💬 Something Else', note: 'Provide additional details below.' },
  ];

  function handleSendWhatsApp(e) {
    e.preventDefault();
    const orderRef = orderId || 'AMT-Order';
    let text = `*Amata Support Request*\n\n*Order ID:* ${orderRef}\n*Issue Category:* ${selectedIssue}`;

    if (customText.trim()) {
      text += `\n*Details:* ${customText.trim()}`;
    }

    text += `\n\nPlease help me resolve this issue. Thank you!`;

    const encodedText = encodeURIComponent(text);
    const whatsappUrl = `https://wa.me/918777395787?text=${encodedText}`;
    window.open(whatsappUrl, '_blank');
    onClose();
  }

  async function handleCancelOrder() {
    if (!confirm(`Are you sure you want to cancel Order ${orderId}? Full refund will be processed in 5-7 business days.`)) {
      return;
    }

    setCancelling(true);
    try {
      const text = `*Order Cancellation Request*\n\n*Order ID:* ${orderId}\n*Status:* Requesting immediate pre-dispatch cancellation and refund.`;
      const encodedText = encodeURIComponent(text);
      window.open(`https://wa.me/918777395787?text=${encodedText}`, '_blank');
      alert(`Cancellation request submitted for ${orderId}. Support team will process your 100% refund to the original payment source in 5-7 business days.`);
      onClose();
    } catch (err) {
      alert('Error requesting cancellation. Please contact support at +91 8777395787');
    } finally {
      setCancelling(false);
    }
  }

  return (
    <>
      <div className={styles.overlay} onClick={onClose} />
      <div className={styles.modal} role="dialog" aria-modal="true" style={{ maxWidth: '480px', padding: '2rem' }}>
        <button className={styles.closeBtn} onClick={onClose} aria-label="Close modal">
          <X size={20} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: '1.4rem' }}>
          <span style={{ fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase', opacity: 0.6, display: 'block' }}>
            ORDER SUPPORT & ASSISTANCE
          </span>
          <h2 className="serif" style={{ fontSize: '1.6rem', marginTop: '0.2rem' }}>
            Facing problems with your order?
          </h2>
          <div style={{ fontSize: '0.88rem', color: '#666', marginTop: '0.3rem' }}>
            Order Reference: <strong>{orderId || 'Direct Support'}</strong>
          </div>
        </div>

        <form onSubmit={handleSendWhatsApp}>
          <div style={{ marginBottom: '1.2rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.6rem' }}>
              Select Issue Category:
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {issuePresets.map((preset) => (
                <label
                  key={preset.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '0.7rem 0.9rem',
                    border: selectedIssue === preset.id ? '1.5px solid #0a2d33' : '1px solid #e0ded7',
                    borderRadius: '6px',
                    background: selectedIssue === preset.id ? '#f4f8f8' : '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.9rem', fontWeight: 500 }}>
                    <input
                      type="radio"
                      name="issueCategory"
                      value={preset.id}
                      checked={selectedIssue === preset.id}
                      onChange={() => setSelectedIssue(preset.id)}
                    />
                    <span>{preset.label}</span>
                  </div>
                  <span style={{ fontSize: '0.76rem', color: '#777', marginTop: '0.2rem', paddingLeft: '1.6rem' }}>
                    {preset.note}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '1.4rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
              Additional Details / Description (Optional):
            </label>
            <textarea
              rows={3}
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="Describe what happened or attach your video/photo proof via WhatsApp..."
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid rgba(0,0,0,0.15)',
                borderRadius: '6px',
                fontSize: '0.88rem',
                outline: 'none',
                resize: 'none'
              }}
            />
          </div>

          <button
            type="submit"
            className="amata-btn"
            style={{
              width: '100%',
              padding: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.6rem',
              fontSize: '0.95rem',
              background: '#25D366',
              color: '#ffffff',
              borderColor: '#25D366'
            }}
          >
            <WhatsappLogo size={22} weight="fill" />
            <span>Connect Directly on WhatsApp</span>
          </button>
        </form>

        {orderStatus !== 'shipped' && orderStatus !== 'delivered' && (
          <div style={{ marginTop: '1.2rem', paddingTop: '1rem', borderTop: '1px dashed #e0ded7', textAlign: 'center' }}>
            <button
              type="button"
              onClick={handleCancelOrder}
              disabled={cancelling}
              style={{
                background: 'none',
                border: 'none',
                color: '#c00',
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                textDecoration: 'underline'
              }}
            >
              <Trash size={16} />
              <span>Cancel Order Before Dispatch (Self-Service)</span>
            </button>
          </div>
        )}
      </div>
    </>
  );
}
