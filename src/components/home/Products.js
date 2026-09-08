import { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart, formatPrice } from '../../context/CartContext';
import styles from './Products.module.css';

function ProductCard({ product }) {
  const { addItem, currency, lang } = useCart();
  const [added, setAdded] = useState(false);
  const cardRef = useRef(null);

  const handleAdd = () => {
    if (!product.inStock) return;
    addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <div ref={cardRef} className={styles.card}>
      <Link href={`/product/${product.slug}`} className={styles.imgMask}>
        <Image
          src={product.primaryImage}
          className={styles.imgPrimary}
          alt={product.name}
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
        />
        {product.hoverImage && (
          <Image
            src={product.hoverImage}
            className={styles.imgReveal}
            alt={product.name}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        )}
      </Link>
      <div className={styles.head}>
        <h3 className={`serif ${styles.title}`}>
          {lang === 'JP' && product.nameJp ? product.nameJp : product.name}
        </h3>
        <div className={`serif ${styles.price}`}>
          {formatPrice(product.price, currency)}
        </div>
      </div>
      <p className={styles.desc}>{product.description}</p>
      <div className={styles.actions}>
        <a
          href="https://amazon.in/AMATA-Jute-Leaf-Tea-ANTIOXIDANT/dp/B0FC6TVHFC"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.amazonCardBtn}
        >
          <img src="/images/amazon-icon.svg" alt="Amazon Logo" className={styles.amazonCardIcon} />
          <span>Buy on Amazon</span>
        </a>
        <button
          className={`amata-btn amata-btn--sand ${styles.addBtn}`}
          onClick={handleAdd}
          disabled={!product.inStock}
          style={!product.inStock ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
        >
          {added ? 'Added ✓' : (product.inStock ? 'Add to Satchel Bag' : 'Out of Stock')}
        </button>
      </div>
    </div>
  );
}

export default function Products({ products = [] }) {
  const sectionRef = useRef(null);

  useEffect(() => {
    let ctx;
    let active = true;
    const listeners = [];

    async function init() {
      const { gsap }        = await import('gsap');
      const { ScrollTrigger } = await import('gsap/ScrollTrigger');
      gsap.registerPlugin(ScrollTrigger);

      if (!active || !sectionRef.current) return;

      ctx = gsap.context(() => {
        gsap.utils.toArray(`.${styles.card}`).forEach((card) => {
          gsap.fromTo(card,
            { y: 60, opacity: 0 },
            {
              y: 0, opacity: 1, duration: 1.2, ease: 'power3.out',
              scrollTrigger: {
                trigger: card,
                start: 'top 90%',
                toggleActions: 'play reverse play reverse',
              },
            }
          );
        });

        // Magnetic buttons
        document.querySelectorAll(`.${styles.magneticWrap}`).forEach((wrap) => {
          const btn = wrap.querySelector('button');
          if (!btn) return;

          const onMouseMove = (e) => {
            const r = wrap.getBoundingClientRect();
            const dx = e.clientX - (r.left + r.width / 2);
            const dy = e.clientY - (r.top + r.height / 2);
            const dist = Math.hypot(dx, dy);
            const max = Math.max(r.width, r.height) * 0.8;
            if (dist < max) {
              const pull = 1 - dist / max;
              gsap.to(btn, { x: dx * pull * 0.45, y: dy * pull * 0.45, duration: 0.4, ease: 'power2.out' });
            }
          };

          const onMouseLeave = () => {
            gsap.to(btn, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.4)' });
          };

          wrap.addEventListener('mousemove', onMouseMove);
          wrap.addEventListener('mouseleave', onMouseLeave);
          listeners.push({ wrap, onMouseMove, onMouseLeave });
        });
      }, sectionRef);

      ScrollTrigger.refresh();
    }

    const timer = setTimeout(init, 100);

    return () => {
      active = false;
      clearTimeout(timer);
      ctx?.revert();
      listeners.forEach(({ wrap, onMouseMove, onMouseLeave }) => {
        wrap.removeEventListener('mousemove', onMouseMove);
        wrap.removeEventListener('mouseleave', onMouseLeave);
      });
    };
  }, []);

  return (
    <section ref={sectionRef} className={styles.products} id="products">
      {/* Decorative geo SVG */}
      <svg className={styles.geo} viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
        <circle cx="200" cy="200" r="195" fill="none" stroke="#b8693a" strokeWidth="1" />
        <circle cx="200" cy="200" r="155" fill="none" stroke="#b8693a" strokeWidth=".6" />
        <circle cx="200" cy="200" r="115" fill="none" stroke="#b8693a" strokeWidth=".6" />
        <circle cx="200" cy="200" r="75"  fill="none" stroke="#b8693a" strokeWidth=".6" />
        <circle cx="200" cy="200" r="35"  fill="none" stroke="#b8693a" strokeWidth=".6" />
        <line x1="200" y1="5"   x2="200" y2="395" stroke="#b8693a" strokeWidth=".3" opacity=".5" />
        <line x1="5"   y1="200" x2="395" y2="200" stroke="#b8693a" strokeWidth=".3" opacity=".5" />
        <line x1="62"  y1="62"  x2="338" y2="338" stroke="#b8693a" strokeWidth=".3" opacity=".5" />
        <line x1="338" y1="62"  x2="62"  y2="338" stroke="#b8693a" strokeWidth=".3" opacity=".5" />
      </svg>

      <h2 className={`serif ${styles.sectionTitle} split-text`}>Assorted Infusions</h2>

      <div className={styles.availabilityRow}>
        <span>Instant Checkout Available on</span>
        <div className={styles.partnerLogos}>
          <a href="https://amazon.in/AMATA-Jute-Leaf-Tea-ANTIOXIDANT/dp/B0FC6TVHFC" target="_blank" rel="noopener noreferrer" className={styles.partnerAmazonLink}>
            <img src="/images/amazon-icon.svg" alt="Amazon Logo" className={styles.partnerAmazonIcon} />
            <span>Buy on Amazon</span>
          </a>
        </div>
      </div>

      <div className={styles.grid}>
        {products.slice(0, 4).map((p) => <ProductCard key={p.id} product={p} />)}
      </div>

      <div className={styles.viewAllRow}>
        <Link href="/products" className="amata-btn amata-btn--glass">
          Explore all Moroheiya / Jute blends &rarr;
        </Link>
      </div>
    </section>
  );
}
