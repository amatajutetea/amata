import { useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Layout from '../src/components/layout/Layout';
import { useCart, formatPrice } from '../src/context/CartContext';
import products from '../src/data/products';
import styles from '../src/styles/products.module.css';

function ProductCard({ product }) {
  const { addItem, currency, lang } = useCart();
  const cardRef = useRef(null);

  useEffect(() => {
    let ctx;
    async function init() {
      const { gsap } = await import('gsap');
      ctx = gsap.context(() => {
        gsap.fromTo(cardRef.current,
          { y: 40, opacity: 0 },
          { y: 0, opacity: 1, duration: 1, ease: 'power3.out' }
        );
      });
    }
    init();
    return () => ctx?.revert();
  }, []);

  return (
    <div ref={cardRef} className={styles.card}>
      <Link href={`/product/${product.slug}`} className={styles.imgMask}>
        <Image
          src={product.primaryImage}
          className={styles.imgPrimary}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <Image
          src={product.hoverImage}
          className={styles.imgReveal}
          alt={`${product.name} – ritual`}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </Link>
      
      <div className={styles.cardBody}>
        <div className={styles.cardTagRow}>
          <span className={styles.cardTag}>{product.certifications[0]}</span>
          <span className={styles.cardWeight}>{product.weight}</span>
        </div>
        
        <div className={styles.head}>
          <h3 className={`serif ${styles.cardTitle}`}>
            <Link href={`/product/${product.slug}`}>
              {lang === 'JP' && product.nameJp ? product.nameJp : product.name}
            </Link>
          </h3>
          <div className={styles.price}>{formatPrice(product.price, currency)}</div>
        </div>
        
        <div className={styles.nameJp}>{lang === 'JP' ? '' : product.nameJp}</div>
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
            onClick={() => product.inStock && addItem(product)}
            disabled={!product.inStock}
            style={!product.inStock ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
          >
            {product.inStock ? 'Add to Satchel Bag' : 'Out of Stock'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  const pageRef = useRef(null);

  useEffect(() => {
    let ctx;
    async function init() {
      const { gsap } = await import('gsap');
      ctx = gsap.context(() => {
        gsap.fromTo(`.${styles.header} > *`,
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 1, stagger: 0.15, ease: 'power3.out' }
        );
      }, pageRef);
    }
    init();
    return () => ctx?.revert();
  }, []);

  return (
    <Layout 
      title="Amata | Organic Moroheiya Jute Tea Collection"
      description="Explore Amata's organic prebiotic Jute Leaf Tea collection, featuring custom Moroheiya blends like Ginger, Elaichi, Honey, and Citrus for gut-brain wellness."
      canonical="https://amatajutetea.com/products"
    >
      <div ref={pageRef} className={styles.page}>
        <header className={styles.header}>
          <div className={styles.label}>Our Collections · コレクション</div>
          <h1 className="serif split-text" style={{ fontSize: 'clamp(3rem, 6vw, 5rem)', marginBottom: '1.5rem', lineHeight: 1.1 }}>
            Moroheiya Infusions
          </h1>
          <p className={styles.subtitle}>
            Crafted to stimulate prebiotic activity, optimize the <strong>Gut-Brain Axis</strong> naturally, and ground your spirit in tranquility.
          </p>
        </header>

        <div className={styles.grid}>
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <section className={styles.integritySection}>
          <h2 className="serif">Purity in Every Pour</h2>
          <p>
            No preservatives. No pesticides. Strictly caffeine-free botanical energy formulated with Ayurvedic wisdom and Japanese craftsmanship. Every cup nurtures the symbiotic connection between your mind and your microbiome.
          </p>
          <div className={styles.linksRow}>
            <Link href="/learn" className="amata-btn amata-btn--sand">
              Learn the Science &rarr;
            </Link>
          </div>
        </section>
      </div>
    </Layout>
  );
}
