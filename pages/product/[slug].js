import { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Head from 'next/head';
import Layout from '../../src/components/layout/Layout';
import { useCart, formatPrice } from '../../src/context/CartContext';
import products, { getProductBySlug } from '../../src/data/products';
import styles from '../../src/styles/product.module.css';

export default function ProductPage({ product }) {
  const { addItem, currency, lang } = useCart();
  const [activeImg, setActiveImg] = useState(0);
  const [selectedSize, setSelectedSize] = useState(24);
  const heroRef = useRef(null);

  const images = product?.images || (product ? [product.primaryImage, product.hoverImage] : []);

  useEffect(() => {
    let ctx;
    let active = true;
    async function init() {
      const { gsap }          = await import('gsap');
      const { ScrollTrigger } = await import('gsap/ScrollTrigger');
      gsap.registerPlugin(ScrollTrigger);
      if (!active) return;
      ctx = gsap.context(() => {
        gsap.fromTo(`.${styles.productInfo} > *`, 
          { y: 40, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, stagger: 0.12, ease: 'power3.out', delay: 0.3 }
        );
      }, heroRef);
    }
    init();
    return () => {
      active = false;
      ctx?.revert();
    };
  }, []);

  useEffect(() => {
    if (!product || images.length <= 1) return;

    const isSlideProduct = product.slug?.includes('elaichi') || product.slug?.includes('ginger');
    if (!isSlideProduct) return;

    const interval = setInterval(() => {
      setActiveImg((prev) => (prev + 1) % images.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [activeImg, images.length, product]);

  if (!product) return null;
  const selectedSizeInfo = product.sizes?.find(s => s.pieces === selectedSize) || { price: product.price, inStock: product.inStock };
  const currentPrice = selectedSizeInfo.price;
  const isAvailable = selectedSizeInfo.inStock && product.inStock;

  const [added, setAdded] = useState(false);

  const handleAddToCart = () => {
    if (!isAvailable) return;
    addItem({
      ...product,
      id: `${product.id}-${selectedSize}`,
      name: `${product.name} (${selectedSize} pieces)`,
      price: currentPrice,
      weight: `${selectedSize * 2}g (${selectedSize} bags x 2g)`,
      servings: selectedSize
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  const productSchema = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.name,
    "image": [
      product.primaryImage.startsWith('http') ? product.primaryImage : `https://amatajutetea.com${product.primaryImage}`,
      product.hoverImage.startsWith('http') ? product.hoverImage : `https://amatajutetea.com${product.hoverImage}`
    ],
    "description": product.description,
    "sku": product.id,
    "offers": {
      "@type": "Offer",
      "url": `https://amatajutetea.com/product/${product.slug}`,
      "priceCurrency": product.currency || "INR",
      "price": currentPrice,
      "itemCondition": "https://schema.org/NewCondition",
      "availability": isAvailable ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
    }
  };

  return (
    <Layout 
      title={`Amata | ${product.name}`}
      description={product.description}
      ogImage={product.primaryImage}
      ogType="product"
      canonical={`https://amatajutetea.com/product/${product.slug}`}
    >
      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
        />
      </Head>
      <div ref={heroRef} className={styles.hero}>
        {/* Images */}
        <div className={styles.imageCol}>
          <div className={styles.mainImgWrap}>
            <Image src={images[activeImg]} alt={product.name} className={styles.mainImg} fill sizes="(max-width: 1024px) 100vw, 50vw" priority />
          </div>
          <div className={styles.thumbRow}>
            {images.map((img, i) => (
              <button
                key={i}
                className={`${styles.thumb} ${activeImg === i ? styles.thumbActive : ''}`}
                onClick={() => setActiveImg(i)}
              >
                <Image src={img} alt={`View ${i + 1}`} width={80} height={80} style={{ objectFit: 'cover' }} />
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className={styles.productInfo}>
          <div className={styles.tag}>{product.certifications[0]}</div>
          <h1 className={`serif ${styles.title}`}>
            {lang === 'JP' && product.nameJp ? product.nameJp : product.name}
          </h1>
          <div className={styles.nameJp}>{lang === 'JP' ? '' : product.nameJp}</div>
          <div className={styles.price}>{formatPrice(currentPrice, currency)}</div>
          <p className={styles.desc}>{product.longDescription}</p>

          {/* Size Selector */}
          <div className={styles.sizeSelectorSection}>
            <div className={styles.sizeLabel}>Select Size</div>
            <div className={styles.sizeGroup}>
              {product.sizes?.map((sz) => (
                <button
                  key={sz.pieces}
                  type="button"
                  className={`${styles.sizeBtn} ${selectedSize === sz.pieces ? styles.sizeBtnActive : ''} ${!sz.inStock ? styles.sizeBtnDisabled : ''}`}
                  onClick={() => sz.inStock && setSelectedSize(sz.pieces)}
                  disabled={!sz.inStock}
                >
                  <span className={styles.sizePieces}>{sz.pieces} Pieces</span>
                  {!sz.inStock && <span className={styles.sizeStatus}>(Unavailable)</span>}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.noticeBanner}>
            <span>⚡</span> Direct payment & shipping active. You can also order directly on Amazon!
          </div>

          <div className={styles.ctaRow}>
            <a
              href="https://amazon.in/AMATA-Jute-Leaf-Tea-ANTIOXIDANT/dp/B0FC6TVHFC"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.amazonCtaBtn}
            >
              <img src="/images/amazon-icon.svg" alt="Amazon Logo" className={styles.amazonCtaIcon} />
              <span>Buy on Amazon</span>
            </a>

            <button
              className={`amata-btn amata-btn--sand ${styles.addBtn}`}
              onClick={handleAddToCart}
              disabled={!isAvailable}
              style={!isAvailable ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
            >
              {added ? 'Added ✓' : (isAvailable ? 'Add to Satchel Bag' : 'Out of Stock')}
            </button>
          </div>

          {/* Details accordion */}
          <div className={styles.details}>
            <DetailBlock title="Ingredients" items={product.ingredients} />
            <DetailBlock title="Benefits" items={product.benefits} />
            <DetailBlock title="Brewing Guide" text={product.brewing} />
            <DetailBlock title="Weight / Servings" text={`${selectedSize * 2}g (${selectedSize} tea bags) · ${selectedSize} servings`} />
          </div>
        </div>
      </div>

      {/* Recommended Products Section */}
      <div className={styles.recommendedSection}>
        <h2 className={`serif ${styles.recommendedTitle}`}>Complementary Moroheiya Rituals</h2>
        <p className={styles.recommendedSubtitle}>
          Complete your prebiotic wellness ceremony with these premium blends optimized for the <strong>Gut-Brain Axis</strong>.
        </p>
        <div className={styles.recommendedGrid}>
          {products.filter((p) => p.id !== product.id).slice(0, 3).map((p) => (
            <Link key={p.id} href={`/product/${p.slug}`} className={styles.recommendCard}>
              <div className={styles.recommendImgWrap}>
                <Image src={p.primaryImage} alt={p.name} className={styles.recommendImg} fill sizes="(max-width: 768px) 100vw, 33vw" />
              </div>
              <h3 className={`serif ${styles.recommendName}`}>
                {lang === 'JP' && p.nameJp ? p.nameJp : p.name}
              </h3>
              <div className={styles.recommendPrice}>{formatPrice(p.price, currency)}</div>
            </Link>
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: '3.5rem' }}>
          <Link href="/products" className="amata-btn amata-btn--sand">
            Explore All Collections &rarr;
          </Link>
        </div>
      </div>
    </Layout>
  );
}

function DetailBlock({ title, items, text }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={styles.detailBlock}>
      <button className={styles.detailHead} onClick={() => setOpen(!open)}>
        <span>{title}</span>
        <span className={styles.detailIcon} style={{ transform: open ? 'rotate(45deg)' : 'none' }}>+</span>
      </button>
      <div className={styles.detailBody} style={{ maxHeight: open ? '400px' : '0px' }}>
        {items ? (
          <ul className={styles.detailList}>
            {items.map((item) => <li key={item}>{item}</li>)}
          </ul>
        ) : (
          <p>{text}</p>
        )}
      </div>
    </div>
  );
}

export function getStaticPaths() {
  return {
    paths: products.map((p) => ({ params: { slug: p.slug } })),
    fallback: false,
  };
}

export function getStaticProps({ params }) {
  const product = getProductBySlug(params.slug);
  if (!product) return { notFound: true };
  return { props: { product } };
}
