"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  MapPin,
  Clock,
  Phone,
  Mail,
  Navigation,
  ChevronRight,
  Search,
  Filter,
} from "lucide-react";
import { usePageContext } from "@/components/admin";

interface Store {
  id: string;
  name: string;
  type: string;
  address: string;
  city: string;
  country: string;
  phone: string | null;
  email: string | null;
  hours: string | null;
  services: string[] | null;
  image: string | null;
  lat: number | null;
  lng: number | null;
}

export default function FindStorePage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("All");
  const [selectedStore, setSelectedStore] = useState<string | null>(null);
  const [countries, setCountries] = useState<string[]>(["All"]);
  
  // Set page context for admin toolbar
  const { setPageContext } = usePageContext();
  useEffect(() => {
    setPageContext({ pageType: "store" });
  }, [setPageContext]);

  useEffect(() => {
    async function fetchStores() {
      try {
        const res = await fetch("/api/stores");
        const data = await res.json();
        setStores(data);
        // Extract unique countries
        const uniqueCountries = ["All", ...new Set(data.map((s: Store) => s.country))];
        setCountries(uniqueCountries as string[]);
      } catch (error) {
        console.error("Failed to fetch stores:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchStores();
  }, []);

  const filteredStores = stores.filter((store) => {
    const matchesSearch =
      store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      store.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      store.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCountry =
      selectedCountry === "All" || store.country === selectedCountry;
    return matchesSearch && matchesCountry;
  });

  const activeStore = selectedStore
    ? stores.find((s) => s.id === selectedStore)
    : null;

  return (
    <main>
      {/* Hero */}
      <section className="bg-black pt-28 pb-8 md:pt-32 md:pb-12" data-header-theme="dark">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3 sm:mb-4">
            Find a store
          </h1>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            Visit us in person for test rides, service, and expert advice.
          </p>
        </div>
      </section>

      {/* Search & Filters */}
      <section className="bg-white/95 backdrop-blur-md sticky top-0 z-40 border-b shadow-sm" data-header-theme="light">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by city or address"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-100 rounded-full border-0 focus:outline-none focus:ring-2 focus:ring-[#fdc501]"
              />
            </div>

            {/* Country Filter */}
            <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
              {countries.map((country) => (
                <button
                  key={country}
                  onClick={() => setSelectedCountry(country)}
                  className={`px-4 py-2.5 text-sm font-medium rounded-full whitespace-nowrap transition-all min-h-[44px] ${
                    selectedCountry === country
                      ? "bg-black text-white shadow-md"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {country}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Map & Store List */}
      <section className="bg-gray-50" data-header-theme="light">
        <div className="max-w-[1800px] mx-auto">
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <div className="text-gray-500">Loading stores...</div>
            </div>
          ) : (
          <div className="grid lg:grid-cols-2">
            {/* Map Placeholder */}
            <div className="relative h-[400px] lg:h-[calc(100vh-12rem)] lg:sticky lg:top-32 bg-gray-200">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Interactive map coming soon</p>
                  <p className="text-sm text-gray-400">
                    {filteredStores.length} stores in selected area
                  </p>
                </div>
              </div>
              {/* Store markers would be rendered here */}
              <div className="absolute inset-0 p-8">
                <div className="grid grid-cols-3 gap-4 h-full">
                  {filteredStores.slice(0, 6).map((store, i) => (
                    <button
                      key={store.id}
                      onClick={() => setSelectedStore(store.id)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                        selectedStore === store.id
                          ? "bg-[#fdc501] scale-125"
                          : "bg-black hover:scale-110"
                      }`}
                      style={{
                        position: "absolute",
                        top: `${20 + (i % 3) * 25}%`,
                        left: `${15 + Math.floor(i / 3) * 35}%`,
                      }}
                    >
                      <MapPin
                        className={`w-4 h-4 ${
                          selectedStore === store.id ? "text-black" : "text-white"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Store List */}
            <div className="bg-white">
              {activeStore ? (
                /* Store Detail View */
                <div className="p-6 lg:p-8">
                  <button
                    onClick={() => setSelectedStore(null)}
                    className="flex items-center gap-2 text-gray-500 hover:text-black mb-6"
                  >
                    <ChevronRight className="w-4 h-4 rotate-180" />
                    Back to all stores
                  </button>

                  <div className="relative aspect-video rounded-2xl overflow-hidden mb-6">
                    <Image
                      src={activeStore.image || "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80"}
                      alt={activeStore.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <span className="inline-block bg-[#fdc501] text-black text-xs font-bold px-3 py-1 rounded-full mb-4">
                    {activeStore.type}
                  </span>

                  <h2 className="text-2xl font-bold text-black mb-2">
                    {activeStore.name}
                  </h2>
                  <p className="text-gray-600 mb-6">
                    {activeStore.address}, {activeStore.city}, {activeStore.country}
                  </p>

                  <div className="space-y-4 mb-8">
                    {activeStore.hours && (
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-600">{activeStore.hours}</span>
                    </div>
                    )}
                    {activeStore.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-gray-400" />
                      <a
                        href={`tel:${activeStore.phone}`}
                        className="text-gray-600 hover:text-[#fdc501]"
                      >
                        {activeStore.phone}
                      </a>
                    </div>
                    )}
                    {activeStore.email && (
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-gray-400" />
                      <a
                        href={`mailto:${activeStore.email}`}
                        className="text-gray-600 hover:text-[#fdc501]"
                      >
                        {activeStore.email}
                      </a>
                    </div>
                    )}
                  </div>

                  {activeStore.services && activeStore.services.length > 0 && (
                  <div className="mb-8">
                    <h3 className="font-bold text-black mb-3">Services</h3>
                    <div className="flex flex-wrap gap-2">
                      {activeStore.services.map((service) => (
                        <span
                          key={service}
                          className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                        >
                          {service}
                        </span>
                      ))}
                    </div>
                  </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                    {activeStore.lat && activeStore.lng && (
                    <a
                      href={`https://maps.google.com/?q=${activeStore.lat},${activeStore.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 inline-flex items-center justify-center px-6 py-4 bg-black text-white font-medium rounded-full hover:bg-gray-800 transition-colors min-h-[48px]"
                    >
                      <Navigation className="w-5 h-5 mr-2" />
                      Get Directions
                    </a>
                    )}
                    <Link
                      href="/test-rides"
                      className="flex-1 inline-flex items-center justify-center px-6 py-4 bg-[#fdc501] text-black font-medium rounded-full hover:bg-[#fdc501]/90 transition-colors min-h-[48px]"
                    >
                      Book Test Ride
                    </Link>
                  </div>
                </div>
              ) : (
                /* Store List View */
                <div className="divide-y">
                  <div className="p-6">
                    <p className="text-gray-500">
                      {filteredStores.length} store{filteredStores.length !== 1 ? "s" : ""} found
                    </p>
                  </div>
                  {filteredStores.length === 0 ? (
                    <div className="p-6 text-center">
                      <p className="text-gray-500">No stores found matching your search.</p>
                    </div>
                  ) : (
                  filteredStores.map((store) => (
                    <button
                      key={store.id}
                      onClick={() => setSelectedStore(store.id)}
                      className="w-full p-6 text-left hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex gap-4">
                        <div className="relative w-24 h-24 rounded-xl overflow-hidden flex-shrink-0">
                          <Image
                            src={store.image || "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80"}
                            alt={store.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="inline-block bg-gray-100 text-gray-600 text-xs font-medium px-2 py-0.5 rounded mb-2">
                            {store.type}
                          </span>
                          <h3 className="font-bold text-black mb-1 truncate">
                            {store.name}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2">
                            {store.city}, {store.country}
                          </p>
                          {store.hours && (
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Clock className="w-4 h-4" />
                            <span className="truncate">{store.hours}</span>
                          </div>
                          )}
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0 self-center" />
                      </div>
                    </button>
                  ))
                  )}
                </div>
              )}
            </div>
          </div>
          )}
        </div>
      </section>

      {/* Contact CTA */}
      <section className="bg-black py-16" data-header-theme="dark">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Can&apos;t find a store near you?
          </h2>
          <p className="text-white/60 mb-8 max-w-xl mx-auto">
            We&apos;re expanding! Get in touch and we&apos;ll help you find the best option for your area.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center px-8 py-4 bg-[#fdc501] text-black font-medium rounded-full hover:bg-[#fdc501]/90 transition-colors"
          >
            Contact Us
            <ChevronRight className="w-5 h-5 ml-2" />
          </Link>
        </div>
      </section>
    </main>
  );
}
