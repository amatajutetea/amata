// Static product data — Firestore is the source of truth in production.
// These serve as fallbacks and for static generation.

const products = [
  {
    id: "ginger-moroheiya-infusion",
    slug: "ginger-moroheiya-infusion",
    name: "Ginger Moroheiya Infusion",
    nameJp: "生姜モロヘイヤ茶",
    price: 499,
    currency: "INR",
    primaryImage: "/images/products/ginger/ginger.jpg",
    hoverImage: "/images/products/ginger/2.jpeg",
    images: [
      "/images/products/ginger/ginger.jpg",
      "/images/products/ginger/2.jpeg"
    ],
    description:
      "A warming blend of hand-picked Moroheiya leaves infused with organic ginger root. Specially designed to balance the gut-brain axis, stimulate digestion, and provide a comforting, spicy finish.",
    longDescription:
      "Our Ginger Moroheiya Infusion is crafted from the youngest Moroheiya leaves, shade-grown in Bengal and processed using traditional Japanese steaming techniques. The addition of organic ginger root creates a warming synergy that stimulates digestive fire (Agni), reduces system-wide inflammation, and balances the gut-brain axis. With an abundant concentration of prebiotic polysaccharides, it provides caffeine-free sustained vitality and deep inner peace.",
    ingredients: [
      "Hand-picked organic Moroheiya leaves",
      "Organic sliced ginger root",
      "Natural citrus orange peel",
    ],
    benefits: [
      "Optimizes gut-brain axis communication",
      "Rich in prebiotic polysaccharides for microbiome diversity",
      "Stimulates digestive fire (Agni) & reduces bloating",
      "100% caffeine-free sustainable clean energy",
    ],
    brewing:
      "Steep 1 tea bag in 200ml fresh water at 80°C (176°F) for 3-5 minutes. Perfect as a morning warming ritual or an iced summer refresh.",
    weight: "60g (24 sachets x 2.5g)",
    servings: 24,
    certifications: ["BMQ Organic certified", "JAS Certified", "India Organic"],
    inStock: true,
    featured: true,
    sizes: [
      { pieces: 24, inStock: true, price: 499 }
    ]
  },
  {
    id: "elaichi-moroheiya-infusion",
    slug: "elaichi-moroheiya-infusion",
    name: "Elaichi Moroheiya Infusion",
    nameJp: "エライチモロヘイヤ茶",
    price: 499,
    currency: "INR",
    primaryImage: "/images/products/elaichi/elaichi.jpg",
    hoverImage: "/images/products/elaichi/2.jpeg",
    images: [
      "/images/products/elaichi/elaichi.jpg",
      "/images/products/elaichi/2.jpeg"
    ],
    description:
      "Our signature Moroheiya infusion base enhanced with aromatic Kerala green elaichi. A fragrant, soothing brew that fosters gut-brain harmony, balances doshas, and refreshes the senses.",
    longDescription:
      "The Elaichi Moroheiya Infusion marries the earthy depth and rich prebiotic fibers of Moroheiya with the ethereal fragrance of pure Kerala green elaichi (cardamom). This premium blend is meticulously formulated to nurture your gut microbiome, directly supporting vagus nerve stimulation for a calm, centered mind. It balances Vata and Pitta doshas while offering a naturally sweet, aromatic experience.",
    ingredients: [
      "Hand-picked organic Moroheiya leaves",
      "Kerala green elaichi pods (cardamom)",
      "Zero artificial additives or preservatives",
    ],
    benefits: [
      "Fosters vagus nerve health and gut-brain harmony",
      "Supports diverse, healthy gut microbiome development",
      "Balances Vata, Pitta, and Kapha Ayurvedic doshas",
      "Rich in natural antioxidants, chlorophyll, and vitamins",
    ],
    brewing:
      "Steep 1 tea bag in 200ml hot water at 80°C (176°F) for 4-5 minutes. Exceptional as a grounding evening wind-down ritual.",
    weight: "60g (24 sachets x 2.5g)",
    servings: 24,
    certifications: ["BMQ Organic certified", "JAS Certified", "India Organic"],
    inStock: true,
    featured: true,
    sizes: [
      { pieces: 24, inStock: true, price: 499 }
    ]
  },
  {
    id: "honey-moroheiya-infusion",
    slug: "honey-moroheiya-infusion",
    name: "Honey Moroheiya Infusion",
    nameJp: "ハニーモロヘイヤ茶",
    price: 378,
    currency: "INR",
    primaryImage: "/images/products/honey.jpg",
    hoverImage: "/images/products/honey.jpg",
    description:
      "A naturally sweet, smooth blend combining the earthy depth of Moroheiya leaves with natural honey granules. A soothing remedy to coat and calm the digestive tract.",
    longDescription:
      "Our Honey Moroheiya Infusion is a beautifully balanced blend, combining the earthy, nutrient-rich base of organic Moroheiya leaves with natural, crystallized honey granules. This caffeine-free infusion provides a smooth, gentle sweetness that coats the digestive tract, encouraging healthy gut barrier function. Formulated with prebiotic fibers, it acts as a calming elixir that helps harmonize the stomach and quiet the mind, making it the perfect restorative afternoon or evening ceremony.",
    ingredients: [
      "Hand-picked organic Moroheiya leaves",
      "Natural honey granules",
      "Sweet botanical extract"
    ],
    benefits: [
      "Soothes and coats the digestive lining",
      "Delivers gentle, natural sweetness without refined sugar",
      "Rich in prebiotic polysaccharides for gut health",
      "Induces a state of calm and mental relaxation"
    ],
    brewing:
      "Steep 1 tea bag in 200ml fresh water at 80°C (176°F) for 3-4 minutes. Enjoy warm to experience full aromatic sweetness.",
    weight: "48g (24 bags x 2g)",
    servings: 24,
    certifications: ["BMQ Organic certified", "JAS Certified", "India Organic"],
    inStock: false,
    featured: true,
    sizes: [
      { pieces: 12, inStock: false, price: 210 },
      { pieces: 24, inStock: false, price: 378 }
    ]
  },
  {
    id: "citrus-moroheiya-infusion",
    slug: "citrus-moroheiya-infusion",
    name: "Citrus Moroheiya Infusion",
    nameJp: "シトラスモロヘイヤ茶",
    price: 378,
    currency: "INR",
    primaryImage: "/images/products/citrus.jpg",
    hoverImage: "/images/products/citrus.jpg",
    description:
      "A bright, zesty blend of premium Moroheiya leaves infused with organic orange peel and lemon peel. Revitalizes your senses and supports daily detoxification.",
    longDescription:
      "Wake up your senses and support your body's natural digestive processes with our Citrus Moroheiya Infusion. We combine organic, shade-grown Moroheiya leaves with sun-dried orange peel, lemon peel, and pure citrus botanical oils. This bright, uplifting blend is rich in vitamin C and active bioflavonoids, boosting gut motility and daily detoxification. 100% caffeine-free, it provides a clean, zesty burst of energy while feeding key prebiotic-loving flora.",
    ingredients: [
      "Hand-picked organic Moroheiya leaves",
      "Organic orange peel",
      "Organic lemon peel",
      "Natural citrus oils"
    ],
    benefits: [
      "Supports daily liver detoxification and gut motility",
      "Rich in protective bioflavonoids and antioxidant Vitamin C",
      "Uplifts mental energy and focus without caffeine",
      "Zesty, refreshing flavor profile"
    ],
    brewing:
      "Steep 1 tea bag in 200ml fresh water at 80°C (176°F) for 3-4 minutes. Refreshing both hot and iced.",
    weight: "48g (24 bags x 2g)",
    servings: 24,
    certifications: ["BMQ Organic certified", "JAS Certified", "India Organic"],
    inStock: false,
    featured: true,
    sizes: [
      { pieces: 12, inStock: false, price: 210 },
      { pieces: 24, inStock: false, price: 378 }
    ]
  },
  {
    id: "cinnamon-moroheiya-infusion",
    slug: "cinnamon-moroheiya-infusion",
    name: "Cinnamon Moroheiya Infusion",
    nameJp: "シナモンモロヘイヤ茶",
    price: 378,
    currency: "INR",
    primaryImage: "/images/products/cinnamon.jpg",
    hoverImage: "/images/products/cinnamon.jpg",
    description:
      "A sweet, warming blend of premium Moroheiya leaves and high-grade organic cinnamon bark. A comforting tea that helps regulate metabolic health and supports digestion.",
    longDescription:
      "A comforting and earthy blend, our Cinnamon Moroheiya Infusion pairs the nutrient-dense profile of Moroheiya with premium, sweet organic cinnamon bark (Ceylon type). Renowned in Ayurveda for stimulating the digestive fire (Agni) and helping regulate metabolic function and blood sugar levels. Highly rich in prebiotic polysaccharides, it coats the stomach, relieves bloating, and serves as a warming, caffeine-free wellness ritual for any time of day.",
    ingredients: [
      "Hand-picked organic Moroheiya leaves",
      "Organic cinnamon bark pieces",
      "Natural spice extract"
    ],
    benefits: [
      "Supports healthy metabolic function and insulin sensitivity",
      "Stimulates digestive fire (Agni) and reduces system bloating",
      "Delivers high prebiotic fibers to nourish beneficial bacteria",
      "Warming, naturally sweet spice profile"
    ],
    brewing:
      "Steep 1 tea bag in 200ml hot water at 80°C (176°F) for 4 minutes. A wonderful post-meal digestif.",
    weight: "48g (24 bags x 2g)",
    servings: 24,
    certifications: ["BMQ Organic certified", "JAS Certified", "India Organic"],
    inStock: false,
    featured: false,
    sizes: [
      { pieces: 12, inStock: false, price: 210 },
      { pieces: 24, inStock: false, price: 378 }
    ]
  },
  {
    id: "lemongrass-moroheiya-infusion",
    slug: "lemongrass-moroheiya-infusion",
    name: "Lemongrass Moroheiya Infusion",
    nameJp: "レモングラスモロヘイヤ茶",
    price: 378,
    currency: "INR",
    primaryImage: "/images/products/lemongrass.jpg",
    hoverImage: "/images/products/lemongrass.jpg",
    description:
      "A citrusy, refreshing blend of nutrient-dense Moroheiya leaves and organic cut lemongrass. Perfect for cooling down, boosting immunity, and uplifting your mood.",
    longDescription:
      "Indulge in a crisp, refreshing cup of Lemongrass Moroheiya Infusion. Combining the prebiotic-rich base of Moroheiya with high-grade organic cut lemongrass, this infusion delivers a citrusy, aromatic escape that helps cool down excess Pitta (heat) in the body and mind. It supports immune defenses, improves digestive ease, and provides a clear, calm headspace without caffeine.",
    ingredients: [
      "Hand-picked organic Moroheiya leaves",
      "Organic cut lemongrass",
      "Fresh botanical essences"
    ],
    benefits: [
      "Cools the digestive tract and supports immune health",
      "Relieves daily stress and clears mental clutter",
      "Feeds prebiotic-loving gut flora for overall well-being",
      "Clean, bright citrus notes"
    ],
    brewing:
      "Steep 1 tea bag in 200ml hot water at 80°C (176°F) for 3-5 minutes. Excellent served hot or over ice on a warm day.",
    weight: "48g (24 bags x 2g)",
    servings: 24,
    certifications: ["BMQ Organic certified", "JAS Certified", "India Organic"],
    inStock: false,
    featured: false,
    sizes: [
      { pieces: 12, inStock: false, price: 210 },
      { pieces: 24, inStock: false, price: 378 }
    ]
  }
];

export default products;

export function getProductBySlug(slug) {
  return products.find((p) => p.slug === slug) || null;
}
