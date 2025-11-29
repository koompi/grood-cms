"use client";

import Link from "next/link";
import { useState } from "react";
import { Instagram, Youtube, Facebook, ChevronDown } from "lucide-react";

const footerSections = [
  {
    title: "E-Bikes",
    links: [
      { label: "Grood S1", href: "/our-rides/grood-s1" },
      { label: "Grood C1", href: "/our-rides/grood-c1" },
      { label: "Grood X1", href: "/our-rides/grood-x1" },
      { label: "Compare models", href: "/our-rides" },
    ],
  },
  {
    title: "Shop",
    links: [
      { label: "Accessories", href: "/accessories" },
      { label: "Apparel", href: "/accessories?category=apparel" },
      { label: "Parts", href: "/accessories?category=parts" },
      { label: "Gift Cards", href: "/gift-cards" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Help Center", href: "/contact" },
      { label: "Find a Store", href: "/find-store" },
      { label: "Book a Test Ride", href: "/test-rides" },
      { label: "Contact Us", href: "/contact" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Our Story", href: "/our-story" },
      { label: "Careers", href: "/careers" },
      { label: "Press", href: "/press" },
      { label: "Blog", href: "/blog" },
    ],
  },
];

export function GroodFooter() {
  const [email, setEmail] = useState("");
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle newsletter subscription
    console.log("Subscribe:", email);
    setEmail("");
  };

  return (
    <footer className="bg-black text-white">
      {/* Community Section */}
      <div className="border-b border-white/10">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left - Community */}
            <div>
              <p className="text-sm font-medium text-[#fdc501] uppercase tracking-wider mb-3">
                Our Community
              </p>
              <h2 className="text-4xl md:text-5xl font-bold mb-4">#GROOD</h2>
              <p className="text-white/60 mb-6 max-w-md">
                Join thousands of riders sharing their journeys. Tag us in your adventures.
              </p>
              <a
                href="https://instagram.com/grood"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-white hover:text-[#fdc501] transition-colors"
              >
                <Instagram className="w-5 h-5" />
                <span className="font-medium">Follow on Instagram</span>
              </a>
            </div>

            {/* Right - Newsletter */}
            <div className="lg:pl-12 lg:border-l border-white/10">
              <p className="text-sm font-medium text-white/60 uppercase tracking-wider mb-3">
                Newsletter
              </p>
              <h3 className="text-xl font-medium mb-4">
                Be the first to know about product launches and all things Grood.
              </h3>
              <form onSubmit={handleSubscribe} className="flex gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-full text-white placeholder:text-white/40 focus:outline-none focus:border-[#fdc501] transition-colors"
                  required
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-[#fdc501] text-black font-medium rounded-full hover:bg-[#e5b100] transition-colors"
                >
                  Sign up
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Desktop Grid */}
        <div className="hidden md:grid md:grid-cols-4 gap-8 mb-12">
          {footerSections.map((section) => (
            <div key={section.title}>
              <h4 className="text-sm font-medium text-white/60 uppercase tracking-wider mb-4">
                {section.title}
              </h4>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-white/80 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Mobile Accordion */}
        <div className="md:hidden space-y-0 mb-8">
          {footerSections.map((section) => (
            <div key={section.title} className="border-b border-white/10">
              <button
                onClick={() =>
                  setExpandedSection(
                    expandedSection === section.title ? null : section.title
                  )
                }
                className="flex items-center justify-between w-full py-4 text-left"
              >
                <span className="text-sm font-medium text-white/60 uppercase tracking-wider">
                  {section.title}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-white/40 transition-transform ${
                    expandedSection === section.title ? "rotate-180" : ""
                  }`}
                />
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  expandedSection === section.title ? "max-h-48 pb-4" : "max-h-0"
                }`}
              >
                <ul className="space-y-3">
                  {section.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-white/80 hover:text-white transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-8 border-t border-white/10">
          {/* Social Links */}
          <div className="flex items-center gap-4">
            <a
              href="https://instagram.com/grood"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-white/60 hover:text-white transition-colors"
              aria-label="Instagram"
            >
              <Instagram className="w-5 h-5" />
            </a>
            <a
              href="https://youtube.com/grood"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-white/60 hover:text-white transition-colors"
              aria-label="YouTube"
            >
              <Youtube className="w-5 h-5" />
            </a>
            <a
              href="https://facebook.com/grood"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-white/60 hover:text-white transition-colors"
              aria-label="Facebook"
            >
              <Facebook className="w-5 h-5" />
            </a>
          </div>

          {/* Legal Links */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-white/40">
            <Link href="/privacy-policy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms-and-conditions" className="hover:text-white transition-colors">
              Terms & Conditions
            </Link>
            <Link href="/cookie-statement" className="hover:text-white transition-colors">
              Cookie Statement
            </Link>
          </div>

          {/* Copyright */}
          <p className="text-sm text-white/40">
            © {new Date().getFullYear()} Grood. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
