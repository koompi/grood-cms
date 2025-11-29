import Image from "next/image";
import Link from "next/link";
import { 
  Smartphone, 
  Unlock, 
  MapPin, 
  Settings, 
  Users, 
  Bell, 
  Heart,
  ArrowRight,
  Check
} from "lucide-react";

const appFeatures = [
  {
    icon: Unlock,
    title: "Unlock your bike",
    description: "Unlocking your bike is effortless with the app – no extra thought required. Enable Touch Unlock and your bike unlocks automatically when your phone is in range.",
  },
  {
    icon: MapPin,
    title: "Track your ride",
    description: "Track your rides to get to know you, your bike, and your city. Check distance, speed, and battery consumption. Compare your stats with riders worldwide.",
  },
  {
    icon: Settings,
    title: "Customize settings",
    description: "Tune everything to match your riding style. From gear shifting to motor assistance, every setting is designed to give you a ride that feels just right.",
  },
  {
    icon: Users,
    title: "Share your bike",
    description: "Nothing comes between your friend and your ride. Add their email to the app and they can access your bike with their own profile.",
  },
];

const freeFeatures = [
  "Touch unlock",
  "Track rides",
  "Customize settings",
  "Share with friends",
];

const proFeatures = [
  "Live theft tracking",
  "Instant alarm notifications",
  "Health app integration",
  "Priority support",
];

