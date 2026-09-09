import { useEffect } from 'react';
import Link from 'next/link';
import { X, Plus, Minus } from '@phosphor-icons/react';
import { useCart } from '../../context/CartContext';
import styles from './CartModal.module.css';

export default function CartModal() {
  const { items, isOpen, setIsOpen, removeItem, updateQty, total } = useCart();

  // Lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  return (
    <>
      {/* Overlay */}
      <div
        className={`${styles.overlay} ${isOpen ? styles.overlayOpen : ''}`}
        onClick={() => setIsOpen(false)}
      />

      {/* Drawer */}
      <div className={`${styles.modal} ${isOpen ? styles.modalOpen : ''}`}>
        <div className={styles.header}>
          <h2 className="serif">Your Satchel Bag</h2>
          <button className={styles.closeBtn} onClick={() => setIsOpen(false)} aria-label="Close cart">
            <X size={22} />
          </button>
        </div>

        <div className={styles.items}>
          {items.length === 0 ? (
            <p className={styles.emptyMsg}>Your satchel bag is empty.</p>
          ) : (
            items.map((item) => (
              <div key={item.id} className={styles.item}>
                <img src={item.primaryImage} alt={item.name} className={styles.itemImg} />
                <div className={styles.itemInfo}>
                  <div className={`serif ${styles.itemTitle}`}>{item.name}</div>
                  <div className={styles.itemPrice}>₹{item.price}</div>
                  <div className={styles.qtyRow}>
                    <button onClick={() => updateQty(item.id, item.qty - 1)} aria-label="Decrease quantity">
                      <Minus size={14} />
                    </button>
                    <span>{item.qty}</span>
                    <button onClick={() => updateQty(item.id, item.qty + 1)} aria-label="Increase quantity">
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
                <button className={styles.removeBtn} onClick={() => removeItem(item.id)} aria-label="Remove item">
                  <X size={16} />
                </button>
              </div>
            ))
          )}
        </div>

        <div className={styles.footer}>
          <div className={styles.total}>
            <span className="serif">Subtotal</span>
            <span className="serif">₹{total.toFixed(2)}</span>
          </div>

          <Link
            href="/checkout"
            className="amata-btn"
            onClick={() => setIsOpen(false)}
            style={{ width: '100%', display: 'block', textAlign: 'center', padding: '1rem', marginBottom: '0.8rem' }}
          >
            Proceed to Direct Checkout
          </Link>

          <a
            href="https://amazon.in/AMATA-Jute-Leaf-Tea-ANTIOXIDANT/dp/B0FC6TVHFC"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.amazonCheckoutBtn}
          >
            <img src="/images/amazon-icon.svg" alt="Amazon Logo" className={styles.amazonBtnIcon} />
            <span>Or buy directly on Amazon</span>
          </a>
        </div>
      </div>
    </>
  );
}
