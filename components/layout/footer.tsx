"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Mail } from "lucide-react";

interface LinkItem {
  text: string;
  path: string;
}

interface LinkSection {
  title: string;
  links: LinkItem[];
}

const linkSections: LinkSection[] = [
  {
    title: "COMPANY",
    links: [
      { text: "About", path: "/products" },
      { text: "Features", path: "/products" },
      { text: "Works", path: "/products" },
      { text: "Career", path: "/products" },
    ]
  },
  {
    title: "HELP",
    links: [
      { text: "Customer Support", path: "/products" },
      { text: "Delivery Details", path: "/products" },
      { text: "Terms & Conditions", path: "/products" },
      { text: "Privacy Policy", path: "/products" },
    ]
  },
  {
    title: "FAQ",
    links: [
      { text: "Account", path: "/products" },
      { text: "Manage Deliveries", path: "/products" },
      { text: "Orders", path: "/products" },
      { text: "Payments", path: "/products" },
    ]
  },
  {
    title: "RESOURCES",
    links: [
      { text: "Free eBooks", path: "/products" },
      { text: "Development Tutorial", path: "/products" },
      { text: "How to - Blog", path: "/products" },
      { text: "Youtube Playlist", path: "/products" },
    ]
  }
];

// Custom inline SVGs for social media links to avoid version mismatch in lucide-react
const TwitterIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);

const FacebookIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const InstagramIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const GithubIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </svg>
);

export function Footer() {
  const pathname = usePathname();
  const isDashboard = pathname.startsWith("/admin") || pathname.startsWith("/vendor");
  if (isDashboard) return null;

  return (
    <footer className="relative mt-32 bg-[#F0F0F0]">
      {/* Overlapping Newsletter Subscription Box */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative -translate-y-1/2 z-10 -mb-24">
        <div className="bg-black rounded-3xl px-6 py-9 sm:px-16 sm:py-11 flex flex-col lg:flex-row items-center justify-between gap-6 sm:gap-10">
          <h2 className="text-white text-3xl sm:text-4xl font-black tracking-tight leading-none max-w-xl text-left">
            STAY UP TO DATE ABOUT OUR LATEST OFFERS
          </h2>
          <div className="flex flex-col gap-3 w-full max-w-md sm:max-w-xs shrink-0">
            <div className="relative w-full">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 size-5" />
              <input
                type="email"
                placeholder="Enter your email address"
                className="w-full bg-white text-black pl-12 pr-4 py-3 rounded-full text-sm outline-none border-none placeholder-gray-400 focus:ring-1 focus:ring-black"
              />
            </div>
            <button
              type="button"
              className="w-full bg-white hover:bg-gray-100 text-black font-semibold py-3 px-6 rounded-full text-sm transition-all"
            >
              Subscribe to Newsletter
            </button>
          </div>
        </div>
      </div>

      {/* Main Footer Links Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
        <div className="grid grid-cols-2 md:grid-cols-12 gap-8 md:gap-12 pb-12 border-b border-gray-200">
          {/* Column 1: Brand details */}
          <div className="col-span-2 md:col-span-4 flex flex-col gap-6">
            <Link href="/" className="text-3xl font-black text-black tracking-tight font-sans">
              SHOP.CO
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed max-w-sm">
              We have clothes that suits your style and which you're proud to wear. From women to men.
            </p>
            {/* Social Icons */}
            <div className="flex items-center gap-3">
              <a href="#" className="flex items-center justify-center w-8 h-8 rounded-full border border-gray-300 bg-white hover:bg-black hover:text-white transition text-black" aria-label="Twitter">
                <TwitterIcon />
              </a>
              <a href="#" className="flex items-center justify-center w-8 h-8 rounded-full border border-gray-300 bg-white hover:bg-black hover:text-white transition text-black" aria-label="Facebook">
                <FacebookIcon />
              </a>
              <a href="#" className="flex items-center justify-center w-8 h-8 rounded-full border border-gray-300 bg-white hover:bg-black hover:text-white transition text-black" aria-label="Instagram">
                <InstagramIcon />
              </a>
              <a href="#" className="flex items-center justify-center w-8 h-8 rounded-full border border-gray-300 bg-white hover:bg-black hover:text-white transition text-black" aria-label="Github">
                <GithubIcon />
              </a>
            </div>
          </div>

          {/* Columns 2-5: Link sections */}
          <div className="col-span-2 md:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-8">
            {linkSections.map((section, index) => (
              <div key={index} className="flex flex-col gap-4">
                <h3 className="text-sm font-semibold tracking-widest text-black uppercase">
                  {section.title}
                </h3>
                <ul className="flex flex-col gap-3">
                  {section.links.map((link, i) => (
                    <li key={i}>
                      <Link href={link.path} className="text-gray-500 hover:text-black text-sm transition">
                        {link.text}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Credits & Payment Badges */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8">
          <p className="text-gray-400 text-xs sm:text-sm text-center sm:text-left">
            Shop.co © 2000-2023, All Rights Reserved
          </p>
          
          {/* Card Payment Logos */}
          <div className="flex items-center gap-3">
            {/* Visa */}
            <div className="bg-white px-2.5 py-1.5 rounded-md border border-gray-200 shadow-sm flex items-center justify-center h-8 w-12">
              <span className="text-blue-800 font-extrabold italic text-sm tracking-tighter">VISA</span>
            </div>
            {/* Mastercard */}
            <div className="bg-white px-2.5 py-1.5 rounded-md border border-gray-200 shadow-sm flex items-center justify-center h-8 w-12 gap-0.5">
              <span className="w-3 h-3 rounded-full bg-red-500 opacity-90 block"></span>
              <span className="w-3 h-3 rounded-full bg-yellow-500 opacity-90 block -ml-2"></span>
            </div>
            {/* Paypal */}
            <div className="bg-white px-2.5 py-1.5 rounded-md border border-gray-200 shadow-sm flex items-center justify-center h-8 w-12">
              <span className="text-blue-900 font-black italic text-[11px] tracking-tight">Pay<span className="text-blue-500">Pal</span></span>
            </div>
            {/* Apple Pay */}
            <div className="bg-white px-2.5 py-1.5 rounded-md border border-gray-200 shadow-sm flex items-center justify-center h-8 w-12">
              <span className="text-black font-semibold text-xs tracking-tight">Pay</span>
            </div>
            {/* Google Pay */}
            <div className="bg-white px-2.5 py-1.5 rounded-md border border-gray-200 shadow-sm flex items-center justify-center h-8 w-12">
              <span className="text-gray-700 font-bold text-xs tracking-tight">G Pay</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
