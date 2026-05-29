import { Niche } from "./types";

export const RECOMMENDED_NICHES: Niche[] = [
  {
    id: "real-estate",
    name: "Real Estate Brokerage",
    description: "Automate property lead capture, design highly personalized valuation summaries, and coordinate buyer visitation agreements.",
    icon: "Home",
    suggestedProducts: ["Single Family Homes", "Luxury Condos", "Commercial Properties", "Rental Airbnbs"]
  },
  {
    id: "ecommerce",
    name: "E-Commerce Apparel Brand",
    description: "Synthesize high-converting catalog product listings, compose automated ticket replies, and orchestrate targeted promotion campaigns.",
    icon: "ShoppingBag",
    suggestedProducts: ["Sustainable Streetwear", "Premium Activewear", "Meticulous Watches", "Organic Skincare"]
  },
  {
    id: "saas-dev",
    name: "Indie SaaS Startup",
    description: "Synthesize clean technical system specs, scaffold modular TypeScript files, design optimized unit tests, and review performance commits.",
    icon: "Cpu",
    suggestedProducts: ["AI Notion Plugin", "Analytics Dashboard", "Visual Video Clipper", "Automated Billing API"]
  },
  {
    id: "marketing-agency",
    name: "Social Media Agency",
    description: "Spot emerging viral hooks across networks, draft engaging platform-tailored scripts, and synthesize high-relevance SEO meta tags.",
    icon: "Megaphone",
    suggestedProducts: ["B2B LinkedIn Hubs", "TikTok Micro-Trends", "Insta Brand Identity", "YouTube Content Engines"]
  },
  {
    id: "coaching-education",
    name: "Elite Coding Bootcamp",
    description: "Explain difficult coding concepts simply, design student worksheets, compile coding mock exams, and review sandbox files.",
    icon: "GraduationCap",
    suggestedProducts: ["React / Vite Workshops", "Rust Systems Mastery", "AI Fine-Tuning Labs", "SQL Performance Audits"]
  }
];
