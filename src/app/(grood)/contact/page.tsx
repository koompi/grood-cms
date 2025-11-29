"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  MessageCircle,
  Phone,
  Mail,
  MapPin,
  Clock,
  ChevronDown,
  ChevronRight,
  Send,
  HelpCircle,
  Wrench,
  ShoppingBag,
  Users,
} from "lucide-react";

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
}

const contactOptions = [
  {
    icon: MessageCircle,
    title: "Live Chat",
    description: "Chat with our support team",
    availability: "Available 9 AM - 6 PM",
    action: "Start Chat",
    href: "#",
  },
  {
    icon: Phone,
    title: "Call Us",
    description: "+855 23 123 456",
    availability: "Mon-Sat, 9 AM - 7 PM",
    action: "Call Now",
    href: "tel:+85523123456",
  },
  {
    icon: Mail,
    title: "Email",
    description: "support@getgrood.com",
    availability: "Response within 24 hours",
    action: "Send Email",
    href: "mailto:support@getgrood.com",
  },
];

const topics = [
  {
    icon: ShoppingBag,
    title: "Sales & Orders",
    description: "Questions about purchasing, pricing, or order status",
  },
  {
    icon: Wrench,
    title: "Service & Repairs",
    description: "Technical support, maintenance, or repair inquiries",
  },
  {
    icon: HelpCircle,
    title: "Product Support",
    description: "Help with your Grood bike or app",
  },
  {
    icon: Users,
    title: "Business Inquiries",
    description: "Partnerships, press, or corporate opportunities",
  },
];

