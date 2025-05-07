
export interface SubCategory {
  name: string;
  id: string;
}

export interface ServiceCategory {
  id: number;
  title: string;
  icon: string;
  description: string;
  subcategories: SubCategory[];
}

export const services: ServiceCategory[] = [
  {
    id: 1,
    title: "Graphics & Design",
    icon: "pen",
    description: "Professional graphic design services for all your business needs",
    subcategories: [
      { name: "UI/UX Designers", id: "ui-ux-designers" },
      { name: "Logo & Brand Identity Designers", id: "logo-brand-identity" },
      { name: "Social Media Design Kits", id: "social-media-design" },
      { name: "Mockup & Product Presentation Designers", id: "mockup-designers" },
      { name: "Animation / Motion Graphics", id: "animation-motion" },
      { name: "Pitch Deck Designers", id: "pitch-deck" },
      { name: "Flyer & Poster Designers", id: "flyer-poster" },
      { name: "Infographic Designers", id: "infographic" },
      { name: "Packaging Designers", id: "packaging" }
    ]
  },
  {
    id: 2,
    title: "Web & App Development",
    icon: "code",
    description: "Custom web and mobile app development solutions for businesses",
    subcategories: [
      { name: "Website Development", id: "website-dev" },
      { name: "Corporate Website", id: "corporate-website" },
      { name: "Landing Pages", id: "landing-pages" },
      { name: "E-commerce Stores", id: "ecommerce" },
      { name: "NGO/Church/SaaS Sites", id: "specialized-sites" },
      { name: "App Development", id: "app-dev" },
      { name: "Android/iOS Native Apps", id: "native-apps" },
      { name: "Cross-platform (Flutter, React Native)", id: "cross-platform" },
      { name: "Web Apps (PWA/SPA)", id: "web-apps" },
      { name: "API Integrations", id: "api" },
      { name: "Website Redesign / Optimization", id: "redesign" },
      { name: "Bug Fixing / Technical Support", id: "tech-support" }
    ]
  },
  {
    id: 3,
    title: "CAC & Business Registration",
    icon: "file",
    description: "Comprehensive business registration and documentation services",
    subcategories: [
      { name: "CAC Registration (BN, LTD, NGO)", id: "cac-reg" },
      { name: "TIN & VAT Registration", id: "tin-vat" },
      { name: "SCUML Certificate", id: "scuml" },
      { name: "Dealer's License Acquisition", id: "dealers-license" },
      { name: "Auto Dealers", id: "auto-dealers" },
      { name: "Telecom & Gadget Importers", id: "telecom-importers" },
      { name: "Import & Export Business Setup", id: "import-export" },
      { name: "Business Profile & Proposal Writing", id: "business-profile" },
      { name: "NAFDAC & SON Documentation", id: "nafdac-son" }
    ]
  },
  {
    id: 4,
    title: "Marketing & Advertising",
    icon: "chart-bar",
    description: "Strategic marketing and advertising solutions to grow your business",
    subcategories: [
      { name: "Digital Campaign Strategy", id: "digital-campaign" },
      { name: "Google Ads Management", id: "google-ads" },
      { name: "Facebook & Instagram Ad Setup", id: "social-ads" },
      { name: "Sales Funnel Creation", id: "sales-funnel" },
      { name: "Content Marketing", id: "content-marketing" },
      { name: "SEO Optimization", id: "seo" },
      { name: "Email Marketing", id: "email-marketing" },
      { name: "Influencer Marketing", id: "influencer" },
      { name: "Ad Copywriting & Banner Design", id: "ad-copywriting" }
    ]
  },
  {
    id: 5,
    title: "Social Media Management",
    icon: "instagram",
    description: "Comprehensive social media management and growth strategies",
    subcategories: [
      { name: "Full Account Management", id: "account-management" },
      { name: "Content Creation + Calendar", id: "content-creation" },
      { name: "Community Engagement & Comment Moderation", id: "community" },
      { name: "Growth Strategy / Analytics", id: "growth-strategy" },
      { name: "Social Media Audit", id: "social-audit" },
      { name: "Personal Branding for CEOs/Entrepreneurs", id: "personal-branding" },
      { name: "Paid Ads Monitoring", id: "ads-monitoring" },
      { name: "Hashtag Strategy & Trends Research", id: "hashtag-strategy" }
    ]
  },
  {
    id: 6,
    title: "Travel & Bookings",
    icon: "plane",
    description: "Complete travel management and booking services",
    subcategories: [
      { name: "Flight Booking (Local & International)", id: "flight-booking" },
      { name: "Hotel Reservations", id: "hotel" },
      { name: "Airport Pickup & Logistics", id: "airport-pickup" },
      { name: "Visa Advisory", id: "visa" },
      { name: "NYSC & Student Lodge Bookings", id: "student-bookings" }
    ]
  },
  {
    id: 7,
    title: "Video & Multimedia",
    icon: "video",
    description: "Professional video and multimedia production services",
    subcategories: [
      { name: "Video Editing (Promo, Vlog, Reels)", id: "video-editing" },
      { name: "Cinematic Short Ads", id: "cinematic-ads" },
      { name: "Voiceovers (English & Local Languages)", id: "voiceovers" },
      { name: "Motion Graphics & Titles", id: "motion-graphics" },
      { name: "Drone Coverage (Events, Real Estate)", id: "drone" },
      { name: "Podcast Editing", id: "podcast" }
    ]
  },
  {
    id: 8,
    title: "Writing & Content Services",
    icon: "pen",
    description: "Professional writing and content creation services",
    subcategories: [
      { name: "Business Proposal Writing", id: "proposal-writing" },
      { name: "Copywriting & Sales Pages", id: "copywriting" },
      { name: "LinkedIn Optimization", id: "linkedin" },
      { name: "CV & Cover Letter Design", id: "cv-design" },
      { name: "Blog Writing", id: "blog" },
      { name: "Ghostwriting (Books, Biographies)", id: "ghostwriting" },
      { name: "Academic & Technical Writing", id: "academic-writing" }
    ]
  },
  {
    id: 9,
    title: "Branding & Business Strategy",
    icon: "briefcase",
    description: "Strategic branding and business development services",
    subcategories: [
      { name: "Business Naming", id: "business-naming" },
      { name: "Brand Positioning", id: "brand-positioning" },
      { name: "Customer Journey Mapping", id: "customer-journey" },
      { name: "Competitor Research", id: "competitor-research" },
      { name: "Brand Style Guide Creation", id: "style-guide" }
    ]
  },
  {
    id: 10,
    title: "Tech Support & Maintenance",
    icon: "wrench",
    description: "Reliable technical support and maintenance services",
    subcategories: [
      { name: "Website Maintenance Plans", id: "website-maintenance" },
      { name: "App Bug Fixing", id: "bug-fixing" },
      { name: "Server Migration & Hosting Setup", id: "server-migration" },
      { name: "Domain Registration & SSL", id: "domain-ssl" },
      { name: "WordPress Management", id: "wordpress" },
      { name: "Hosting Reseller Services", id: "hosting-reseller" }
    ]
  }
];
