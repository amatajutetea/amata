export const FB_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || '2190246995259813';

// Track pageviews on route change
export const pageview = () => {
  if (typeof window !== 'undefined' && window.fbq && FB_PIXEL_ID) {
    window.fbq('track', 'PageView');
  }
};

// Track standard Meta events (AddToCart, InitiateCheckout, Purchase, etc.)
export const event = (name, options = {}) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', name, options);
  }
};

// Track custom Meta events (TimeSpentOnPage, EngagedVisitor, ScrollDepth, etc.)
export const customEvent = (name, options = {}) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('trackCustom', name, options);
  }
};