export default function AppPage() {
  return (
    <main>
      {/* Hero */}
      <section className="relative min-h-[80vh] flex items-center bg-black overflow-hidden pt-20" data-header-theme="dark">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=1920&q=80"
            alt="Grood App"
            fill
            className="object-cover opacity-30"
          />
        </div>
        <div className="relative z-10 max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <p className="text-sm font-medium text-[#fdc501] uppercase tracking-wider mb-4">
            Grood App
          </p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-4 sm:mb-6">
            Your all-in-one<br />riding companion
          </h1>
          <p className="text-xl text-white/70 max-w-2xl mx-auto mb-10">
            Track, customize, unlock, and fine-tune every detail to suit your ride just the way you want it.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#"
              className="inline-flex items-center justify-center px-8 py-4 text-base font-medium text-black bg-white rounded-full hover:bg-gray-100 transition-all"
            >
              <svg className="w-6 h-6 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
              </svg>
              App Store
            </a>
            <a
              href="#"
              className="inline-flex items-center justify-center px-8 py-4 text-base font-medium text-black bg-white rounded-full hover:bg-gray-100 transition-all"
            >
              <svg className="w-6 h-6 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
              </svg>
              Play Store
            </a>
          </div>
        </div>
      </section>

      {/* Intro Text */}
      <section className="bg-white py-16 sm:py-24" data-header-theme="light">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xl sm:text-2xl md:text-3xl text-black leading-relaxed">
            You and your bike&apos;s perfect partner? The Grood app. Track, customize, unlock, 
            and fine-tune every detail to suit your ride just the way you want it.
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-50 py-24 md:py-32" data-header-theme="light">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-24">
            {appFeatures.map((feature, index) => (
              <div
                key={feature.title}
                className={`grid lg:grid-cols-2 gap-12 items-center ${
                  index % 2 === 1 ? "lg:flex-row-reverse" : ""
                }`}
              >
                <div className={index % 2 === 1 ? "lg:order-2" : ""}>
                  <div className="w-16 h-16 mb-6 rounded-full bg-[#fdc501]/10 flex items-center justify-center">
                    <feature.icon className="w-8 h-8 text-[#fdc501]" />
                  </div>
                  <h2 className="text-4xl md:text-5xl font-bold text-black mb-6">
                    {feature.title}
                  </h2>
                  <p className="text-xl text-gray-600">
                    {feature.description}
                  </p>
                </div>
                <div className={`relative aspect-square ${index % 2 === 1 ? "lg:order-1" : ""}`}>
                  <div className="absolute inset-0 bg-gradient-to-br from-[#fdc501]/20 to-transparent rounded-3xl" />
                  <Image
                    src={`https://images.unsplash.com/photo-${index === 0 ? "1512941937669-90a1b58e7e9c" : index === 1 ? "1551288049-bebba4288485" : index === 2 ? "1460925895917-afdab827c52f" : "1522202176988-66273c2fd55f"}?w=800&q=80`}
                    alt={feature.title}
                    fill
                    className="object-cover rounded-3xl"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="bg-black py-24 md:py-32" data-header-theme="dark">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              The complete riding experience
            </h2>
            <p className="text-xl text-white/60 max-w-2xl mx-auto">
              The Grood app is free and integral to your ride. But if you&apos;re ready to level up, 
              check out Ride Pro with advanced features.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <Smartphone className="w-8 h-8 text-white" />
                <div>
                  <h3 className="text-xl font-bold text-white">Grood App</h3>
                  <p className="text-white/60">Free forever</p>
                </div>
              </div>
              <ul className="space-y-4 mb-8">
                {freeFeatures.map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-[#fdc501]" />
                    <span className="text-white">{feature}</span>
                  </li>
                ))}
              </ul>
              <p className="text-3xl font-bold text-white mb-6">Included</p>
              <a
                href="#"
                className="block w-full py-4 text-center text-black bg-white rounded-full font-medium hover:bg-gray-100 transition-colors"
              >
                Download App
              </a>
            </div>

            {/* Pro Plan */}
            <div className="bg-[#fdc501] rounded-2xl p-8 relative overflow-hidden">
              <div className="absolute top-4 right-4 bg-black text-white text-xs font-bold px-2 py-1 rounded-full">
                Recommended
              </div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                  <Bell className="w-5 h-5 text-[#fdc501]" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-black">Ride Pro</h3>
                  <p className="text-black/60">Advanced protection</p>
                </div>
              </div>
              <ul className="space-y-4 mb-8">
                {proFeatures.map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-black" />
                    <span className="text-black">{feature}</span>
                  </li>
                ))}
              </ul>
              <p className="text-3xl font-bold text-black mb-2">$49/year</p>
              <p className="text-sm text-black/60 mb-6">Less than $5/month</p>
              <button className="block w-full py-4 text-center text-white bg-black rounded-full font-medium hover:bg-gray-800 transition-colors">
                Get Ride Pro
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Apple Integration */}
      <section className="bg-white py-24 md:py-32" data-header-theme="light">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-sm font-medium text-[#fdc501] uppercase tracking-wider mb-4">
                Apple Find My
              </p>
              <h2 className="text-4xl md:text-5xl font-bold text-black mb-6">
                Track with Apple Find My
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                The Apple Find My network provides an easy, secure way to locate your Grood on a map. 
                Use the Find My App on your iPhone, iPad, Mac, or web browser.
              </p>
              <a
                href="#"
                className="inline-flex items-center px-8 py-4 text-base font-medium text-white bg-black rounded-full hover:bg-gray-800 transition-all"
              >
                Get Find My App
                <ArrowRight className="ml-2 w-5 h-5" />
              </a>
            </div>
            <div className="relative aspect-square">
              <Image
                src="https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=800&q=80"
                alt="Apple Watch with Grood"
                fill
                className="object-cover rounded-3xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Download CTA */}
      <section className="bg-gray-50 py-24" data-header-theme="light">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-black mb-6">
            Download the app
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10">
            Available for iOS and Android. Start your Grood journey today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#"
              className="inline-flex items-center justify-center px-8 py-4 text-base font-medium text-white bg-black rounded-full hover:bg-gray-800 transition-all"
            >
              <svg className="w-6 h-6 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
              </svg>
              App Store
            </a>
            <a
              href="#"
              className="inline-flex items-center justify-center px-8 py-4 text-base font-medium text-white bg-black rounded-full hover:bg-gray-800 transition-all"
            >
              <svg className="w-6 h-6 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
              </svg>
              Play Store
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
