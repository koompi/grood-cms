"use client";

import { useState } from "react";
import Image from "next/image";
import { MapPin, Calendar, Clock, ChevronDown, Check } from "lucide-react";

const locations = [
  {
    id: 1,
    name: "Grood Phnom Penh Flagship",
    address: "123 Norodom Blvd, Phnom Penh",
    city: "Phnom Penh",
    country: "Cambodia",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80",
    availability: ["Mon-Sat", "9:00 AM - 7:00 PM"],
  },
  {
    id: 2,
    name: "Grood Siem Reap",
    address: "456 Pub Street, Siem Reap",
    city: "Siem Reap",
    country: "Cambodia",
    image: "https://images.unsplash.com/photo-1558618047-3c8b73fc3a58?w=600&q=80",
    availability: ["Mon-Sun", "8:00 AM - 8:00 PM"],
  },
  {
    id: 3,
    name: "Grood Bangkok Central",
    address: "789 Sukhumvit Road, Bangkok",
    city: "Bangkok",
    country: "Thailand",
    image: "https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=600&q=80",
    availability: ["Mon-Sat", "10:00 AM - 8:00 PM"],
  },
  {
    id: 4,
    name: "Grood Singapore",
    address: "101 Orchard Road, Singapore",
    city: "Singapore",
    country: "Singapore",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80",
    availability: ["Mon-Sun", "10:00 AM - 9:00 PM"],
  },
];

const bikes = [
  { id: "s1", name: "Grood S1", description: "Sport Series" },
  { id: "c1", name: "Grood C1", description: "City Series" },
  { id: "x1", name: "Grood X1", description: "Adventure Series" },
];

const timeSlots = [
  "9:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "1:00 PM",
  "2:00 PM",
  "3:00 PM",
  "4:00 PM",
  "5:00 PM",
  "6:00 PM",
];

