import Image from "next/image";
import Link from "next/link";
import { Calendar, Clock, ArrowLeft, Share2, Facebook, Twitter, Linkedin } from "lucide-react";

// This would typically come from a CMS or API
const posts: Record<string, {
  title: string;
  excerpt: string;
  content: string;
  category: string;
  author: {
    name: string;
    avatar: string;
    bio: string;
  };
  date: string;
  readTime: string;
  image: string;
}> = {
  "future-urban-mobility": {
    title: "The Future of Urban Mobility: How E-Bikes Are Changing Cities",
    excerpt: "Cities around the world are embracing e-bikes as a sustainable solution to urban transportation challenges.",
    content: `
      <p class="text-xl text-gray-600 mb-8">The urban landscape is transforming. As cities grapple with congestion, pollution, and the need for sustainable transportation, e-bikes are emerging as a game-changing solution that's reshaping how we think about getting around.</p>

      <h2 class="text-2xl font-bold text-black mt-12 mb-4">The Rise of Micro-Mobility</h2>
      <p class="text-gray-600 mb-6">In the past decade, we've witnessed a remarkable shift in urban transportation. The concept of micro-mobility – using lightweight, often electric vehicles for short trips – has gone from niche to mainstream. E-bikes sit at the heart of this revolution, offering the perfect balance of convenience, sustainability, and practicality.</p>

      <p class="text-gray-600 mb-6">According to recent studies, e-bike sales have increased by over 240% in Southeast Asia alone. Cities like Amsterdam, Copenhagen, and increasingly Phnom Penh are seeing dedicated bike lanes and infrastructure investments that make cycling safer and more accessible than ever before.</p>

      <h2 class="text-2xl font-bold text-black mt-12 mb-4">Why E-Bikes Are Different</h2>
      <p class="text-gray-600 mb-6">Traditional bicycles have always been environmentally friendly, but they come with limitations. Hills, long distances, and hot weather can make cycling impractical for many commuters. E-bikes solve these problems elegantly:</p>

      <ul class="list-disc list-inside text-gray-600 mb-6 space-y-2">
        <li>Electric assistance makes hills feel flat and headwinds disappear</li>
        <li>Arrive at work without breaking a sweat</li>
        <li>Carry groceries or children with ease</li>
        <li>Cover distances that would be too far on a regular bike</li>
      </ul>

      <h2 class="text-2xl font-bold text-black mt-12 mb-4">The Environmental Impact</h2>
      <p class="text-gray-600 mb-6">The numbers are compelling. A typical e-bike produces approximately 22 grams of CO2 per kilometer – compared to 271 grams for the average car. When you factor in the reduced need for parking infrastructure, road maintenance, and the health benefits of cycling, the case for e-bikes becomes overwhelming.</p>

      <blockquote class="border-l-4 border-[#fdc501] pl-6 my-8 italic text-xl text-gray-700">
        "E-bikes represent the most significant advancement in urban transportation since the automobile. They're not just vehicles – they're a statement about the future we want to create."
      </blockquote>

      <h2 class="text-2xl font-bold text-black mt-12 mb-4">Grood's Vision</h2>
      <p class="text-gray-600 mb-6">At Grood, we believe that the best transportation is the one you actually enjoy using. That's why we've designed our bikes not just for efficiency, but for the sheer pleasure of riding. From the instant torque of our motors to the intuitive controls and sleek design, every aspect is crafted to make your daily commute the highlight of your day.</p>

      <p class="text-gray-600 mb-6">Our commitment goes beyond the product. We're actively working with city planners, advocating for better cycling infrastructure, and building a community of riders who share our vision of cleaner, quieter, more livable cities.</p>

      <h2 class="text-2xl font-bold text-black mt-12 mb-4">Looking Ahead</h2>
      <p class="text-gray-600 mb-6">The future of urban mobility is not just about technology – it's about reimagining our relationship with cities. E-bikes are part of a larger shift toward more human-centered urban design, where streets serve people rather than just vehicles.</p>

      <p class="text-gray-600 mb-6">As we look to the future, we see e-bikes becoming an integral part of city life. Integrated with public transit, supported by smart infrastructure, and adopted by commuters of all ages, they represent a more sustainable, healthier, and more enjoyable way to navigate our urban environment.</p>

      <p class="text-gray-600">The revolution is already here. The only question is: are you ready to join it?</p>
    `,
    category: "Technology",
    author: {
      name: "Sarah Chen",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80",
      bio: "Urban mobility researcher and Grood's Head of Sustainability",
    },
    date: "Dec 15, 2024",
    readTime: "8 min read",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80",
  },
};

