import {
  PrismaClient,
  EBikeStatus,
  AccessoryCategory,
  AccessoryStatus,
  StoreType,
  StoreStatus,
  TestimonialType,
  FAQCategory,
  GroodPageStatus,
} from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const dbPath =
  process.env.DATABASE_URL?.replace("file:", "") || "./prisma/dev.db";
const adapter = new PrismaBetterSqlite3({ url: dbPath });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding Grood CMS data...");

  // Get the default organization
  let organization = await prisma.organization.findFirst({
    where: { slug: "grood" },
  });

  // Create organization if it doesn't exist
  if (!organization) {
    organization = await prisma.organization.create({
      data: {
        name: "Grood",
        slug: "grood",
        description: "Premium electric bikes designed for the modern city",
        website: "https://getgrood.com",
      },
    });
    console.log("✅ Created Grood organization");
  }

  const organizationId = organization.id;

  // =====================
  // SEED E-BIKES
  // =====================
  console.log("🚴 Seeding E-Bikes...");

  const ebikes = [
    {
      name: "Grood S1",
      slug: "grood-s1",
      tagline: "Our flagship city bike",
      description: {
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "The iconic straight frame, re-engineered for the modern city. Silent power meets timeless design.",
              },
            ],
          },
        ],
      },
      price: 2498,
      originalPrice: 2698,
      heroImage:
        "https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=1200&q=80",
      galleryImages: [
        "https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=1200&q=80",
        "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80",
        "https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?w=1200&q=80",
      ],
      colors: [
        {
          name: "Matte Black",
          hex: "#1a1a1a",
          image:
            "https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=800&q=80",
        },
        {
          name: "Silver Gray",
          hex: "#8c8c8c",
          image:
            "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
        },
        {
          name: "Ocean Blue",
          hex: "#2563eb",
          image:
            "https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?w=800&q=80",
        },
      ],
      specs: {
        range: "150 km",
        speed: "25 km/h",
        weight: "21 kg",
        battery: "504 Wh",
        motor: "250W front hub",
        chargeTime: "4 hours",
        gears: "Automatic 4-speed",
      },
      features: [
        {
          icon: "Zap",
          title: "Turbo Boost",
          description: "Hit top speed instantly with the press of a button",
        },
        {
          icon: "Shield",
          title: "Anti-Theft",
          description: "GPS tracking, smart lock, and instant alerts",
        },
        {
          icon: "Smartphone",
          title: "App Connected",
          description:
            "Track rides, customize settings, unlock with your phone",
        },
      ],
      badge: "Best Seller",
      status: "PUBLISHED" as EBikeStatus,
      order: 1,
    },
    {
      name: "Grood S1 Open",
      slug: "grood-s1-open",
      tagline: "Step-through design",
      description: {
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "Same power, easier access. The open frame design makes it perfect for any rider, any outfit.",
              },
            ],
          },
        ],
      },
      price: 2498,
      originalPrice: 2698,
      heroImage:
        "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80",
      galleryImages: [
        "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80",
        "https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=1200&q=80",
      ],
      colors: [
        {
          name: "Silver Gray",
          hex: "#8c8c8c",
          image:
            "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
        },
        {
          name: "Matte Black",
          hex: "#1a1a1a",
          image:
            "https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=800&q=80",
        },
        {
          name: "Pearl White",
          hex: "#f5f5f5",
          image:
            "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
        },
      ],
      specs: {
        range: "150 km",
        speed: "25 km/h",
        weight: "21 kg",
        battery: "504 Wh",
        motor: "250W front hub",
        chargeTime: "4 hours",
        gears: "Automatic 4-speed",
      },
      features: [
        {
          icon: "Zap",
          title: "Turbo Boost",
          description: "Hit top speed instantly with the press of a button",
        },
        {
          icon: "Shield",
          title: "Anti-Theft",
          description: "GPS tracking, smart lock, and instant alerts",
        },
        {
          icon: "Smartphone",
          title: "App Connected",
          description:
            "Track rides, customize settings, unlock with your phone",
        },
      ],
      badge: null,
      status: "PUBLISHED" as EBikeStatus,
      order: 2,
    },
    {
      name: "Grood X1",
      slug: "grood-x1",
      tagline: "Compact urban explorer",
      description: {
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "Urban agility meets all-terrain capability. Smaller frame, same big performance.",
              },
            ],
          },
        ],
      },
      price: 2298,
      originalPrice: 2498,
      heroImage:
        "https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?w=1200&q=80",
      galleryImages: [
        "https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?w=1200&q=80",
        "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80",
      ],
      colors: [
        {
          name: "Ocean Blue",
          hex: "#2563eb",
          image:
            "https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?w=800&q=80",
        },
        {
          name: "Matte Black",
          hex: "#1a1a1a",
          image:
            "https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=800&q=80",
        },
        {
          name: "Forest Green",
          hex: "#166534",
          image:
            "https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?w=800&q=80",
        },
      ],
      specs: {
        range: "120 km",
        speed: "25 km/h",
        weight: "19 kg",
        battery: "418 Wh",
        motor: "250W front hub",
        chargeTime: "3.5 hours",
        gears: "Automatic 4-speed",
      },
      features: [
        {
          icon: "Zap",
          title: "Turbo Boost",
          description: "Hit top speed instantly with the press of a button",
        },
        {
          icon: "Shield",
          title: "Anti-Theft",
          description: "GPS tracking, smart lock, and instant alerts",
        },
        {
          icon: "Smartphone",
          title: "App Connected",
          description:
            "Track rides, customize settings, unlock with your phone",
        },
      ],
      badge: "New",
      status: "PUBLISHED" as EBikeStatus,
      order: 3,
    },
  ];

  for (const ebike of ebikes) {
    await prisma.eBike.upsert({
      where: { slug_organizationId: { slug: ebike.slug, organizationId } },
      update: ebike,
      create: { ...ebike, organizationId },
    });
  }
  console.log(`✅ Seeded ${ebikes.length} e-bikes`);

  // =====================
  // SEED ACCESSORIES
  // =====================
  console.log("🎒 Seeding Accessories...");

  const accessories = [
    {
      name: "Grood Front Carrier",
      slug: "grood-front-carrier",
      price: 89,
      originalPrice: null,
      category: "BAGS" as AccessoryCategory,
      badge: null,
      rating: 4.8,
      reviewCount: 124,
      image:
        "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80",
    },
    {
      name: "Grood Pannier Bag",
      slug: "grood-pannier-bag",
      price: 69,
      originalPrice: null,
      category: "BAGS" as AccessoryCategory,
      badge: "Best Seller",
      rating: 4.9,
      reviewCount: 256,
      image:
        "https://images.unsplash.com/photo-1553531384-cc64ac80f931?w=600&q=80",
    },
    {
      name: "Smart Lock Pro",
      slug: "smart-lock-pro",
      price: 149,
      originalPrice: 179,
      category: "SAFETY" as AccessoryCategory,
      badge: "Sale",
      rating: 4.7,
      reviewCount: 89,
      image:
        "https://images.unsplash.com/photo-1558618047-f4b511986f01?w=600&q=80",
    },
    {
      name: "Grood Helmet",
      slug: "grood-helmet",
      price: 129,
      originalPrice: null,
      category: "SAFETY" as AccessoryCategory,
      badge: "New",
      rating: 4.9,
      reviewCount: 67,
      image:
        "https://images.unsplash.com/photo-1557803175-2f8c4f0f6d61?w=600&q=80",
    },
    {
      name: "Comfort Saddle",
      slug: "comfort-saddle",
      price: 79,
      originalPrice: null,
      category: "COMFORT" as AccessoryCategory,
      badge: null,
      rating: 4.6,
      reviewCount: 145,
      image:
        "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=600&q=80",
    },
    {
      name: "Phone Mount Pro",
      slug: "phone-mount-pro",
      price: 49,
      originalPrice: null,
      category: "TECH" as AccessoryCategory,
      badge: null,
      rating: 4.8,
      reviewCount: 312,
      image:
        "https://images.unsplash.com/photo-1565633778840-56d8e28e2d0e?w=600&q=80",
    },
    {
      name: "Grood Rain Cover",
      slug: "grood-rain-cover",
      price: 39,
      originalPrice: null,
      category: "COMFORT" as AccessoryCategory,
      badge: null,
      rating: 4.5,
      reviewCount: 78,
      image:
        "https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?w=600&q=80",
    },
    {
      name: "Multi-Tool Kit",
      slug: "multi-tool-kit",
      price: 29,
      originalPrice: null,
      category: "MAINTENANCE" as AccessoryCategory,
      badge: null,
      rating: 4.7,
      reviewCount: 189,
      image:
        "https://images.unsplash.com/photo-1558618047-3c8b73fc3a58?w=600&q=80",
    },
    {
      name: "LED Light Set",
      slug: "led-light-set",
      price: 59,
      originalPrice: 79,
      category: "SAFETY" as AccessoryCategory,
      badge: "Sale",
      rating: 4.8,
      reviewCount: 234,
      image:
        "https://images.unsplash.com/photo-1565632828433-9c94b1e46d45?w=600&q=80",
    },
    {
      name: "Wireless Speaker",
      slug: "wireless-speaker",
      price: 89,
      originalPrice: null,
      category: "TECH" as AccessoryCategory,
      badge: "New",
      rating: 4.6,
      reviewCount: 45,
      image:
        "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&q=80",
    },
    {
      name: "Grood Chain Lock",
      slug: "grood-chain-lock",
      price: 99,
      originalPrice: null,
      category: "SAFETY" as AccessoryCategory,
      badge: null,
      rating: 4.9,
      reviewCount: 167,
      image:
        "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80",
    },
    {
      name: "Handlebar Grips",
      slug: "handlebar-grips",
      price: 35,
      originalPrice: null,
      category: "COMFORT" as AccessoryCategory,
      badge: null,
      rating: 4.4,
      reviewCount: 98,
      image:
        "https://images.unsplash.com/photo-1558618047-f4b511986f01?w=600&q=80",
    },
  ];

  for (const accessory of accessories) {
    await prisma.accessory.upsert({
      where: { slug_organizationId: { slug: accessory.slug, organizationId } },
      update: { ...accessory, status: "PUBLISHED" as AccessoryStatus },
      create: {
        ...accessory,
        status: "PUBLISHED" as AccessoryStatus,
        organizationId,
      },
    });
  }
  console.log(`✅ Seeded ${accessories.length} accessories`);

  // =====================
  // SEED STORES
  // =====================
  console.log("🏪 Seeding Stores...");

  const stores = [
    {
      name: "Grood Phnom Penh Flagship",
      type: "BRAND_STORE" as StoreType,
      address: "123 Norodom Blvd",
      city: "Phnom Penh",
      country: "Cambodia",
      phone: "+855 23 123 456",
      email: "phnompenh@getgrood.com",
      hours: "Mon-Sat: 9:00 AM - 7:00 PM",
      services: ["Test Rides", "Service Center", "Accessories"],
      image:
        "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80",
      lat: 11.5564,
      lng: 104.9282,
      status: "ACTIVE" as StoreStatus,
      featured: true,
    },
    {
      name: "Grood Siem Reap",
      type: "BRAND_STORE" as StoreType,
      address: "456 Pub Street",
      city: "Siem Reap",
      country: "Cambodia",
      phone: "+855 63 123 456",
      email: "siemreap@getgrood.com",
      hours: "Mon-Sun: 8:00 AM - 8:00 PM",
      services: ["Test Rides", "Service Center"],
      image:
        "https://images.unsplash.com/photo-1558618047-3c8b73fc3a58?w=600&q=80",
      lat: 13.3633,
      lng: 103.8564,
      status: "ACTIVE" as StoreStatus,
      featured: false,
    },
    {
      name: "Grood Bangkok Central",
      type: "BRAND_STORE" as StoreType,
      address: "789 Sukhumvit Road, Watthana",
      city: "Bangkok",
      country: "Thailand",
      phone: "+66 2 123 4567",
      email: "bangkok@getgrood.com",
      hours: "Mon-Sat: 10:00 AM - 8:00 PM",
      services: ["Test Rides", "Service Center", "Accessories"],
      image:
        "https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=600&q=80",
      lat: 13.7563,
      lng: 100.5018,
      status: "ACTIVE" as StoreStatus,
      featured: true,
    },
    {
      name: "Grood Singapore",
      type: "BRAND_STORE" as StoreType,
      address: "101 Orchard Road",
      city: "Singapore",
      country: "Singapore",
      phone: "+65 6123 4567",
      email: "singapore@getgrood.com",
      hours: "Mon-Sun: 10:00 AM - 9:00 PM",
      services: ["Test Rides", "Service Center", "Accessories", "Workshop"],
      image:
        "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80",
      lat: 1.3521,
      lng: 103.8198,
      status: "ACTIVE" as StoreStatus,
      featured: true,
    },
    {
      name: "Grood Ho Chi Minh City",
      type: "SERVICE_POINT" as StoreType,
      address: "202 Nguyen Hue, District 1",
      city: "Ho Chi Minh City",
      country: "Vietnam",
      phone: "+84 28 1234 5678",
      email: "hcm@getgrood.com",
      hours: "Mon-Sat: 9:00 AM - 6:00 PM",
      services: ["Service Center", "Accessories"],
      image:
        "https://images.unsplash.com/photo-1558618047-f4b511986f01?w=600&q=80",
      lat: 10.8231,
      lng: 106.6297,
      status: "ACTIVE" as StoreStatus,
      featured: false,
    },
    {
      name: "Grood Kuala Lumpur",
      type: "BRAND_STORE" as StoreType,
      address: "50 Jalan Bukit Bintang",
      city: "Kuala Lumpur",
      country: "Malaysia",
      phone: "+60 3 1234 5678",
      email: "kl@getgrood.com",
      hours: "Mon-Sun: 10:00 AM - 10:00 PM",
      services: ["Test Rides", "Service Center", "Accessories"],
      image:
        "https://images.unsplash.com/photo-1558618047-3c8b73fc3a58?w=600&q=80",
      lat: 3.139,
      lng: 101.6869,
      status: "ACTIVE" as StoreStatus,
      featured: false,
    },
  ];

  // Delete existing stores for this org and recreate
  await prisma.store.deleteMany({ where: { organizationId } });
  await prisma.store.createMany({
    data: stores.map((store) => ({ ...store, organizationId })),
  });
  console.log(`✅ Seeded ${stores.length} stores`);

  // =====================
  // SEED TESTIMONIALS
  // =====================
  console.log("💬 Seeding Testimonials...");

  const testimonials = [
    {
      quote: "The Tesla of e-bikes",
      source: "Tech Review Asia",
      type: "PRESS" as TestimonialType,
      featured: true,
      order: 1,
    },
    {
      quote: "Somehow even sleeker",
      source: "Urban Mobility Magazine",
      type: "PRESS" as TestimonialType,
      featured: true,
      order: 2,
    },
    {
      quote: "A game-changer for city commuting",
      source: "Design Weekly",
      type: "PRESS" as TestimonialType,
      featured: true,
      order: 3,
    },
    {
      quote:
        "Best investment I've made for my daily commute. The anti-theft features give me peace of mind.",
      source: "Customer Review",
      author: "Sarah L.",
      rating: 5,
      type: "CUSTOMER" as TestimonialType,
      featured: false,
      order: 4,
    },
    {
      quote:
        "The app integration is seamless. I love tracking my rides and seeing the stats.",
      source: "Customer Review",
      author: "Mark T.",
      rating: 5,
      type: "CUSTOMER" as TestimonialType,
      featured: false,
      order: 5,
    },
  ];

  await prisma.groodTestimonial.deleteMany({ where: { organizationId } });
  await prisma.groodTestimonial.createMany({
    data: testimonials.map((t) => ({ ...t, organizationId })),
  });
  console.log(`✅ Seeded ${testimonials.length} testimonials`);

  // =====================
  // SEED FAQS
  // =====================
  console.log("❓ Seeding FAQs...");

  const faqs = [
    // General
    {
      question: "What makes Grood e-bikes different?",
      answer:
        "Grood e-bikes combine premium design, smart technology, and silent power. Our bikes feature integrated GPS, anti-theft technology, and seamless app connectivity - all wrapped in an iconic minimalist design.",
      category: "GENERAL" as FAQCategory,
      order: 1,
    },
    {
      question: "How fast can a Grood e-bike go?",
      answer:
        "Grood e-bikes have a top assisted speed of 25 km/h (15.5 mph), which is the legal limit in most countries for e-bikes. The Turbo Boost feature helps you reach this speed instantly.",
      category: "GENERAL" as FAQCategory,
      order: 2,
    },
    {
      question: "What is the range on a single charge?",
      answer:
        "Depending on the model, Grood e-bikes can travel between 120-150 km on a single charge. Actual range varies based on terrain, rider weight, and assist level.",
      category: "GENERAL" as FAQCategory,
      order: 3,
    },

    // Shipping
    {
      question: "Do you ship internationally?",
      answer:
        "Yes! We ship to most countries in Asia and are expanding globally. Shipping is free on all e-bike orders. Check our shipping page for delivery times to your location.",
      category: "SHIPPING" as FAQCategory,
      order: 1,
    },
    {
      question: "How is the bike shipped?",
      answer:
        "Your Grood arrives in a special bike box, partially assembled. Assembly is simple and typically takes 15-20 minutes. We include all necessary tools and detailed instructions.",
      category: "SHIPPING" as FAQCategory,
      order: 2,
    },

    // Warranty
    {
      question: "What warranty do you offer?",
      answer:
        "All Grood e-bikes come with a 2-year warranty covering the frame, motor, and electronics. Wear parts like tires and brake pads are covered for 6 months.",
      category: "WARRANTY" as FAQCategory,
      order: 1,
    },
    {
      question: "What does the warranty cover?",
      answer:
        "The warranty covers manufacturing defects in materials and workmanship. This includes the frame, motor, battery, and electronic components. Normal wear and tear, accidents, and unauthorized modifications are not covered.",
      category: "WARRANTY" as FAQCategory,
      order: 2,
    },

    // Technical
    {
      question: "How do I charge my Grood?",
      answer:
        "Simply plug the charger into a standard outlet and connect it to your bike. A full charge takes about 3.5-4 hours depending on the model. The battery is integrated and can be charged on or off the bike.",
      category: "TECHNICAL" as FAQCategory,
      order: 1,
    },
    {
      question: "Can I ride in the rain?",
      answer:
        "Yes! Grood e-bikes are built to handle wet weather. All electronics are sealed and water-resistant (IPX4 rated). Just avoid submerging the bike in water.",
      category: "TECHNICAL" as FAQCategory,
      order: 2,
    },
    {
      question: "How do I connect the Grood app?",
      answer:
        "Download the Grood app from the App Store or Google Play. Create an account, then use Bluetooth to pair with your bike. The app will guide you through the setup process.",
      category: "TECHNICAL" as FAQCategory,
      order: 3,
    },

    // Payment
    {
      question: "What payment methods do you accept?",
      answer:
        "We accept all major credit cards (Visa, Mastercard, American Express), PayPal, and bank transfers. We also offer financing options in select markets.",
      category: "PAYMENT" as FAQCategory,
      order: 1,
    },
    {
      question: "Do you offer financing?",
      answer:
        "Yes, we partner with Affirm and Klarna to offer flexible payment plans. Split your purchase into 6, 12, or 24 monthly payments. Available in select countries.",
      category: "PAYMENT" as FAQCategory,
      order: 2,
    },

    // Returns
    {
      question: "What is your return policy?",
      answer:
        "You have 30 days to return your Grood for a full refund. The bike must be in original condition with all accessories. We cover return shipping costs.",
      category: "RETURNS" as FAQCategory,
      order: 1,
    },
    {
      question: "Can I exchange my bike for a different model?",
      answer:
        "Yes! Within 30 days of purchase, you can exchange your Grood for a different model. Any price difference will be refunded or charged accordingly.",
      category: "RETURNS" as FAQCategory,
      order: 2,
    },
  ];

  await prisma.fAQ.deleteMany({ where: { organizationId } });
  await prisma.fAQ.createMany({
    data: faqs.map((faq) => ({ ...faq, organizationId, published: true })),
  });
  console.log(`✅ Seeded ${faqs.length} FAQs`);

  // =====================
  // SEED PAGE TEMPLATES
  // =====================
  console.log("📄 Seeding Page Templates...");

  const templates = [
    {
      name: "Homepage",
      slug: "homepage",
      description: "Full homepage with hero, bike showcase, features, and more",
      blocks: [
        {
          type: "hero",
          config: {
            title: "Ride the Future",
            subtitle: "Premium electric bikes designed for the modern city",
          },
        },
        { type: "ebike-showcase", config: { layout: "full" } },
        { type: "features", config: { columns: 3 } },
        { type: "press-quotes", config: { featured: true } },
        { type: "cta", config: { title: "Ready to ride?" } },
      ],
    },
    {
      name: "Product Listing",
      slug: "product-listing",
      description: "Grid layout for products with filters",
      blocks: [
        { type: "hero", config: { size: "small" } },
        { type: "product-grid", config: { columns: 3 } },
        { type: "newsletter", config: {} },
      ],
    },
    {
      name: "Product Detail",
      slug: "product-detail",
      description: "Detailed product page with gallery and specs",
      blocks: [
        { type: "product-hero", config: {} },
        { type: "product-specs", config: {} },
        { type: "product-features", config: {} },
        { type: "related-products", config: { count: 4 } },
      ],
    },
    {
      name: "Landing Page",
      slug: "landing-page",
      description: "Flexible landing page for campaigns",
      blocks: [
        { type: "hero", config: {} },
        { type: "content", config: {} },
        { type: "cta", config: {} },
      ],
    },
    {
      name: "Contact Page",
      slug: "contact-page",
      description: "Contact form with store locator",
      blocks: [
        { type: "hero", config: { size: "small" } },
        { type: "contact-form", config: {} },
        { type: "store-locator", config: {} },
      ],
    },
    {
      name: "Store Locator",
      slug: "store-locator",
      description: "Find store page with map and filters",
      blocks: [
        { type: "hero", config: { size: "small", title: "Find a Store" } },
        { type: "store-map", config: {} },
        { type: "store-list", config: {} },
      ],
    },
    {
      name: "FAQ Page",
      slug: "faq-page",
      description: "FAQ page with categories",
      blocks: [
        {
          type: "hero",
          config: { size: "small", title: "Frequently Asked Questions" },
        },
        { type: "faq-section", config: { showCategories: true } },
        { type: "contact-cta", config: {} },
      ],
    },
  ];

  for (const template of templates) {
    await prisma.pageTemplate.upsert({
      where: { slug: template.slug },
      update: template,
      create: template,
    });
  }
  console.log(`✅ Seeded ${templates.length} page templates`);

  // =====================
  // SEED SITE SETTINGS
  // =====================
  console.log("⚙️ Seeding Site Settings...");

  const settings = [
    {
      key: "site_name",
      value: { name: "Grood" },
    },
    {
      key: "site_tagline",
      value: { tagline: "Ride the Future" },
    },
    {
      key: "brand_colors",
      value: {
        primary: "#fdc501",
        secondary: "#303030",
        accent: "#fdc501",
      },
    },
    {
      key: "contact_info",
      value: {
        email: "hello@getgrood.com",
        phone: "+855 23 123 456",
        address: "123 Norodom Blvd, Phnom Penh, Cambodia",
      },
    },
    {
      key: "social_links",
      value: {
        facebook: "https://facebook.com/getgrood",
        instagram: "https://instagram.com/getgrood",
        twitter: "https://twitter.com/getgrood",
        youtube: "https://youtube.com/getgrood",
      },
    },
    {
      key: "seo_defaults",
      value: {
        title: "Grood | Premium Electric Bikes",
        description:
          "Premium electric bikes designed for the modern city. Silent power, smart features, iconic design.",
        keywords: "e-bike, electric bike, grood, city bike, commuter bike",
        ogImage:
          "https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=1200&q=80",
      },
    },
    {
      key: "footer_content",
      value: {
        copyright: "© 2024 Grood. All rights reserved.",
        newsletter: {
          title: "Stay updated",
          description: "Get the latest news and offers from Grood.",
        },
      },
    },
  ];

  for (const setting of settings) {
    await prisma.setting.upsert({
      where: { key_organizationId: { key: setting.key, organizationId } },
      update: { value: setting.value },
      create: { ...setting, organizationId },
    });
  }
  console.log(`✅ Seeded ${settings.length} site settings`);

  console.log("\n🎉 Grood CMS seed completed successfully!\n");
  console.log("Summary:");
  console.log(`  - ${ebikes.length} E-Bikes`);
  console.log(`  - ${accessories.length} Accessories`);
  console.log(`  - ${stores.length} Stores`);
  console.log(`  - ${testimonials.length} Testimonials`);
  console.log(`  - ${faqs.length} FAQs`);
  console.log(`  - ${templates.length} Page Templates`);
  console.log(`  - ${settings.length} Site Settings`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
