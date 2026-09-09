import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { CartProvider } from '../src/context/CartContext';
import MetaPixel from '../src/components/analytics/MetaPixel';
import useMetaEngagement from '../src/hooks/useMetaEngagement';
import * as fpixel from '../src/lib/fpixel';
import '../src/styles/globals.css';

function SmoothScroll() {
  const router = useRouter();

  useEffect(() => {
    let lenis;
    let isActive = true;
    let tickerCallback;

    async function init() {
      const { default: Lenis } = await import('@studio-freight/lenis');
      const { gsap }           = await import('gsap');
      const { ScrollTrigger }  = await import('gsap/ScrollTrigger');
      gsap.registerPlugin(ScrollTrigger);

      if (!isActive) return;

      lenis = new Lenis({
        lerp: 0.08,
        wheelMultiplier: 0.8,
        smoothWheel: true,
      });
      window.lenis = lenis;

      lenis.on('scroll', () => {
        ScrollTrigger.update();
      });

      tickerCallback = (time) => {
        lenis.raf(time * 1000);
      };
      
      gsap.ticker.add(tickerCallback);
      gsap.ticker.lagSmoothing(0, 0);

      // Settle layout offsets
      setTimeout(() => {
        if (isActive) {
          ScrollTrigger.refresh();
          lenis.resize();
        }
      }, 350);

      // Handle custom fonts loading dynamically
      if (document.fonts) {
        document.fonts.ready.then(() => {
          if (isActive) {
            ScrollTrigger.refresh();
            lenis.resize();
          }
        });
      }
    }

    init();

    // Global listeners to automatically recalculate triggers on dynamic layout adjustments
    const handleSettle = () => {
      import('gsap/ScrollTrigger').then(({ ScrollTrigger }) => {
        ScrollTrigger.refresh();
      });
    };
    window.addEventListener('load', handleSettle);
    window.addEventListener('resize', handleSettle);

    return () => {
      isActive = false;
      window.removeEventListener('load', handleSettle);
      window.removeEventListener('resize', handleSettle);
      if (lenis) {
        lenis.destroy();
        delete window.lenis;
      }
      if (tickerCallback) {
        import('gsap').then(({ gsap }) => {
          gsap.ticker.remove(tickerCallback);
        });
      }
    };
  }, []);

  useEffect(() => {
    const handleRouteChange = () => {
      // Instantly scroll back up
      window.scrollTo(0, 0);

      // Track Meta Pixel pageview on route change
      fpixel.pageview();

      // Delay trigger refresh to let new DOM hydrate & render
      setTimeout(async () => {
        const { ScrollTrigger } = await import('gsap/ScrollTrigger');
        ScrollTrigger.refresh();
        window.lenis?.resize();
      }, 400);
    };

    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router]);

  return null;
}

function SplitTextInit() {
  const router = useRouter();

  useEffect(() => {
    let ctx;
    let isActive = true;

    function splitNode(node) {
      if (node.nodeType === 3) {
        const text = node.textContent;
        const frag = document.createDocumentFragment();
        text.split(/(\s+)/).forEach((part) => {
          if (part.trim().length > 0) {
            const wrap  = document.createElement('div');
            wrap.style.cssText = 'display:inline-block;overflow:hidden;vertical-align:bottom;padding-right:.18em;padding-bottom:.2em;margin-bottom:-.2em;';
            const inner = document.createElement('div');
            inner.className    = 'word';
            inner.innerText    = part;
            inner.style.display = 'inline-block';
            wrap.appendChild(inner);
            frag.appendChild(wrap);
          } else if (part.length > 0) {
            frag.appendChild(document.createTextNode(part));
          }
        });
        node.parentNode.replaceChild(frag, node);
      } else {
        Array.from(node.childNodes).forEach(splitNode);
      }
    }

    async function run() {
      const { gsap } = await import('gsap');
      const { ScrollTrigger } = await import('gsap/ScrollTrigger');
      gsap.registerPlugin(ScrollTrigger);

      if (!isActive) return;

      // 1. Process splitting for unsplit containers
      const containers = document.querySelectorAll('.split-text:not(.split-done)');
      containers.forEach((el) => {
        el.dataset.originalHtml = el.innerHTML;
        splitNode(el);
        el.classList.add('split-done');
      });

      // 2. Animate inside a clean GSAP context
      ctx = gsap.context(() => {
        document.querySelectorAll('.split-text').forEach((textContainer) => {
          const words = textContainer.querySelectorAll('.word');
          if (words.length > 0) {
            gsap.fromTo(words, 
              { y: '120%', opacity: 0 },
              {
                y: '0%',
                opacity: 1,
                duration: 1.2,
                ease: 'power4.out',
                stagger: 0.08,
                scrollTrigger: {
                  trigger: textContainer,
                  start: 'top 88%',
                  toggleActions: 'play reverse play reverse',
                }
              }
            );
          }
        });

        // Breeze animation is now handled natively via optimized hardware-accelerated CSS in globals.css
      });

      ScrollTrigger.refresh();
    }

    const timer = setTimeout(run, 150);

    return () => {
      isActive = false;
      clearTimeout(timer);
      if (ctx) {
        ctx.revert();
      }
      // Revert the split HTML back to original text to keep transitions clean
      document.querySelectorAll('.split-text.split-done').forEach((el) => {
        if (el.dataset.originalHtml) {
          el.innerHTML = el.dataset.originalHtml;
          el.classList.remove('split-done');
        }
      });
    };
  }, [router.asPath]);

  return null;
}

export default function App({ Component, pageProps }) {
  useMetaEngagement();

  return (
    <CartProvider>
      <MetaPixel />
      <SmoothScroll />
      <SplitTextInit />
      <Component {...pageProps} />
    </CartProvider>
  );
}