const relatedPosts = [
  {
    title: "5 Essential Accessories for Your Daily Commute",
    slug: "essential-accessories-commute",
    image: "https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=400&q=80",
    date: "Dec 12, 2024",
  },
  {
    title: "Behind the Design: The Making of Grood S1",
    slug: "behind-design-grood-s1",
    image: "https://images.unsplash.com/photo-1558618047-f4b511986f01?w=400&q=80",
    date: "Dec 8, 2024",
  },
  {
    title: "Winter Riding Tips: Stay Safe and Comfortable",
    slug: "winter-riding-tips",
    image: "https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=400&q=80",
    date: "Dec 3, 2024",
  },
];

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = posts[slug] || posts["future-urban-mobility"];

  return (
    <main>
      {/* Hero */}
      <section className="relative h-[60vh] min-h-[400px]" data-header-theme="dark">
        <Image
          src={post.image}
          alt={post.title}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        <div className="absolute inset-0 flex items-end">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 w-full">
            <Link
              href="/blog"
              className="inline-flex items-center text-white/70 hover:text-white mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Stories
            </Link>
            <span className="inline-block bg-[#fdc501] text-black text-xs font-bold px-3 py-1 rounded-full mb-4">
              {post.category}
            </span>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6">
              {post.title}
            </h1>
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-sm sm:text-base text-white/70">
              <div className="flex items-center gap-3">
                <Image
                  src={post.author.avatar}
                  alt={post.author.name}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
                <span>{post.author.name}</span>
              </div>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {post.date}
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {post.readTime}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="bg-white py-12 md:py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <article
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Share */}
          <div className="mt-12 pt-8 border-t">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <span className="text-gray-600 flex items-center gap-2">
                <Share2 className="w-5 h-5" />
                Share this article
              </span>
              <div className="flex gap-3">
                <a
                  href="#"
                  className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-[#fdc501] hover:text-black transition-colors"
                >
                  <Facebook className="w-5 h-5" />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-[#fdc501] hover:text-black transition-colors"
                >
                  <Twitter className="w-5 h-5" />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-[#fdc501] hover:text-black transition-colors"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>

          {/* Author */}
          <div className="mt-8 p-6 bg-gray-50 rounded-2xl">
            <div className="flex items-start gap-4">
              <Image
                src={post.author.avatar}
                alt={post.author.name}
                width={64}
                height={64}
                className="rounded-full"
              />
              <div>
                <h3 className="font-bold text-black">{post.author.name}</h3>
                <p className="text-gray-600 text-sm">{post.author.bio}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Posts */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-black mb-8">
            Related stories
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {relatedPosts.map((related) => (
              <Link
                key={related.slug}
                href={`/blog/${related.slug}`}
                className="group bg-white rounded-2xl overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="relative aspect-[16/10]">
                  <Image
                    src={related.image}
                    alt={related.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-black group-hover:text-[#fdc501] transition-colors">
                    {related.title}
                  </h3>
                  <p className="text-sm text-gray-500 mt-2">{related.date}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-black py-16">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to experience Grood?
          </h2>
          <p className="text-white/60 mb-8 max-w-xl mx-auto">
            Book a free test ride and discover the future of urban mobility.
          </p>
          <Link
            href="/test-rides"
            className="inline-flex items-center px-8 py-4 bg-[#fdc501] text-black font-medium rounded-full hover:bg-[#fdc501]/90 transition-colors"
          >
            Book a Test Ride
          </Link>
        </div>
      </section>
    </main>
  );
}