export default function ContactPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loadingFaqs, setLoadingFaqs] = useState(true);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    async function fetchFAQs() {
      try {
        const res = await fetch("/api/faqs?category=GENERAL");
        const data = await res.json();
        setFaqs(data);
      } catch (error) {
        console.error("Failed to fetch FAQs:", error);
      } finally {
        setLoadingFaqs(false);
      }
    }
    fetchFAQs();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    setSubmitted(true);
  };

  return (
    <main>
      {/* Hero */}
      <section className="bg-black pt-28 pb-12 md:pt-32 md:pb-16" data-header-theme="dark">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6">
            How can we help?
          </h1>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            We&apos;re here to answer your questions and help you get the most out of your Grood experience.
          </p>
        </div>
      </section>

      {/* Contact Options */}
      <section className="bg-white py-16" data-header-theme="light">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-6">
            {contactOptions.map((option) => (
              <a
                key={option.title}
                href={option.href}
                className="group p-8 bg-gray-50 rounded-2xl hover:bg-[#fdc501] transition-colors"
              >
                <option.icon className="w-10 h-10 text-[#fdc501] group-hover:text-black mb-4 transition-colors" />
                <h3 className="text-xl font-bold text-black mb-2">{option.title}</h3>
                <p className="text-gray-600 group-hover:text-black/70 mb-1 transition-colors">
                  {option.description}
                </p>
                <p className="text-sm text-gray-400 group-hover:text-black/50 mb-4 transition-colors">
                  {option.availability}
                </p>
                <span className="inline-flex items-center text-black font-medium">
                  {option.action}
                  <ChevronRight className="w-4 h-4 ml-1" />
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="bg-gray-50 py-16 md:py-24" data-header-theme="light">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">
              Send us a message
            </h2>
            <p className="text-gray-600">
              Fill out the form below and we&apos;ll get back to you as soon as possible.
            </p>
          </div>

          {submitted ? (
            <div className="bg-white rounded-2xl p-12 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Send className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-black mb-4">
                Message sent!
              </h3>
              <p className="text-gray-600 mb-8">
                Thank you for reaching out. We&apos;ll get back to you within 24 hours.
              </p>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setFormData({ name: "", email: "", subject: "", message: "" });
                  setSelectedTopic(null);
                }}
                className="px-8 py-4 bg-black text-white font-medium rounded-full hover:bg-gray-800 transition-colors"
              >
                Send another message
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-8 md:p-12">
              {/* Topic Selection */}
              <div className="mb-8">
                <h3 className="text-lg font-bold text-black mb-4">
                  What can we help you with?
                </h3>
                <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
                  {topics.map((topic) => (
                    <button
                      key={topic.title}
                      onClick={() => setSelectedTopic(topic.title)}
                      className={`p-4 sm:p-5 rounded-xl text-left transition-all min-h-[80px] ${
                        selectedTopic === topic.title
                          ? "bg-[#fdc501] text-black"
                          : "bg-gray-50 hover:bg-gray-100"
                      }`}
                    >
                      <topic.icon
                        className={`w-6 h-6 mb-2 ${
                          selectedTopic === topic.title
                            ? "text-black"
                            : "text-[#fdc501]"
                        }`}
                      />
                      <h4 className="font-medium">{topic.title}</h4>
                      <p
                        className={`text-sm ${
                          selectedTopic === topic.title
                            ? "text-black/70"
                            : "text-gray-500"
                        }`}
                      >
                        {topic.description}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-gray-50 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-[#fdc501]"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-gray-50 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-[#fdc501]"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) =>
                      setFormData({ ...formData, subject: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-gray-50 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-[#fdc501]"
                    placeholder="How can we help?"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Message
                  </label>
                  <textarea
                    required
                    rows={6}
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-gray-50 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-[#fdc501] resize-none"
                    placeholder="Tell us more about your inquiry..."
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-4 bg-black text-white font-medium rounded-full hover:bg-gray-800 transition-colors"
                >
                  Send Message
                </button>
              </form>
            </div>
          )}
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-white py-16 md:py-24" data-header-theme="light">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">
              Frequently asked questions
            </h2>
            <p className="text-gray-600">
              Find quick answers to common questions below.
            </p>
          </div>

          {loadingFaqs ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Loading FAQs...</p>
            </div>
          ) : faqs.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No FAQs available at the moment.</p>
            </div>
          ) : (
          <div className="space-y-4">
            {faqs.map((faq) => (
              <details
                key={faq.id}
                className="group bg-gray-50 rounded-xl overflow-hidden"
              >
                <summary className="flex items-center justify-between p-4 sm:p-6 cursor-pointer list-none">
                  <span className="font-medium text-black pr-4 text-sm sm:text-base">{faq.question}</span>
                  <ChevronDown className="w-5 h-5 text-gray-400 transition-transform group-open:rotate-180 flex-shrink-0 ml-2" />
                </summary>
                <div className="px-6 pb-6 text-gray-600">{faq.answer}</div>
              </details>
            ))}
          </div>
          )}

          <div className="text-center mt-12">
            <p className="text-gray-600 mb-4">Still have questions?</p>
            <Link
              href="/find-store"
              className="inline-flex items-center px-8 py-4 bg-[#fdc501] text-black font-medium rounded-full hover:bg-[#fdc501]/90 transition-colors"
            >
              Visit a Store
              <ChevronRight className="w-5 h-5 ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* Office Location */}
      <section className="bg-black py-16" data-header-theme="dark">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-white mb-6">
                Visit our headquarters
              </h2>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <MapPin className="w-6 h-6 text-[#fdc501] flex-shrink-0" />
                  <div>
                    <p className="text-white font-medium">Grood HQ</p>
                    <p className="text-white/60">
                      123 Norodom Boulevard<br />
                      Phnom Penh, Cambodia
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Clock className="w-6 h-6 text-[#fdc501] flex-shrink-0" />
                  <div>
                    <p className="text-white font-medium">Office Hours</p>
                    <p className="text-white/60">
                      Monday - Friday<br />
                      9:00 AM - 6:00 PM
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-gray-800">
              <div className="absolute inset-0 flex items-center justify-center">
                <MapPin className="w-12 h-12 text-[#fdc501]" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