export default function TestRidesPage() {
  const [step, setStep] = useState(1);
  const [selectedLocation, setSelectedLocation] = useState<number | null>(null);
  const [selectedBike, setSelectedBike] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle booking submission
    alert("Test ride booked successfully!");
  };

  return (
    <main>
      {/* Hero */}
      <section className="relative min-h-[60vh] flex items-center bg-black pt-20" data-header-theme="dark">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=1920&q=80"
            alt="Test Rides"
            fill
            className="object-cover opacity-40"
          />
        </div>
        <div className="relative z-10 max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6">
            Book a test ride
          </h1>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            Experience the future of urban mobility. Book a free test ride at one of our brand stores.
          </p>
        </div>
      </section>

      {/* Booking Steps */}
      <section className="bg-white/95 backdrop-blur-md border-b sticky top-0 z-40 shadow-sm" data-header-theme="light">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-4">
          <div className="flex items-center justify-between">
            {[
              { num: 1, label: "Location" },
              { num: 2, label: "Bike & Date" },
              { num: 3, label: "Your Details" },
            ].map((s, i) => (
              <div key={s.num} className="flex items-center">
                <div className="flex items-center">
                  <div
                    className={`w-10 h-10 min-w-[40px] rounded-full flex items-center justify-center font-bold transition-colors ${
                      step >= s.num
                        ? "bg-[#fdc501] text-black"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {step > s.num ? <Check className="w-5 h-5" /> : s.num}
                  </div>
                  <span
                    className={`ml-2 sm:ml-3 font-medium text-sm sm:text-base hidden sm:inline ${
                      step >= s.num ? "text-black" : "text-gray-400"
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
                {i < 2 && (
                  <div
                    className={`w-8 sm:w-16 md:w-24 h-0.5 mx-2 sm:mx-4 ${
                      step > s.num ? "bg-[#fdc501]" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Step Content */}
      <section className="bg-gray-50 py-16" data-header-theme="light">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
          {/* Step 1: Select Location */}
          {step === 1 && (
            <div>
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-black mb-4">
                  Choose a store near you
                </h2>
                <p className="text-gray-600">
                  Select a location to see available test ride slots
                </p>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {locations.map((location) => (
                  <button
                    key={location.id}
                    onClick={() => setSelectedLocation(location.id)}
                    className={`text-left bg-white rounded-2xl overflow-hidden transition-all ${
                      selectedLocation === location.id
                        ? "ring-2 ring-[#fdc501] shadow-lg"
                        : "hover:shadow-md"
                    }`}
                  >
                    <div className="relative aspect-video">
                      <Image
                        src={location.image}
                        alt={location.name}
                        fill
                        className="object-cover"
                      />
                      {selectedLocation === location.id && (
                        <div className="absolute top-4 right-4 w-8 h-8 bg-[#fdc501] rounded-full flex items-center justify-center">
                          <Check className="w-5 h-5 text-black" />
                        </div>
                      )}
                    </div>
                    <div className="p-6">
                      <h3 className="font-bold text-black mb-1">{location.name}</h3>
                      <p className="text-sm text-gray-600 mb-3">{location.address}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock className="w-4 h-4" />
                        <span>{location.availability[1]}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              <div className="mt-12 text-center">
                <button
                  onClick={() => setStep(2)}
                  disabled={!selectedLocation}
                  className={`px-8 py-4 rounded-full font-medium transition-all ${
                    selectedLocation
                      ? "bg-black text-white hover:bg-gray-800"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Select Bike & Date */}
          {step === 2 && (
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-black mb-4">
                  Select your bike and date
                </h2>
                <p className="text-gray-600">
                  Choose which Grood you&apos;d like to test and your preferred time
                </p>
              </div>

              {/* Bike Selection */}
              <div className="mb-8">
                <h3 className="text-lg font-bold text-black mb-4">Choose a bike</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  {bikes.map((bike) => (
                    <button
                      key={bike.id}
                      onClick={() => setSelectedBike(bike.id)}
                      className={`p-6 rounded-xl text-left transition-all ${
                        selectedBike === bike.id
                          ? "bg-[#fdc501] text-black"
                          : "bg-white hover:bg-gray-100"
                      }`}
                    >
                      <h4 className="font-bold">{bike.name}</h4>
                      <p
                        className={`text-sm ${
                          selectedBike === bike.id ? "text-black/70" : "text-gray-500"
                        }`}
                      >
                        {bike.description}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Date Selection */}
              <div className="mb-8">
                <h3 className="text-lg font-bold text-black mb-4">Select a date</h3>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full px-6 py-4 bg-white rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-[#fdc501]"
                />
              </div>

              {/* Time Selection */}
              {selectedDate && (
                <div className="mb-8">
                  <h3 className="text-lg font-bold text-black mb-4">Choose a time</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-3">
                    {timeSlots.map((time) => (
                      <button
                        key={time}
                        onClick={() => setSelectedTime(time)}
                        className={`px-3 sm:px-4 py-3 sm:py-4 rounded-lg font-medium transition-all min-h-[48px] text-sm sm:text-base ${
                          selectedTime === time
                            ? "bg-[#fdc501] text-black"
                            : "bg-white hover:bg-gray-100 text-gray-700"
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-4 justify-center mt-12">
                <button
                  onClick={() => setStep(1)}
                  className="px-8 py-4 rounded-full font-medium bg-white text-black hover:bg-gray-100 transition-all"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!selectedBike || !selectedDate || !selectedTime}
                  className={`px-8 py-4 rounded-full font-medium transition-all ${
                    selectedBike && selectedDate && selectedTime
                      ? "bg-black text-white hover:bg-gray-800"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Contact Details */}
          {step === 3 && (
            <div className="max-w-xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-black mb-4">
                  Your details
                </h2>
                <p className="text-gray-600">
                  Fill in your information to complete your booking
                </p>
              </div>

              {/* Booking Summary */}
              <div className="bg-[#fdc501]/10 rounded-2xl p-6 mb-8">
                <h3 className="font-bold text-black mb-4">Booking Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Location</span>
                    <span className="text-black font-medium">
                      {locations.find((l) => l.id === selectedLocation)?.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Bike</span>
                    <span className="text-black font-medium">
                      {bikes.find((b) => b.id === selectedBike)?.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date</span>
                    <span className="text-black font-medium">{selectedDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Time</span>
                    <span className="text-black font-medium">{selectedTime}</span>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={(e) =>
                        setFormData({ ...formData, firstName: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-white rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-[#fdc501]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={(e) =>
                        setFormData({ ...formData, lastName: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-white rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-[#fdc501]"
                    />
                  </div>
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
                    className="w-full px-4 py-3 bg-white rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-[#fdc501]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-white rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-[#fdc501]"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="flex-1 px-8 py-4 rounded-full font-medium bg-white text-black hover:bg-gray-100 transition-all"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-8 py-4 rounded-full font-medium bg-[#fdc501] text-black hover:bg-[#fdc501]/90 transition-all"
                  >
                    Book Test Ride
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-white py-16" data-header-theme="light">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-black text-center mb-12">
            Frequently asked questions
          </h2>
          <div className="space-y-4">
            {[
              {
                q: "How long is a test ride?",
                a: "Each test ride session is approximately 30 minutes, giving you enough time to experience the bike's features and get a feel for your preferred model.",
              },
              {
                q: "Do I need to bring anything?",
                a: "Just bring a valid ID. We provide helmets and all necessary safety equipment at our stores.",
              },
              {
                q: "Can I test ride multiple bikes?",
                a: "Absolutely! If you'd like to test multiple models, just book separate slots for each bike or let us know when you arrive.",
              },
              {
                q: "Is there a cost for test rides?",
                a: "Test rides are completely free. We want you to experience the Grood difference before making any commitment.",
              },
            ].map((faq, i) => (
              <details
                key={i}
                className="group bg-gray-50 rounded-xl overflow-hidden"
              >
                <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                  <span className="font-medium text-black">{faq.q}</span>
                  <ChevronDown className="w-5 h-5 text-gray-400 transition-transform group-open:rotate-180" />
                </summary>
                <div className="px-6 pb-6 text-gray-600">{faq.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
