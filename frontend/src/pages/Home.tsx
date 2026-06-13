import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useHomeData } from "../hooks/useAuctions";
import AuctionCard from "../components/layout/AuctionCard";
import { useQueryClient } from "@tanstack/react-query";
import api from "../api/axios";

export default function Home() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const queryClient = useQueryClient();

  const heroSections = [
    {
      url: "/images/1.jpg",
      link: "/auction/category/wristwatch",
      title: "Luxury Wristwatches",
      texts: "Find the perfect timepiece for any occasion.",
    },
    {
      url: "/images/2.jpg",
      link: "/auction/category/pocketwatch",
      title: "Classic Pocket Watches",
      texts: "Own a piece of history with traditional designs.",
    },
    {
      url: "/images/3.jpg",
      link: "/auction/category/smartwatch",
      title: "Modern Smartwatches",
      texts: "Stay connected with the latest wearable technology.",
    },
    {
      url: "/images/4.jpg",
      link: "/auction/category/clock",
      title: "Premium Clocks",
      texts: "Add timeless style to your home or office.",
    },
  ];

  const next = () => {
    setCurrentIndex((prev) =>
      prev === heroSections.length - 1 ? 0 : prev + 1,
    );
  };

  useEffect(() => {
    const autoplay = setInterval(next, 10000);
    return () => clearInterval(autoplay);
  }, []);

  const handleMouseEnter = (linkUrl: string) => {
    const categoryFromUrl = linkUrl.split("/").pop();
    if (!categoryFromUrl) return;

    const skip = 0;
    const take = 10;

    const formattedCategoryForBackend = categoryFromUrl.toUpperCase();

    queryClient.prefetchQuery({
      queryKey: ["categoryAuctions", categoryFromUrl, skip, take],

      queryFn: async () => {
        const response = await api.get(
          `/auction/category/${formattedCategoryForBackend}`,
          {
            params: { skip, take },
          },
        );
        return response.data;
      },
      staleTime: 60000,
    });
  };

  const current = heroSections[currentIndex];

  const { data, isLoading } = useHomeData();

  if (isLoading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-text-muted/10">
        <span className="font-playfair text-2xl text-primary animate-pulse">
          Loading Collections...
        </span>
      </div>
    );
  }

  const cardSizingClass =
    "shrink-0 snap-start w-[85vw] sm:w-[calc(50%-12px)] md:w-[calc(33.333%-16px)] lg:w-[calc(25%-18px)] xl:w-[calc(20%-19.2px)]";
  const scrollContainerClass =
    "flex overflow-x-auto gap-6 px-4 md:px-10 scroll-pl-4 md:scroll-pl-10 pb-6 pt-2 snap-x snap-mandatory after:content-[''] after:shrink-0 after:w-4 md:after:w-10 [&::-webkit-scrollbar]:h-2.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-stone-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-stone-400 transition-colors";
  const maskClass =
    "-mx-4 md:-mx-10 relative [mask-image:linear-gradient(to_right,black_0%,black_90%,transparent_100%)]";

  return (
    <main className="w-full bg-text-muted/10 min-h-screen pb-24">
      {/* Hero section */}
      <div className="max-w-[1400px] mx-auto px-4 md:px-10 pt-6 md:pt-10">
        <div
          className="relative w-full h-[600px] rounded-3xl overflow-hidden bg-cover bg-center shadow-2xl transition-all duration-1000 ease-in-out border border-white/10"
          style={{ backgroundImage: `url('${current.url}')` }}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] flex flex-col justify-center px-6 md:px-20">
            <div className="max-w-2xl bg-white/5 backdrop-blur-md p-8 md:p-12 rounded-2xl border border-white/10 shadow-2xl">
              <h1 className="font-playfair text-4xl md:text-6xl font-bold text-primary mb-4 drop-shadow-lg">
                {current.title}
              </h1>

              <p className="font-inter text-lg md:text-xl text-gray-200 mb-8 leading-relaxed">
                {current.texts}
              </p>

              <div className="flex flex-wrap gap-4">
                <Link
                  to={current.link}
                  onMouseEnter={() => handleMouseEnter(current.link)}
                  className="bg-primary hover:bg-primary-hover text-background px-8 py-4 rounded-xl font-bold font-inter transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-primary/20 uppercase tracking-wider text-sm inline-block"
                >
                  Explore Collection
                </Link>
              </div>
            </div>

            {/* Carousel indicators */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-3">
              {heroSections.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`h-2 transition-all duration-300 rounded-full ${
                    index === currentIndex
                      ? "w-10 bg-primary"
                      : "w-2 bg-white/30 hover:bg-white/50"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="max-w-[1400px] mx-auto px-4 md:px-10 flex flex-col gap-16 mt-16">
        {/* Promoted */}
        <section>
          <div className="flex items-end justify-between mb-6">
            <h2 className="font-playfair text-3xl md:text-4xl font-bold text-slate-900 border-l-4 border-primary pl-4 leading-none">
              Promoted
            </h2>
          </div>
          <div className={maskClass}>
            <div className={scrollContainerClass}>
              {data?.promoted.map((auction) => (
                <div key={auction.id} className={cardSizingClass}>
                  <AuctionCard auction={auction} />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Most Popular */}
        <section>
          <div className="flex items-end justify-between mb-6">
            <h2 className="font-playfair text-3xl md:text-4xl font-bold text-slate-900 border-l-4 border-primary pl-4 leading-none">
              Most Popular
            </h2>
          </div>
          <div className={maskClass}>
            <div className={scrollContainerClass}>
              {data?.trending.map((item, index) => (
                <div key={index} className={cardSizingClass}>
                  <AuctionCard auction={item.auction} />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Ending Soon */}
        <section>
          <div className="flex items-end justify-between mb-6">
            <h2 className="font-playfair text-3xl md:text-4xl font-bold text-slate-900 border-l-4 border-primary pl-4 leading-none">
              Ending Soon
            </h2>
          </div>
          <div className={maskClass}>
            <div className={scrollContainerClass}>
              {data?.latest.map((auction) => (
                <div key={auction.id} className={cardSizingClass}>
                  <AuctionCard auction={auction} />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Smartwatches */}
        <section>
          <div className="flex items-end justify-between mb-6">
            <h2 className="font-playfair text-3xl md:text-4xl font-bold text-slate-900 border-l-4 border-primary pl-4 leading-none">
              Smartwatches
            </h2>
          </div>
          <div className={maskClass}>
            <div className={scrollContainerClass}>
              {data?.smartwatches.map((auction) => (
                <div key={auction.id} className={cardSizingClass}>
                  <AuctionCard auction={auction} />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Wristwatches */}
        <section>
          <div className="flex items-end justify-between mb-6">
            <h2 className="font-playfair text-3xl md:text-4xl font-bold text-slate-900 border-l-4 border-primary pl-4 leading-none">
              Wristwatches
            </h2>
          </div>
          <div className={maskClass}>
            <div className={scrollContainerClass}>
              {data?.wristwatches.map((auction) => (
                <div key={auction.id} className={cardSizingClass}>
                  <AuctionCard auction={auction} />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pocket Watches */}
        <section>
          <div className="flex items-end justify-between mb-6">
            <h2 className="font-playfair text-3xl md:text-4xl font-bold text-slate-900 border-l-4 border-primary pl-4 leading-none">
              Pocket Watches
            </h2>
          </div>
          <div className={maskClass}>
            <div className={scrollContainerClass}>
              {data?.pocketWatches.map((auction) => (
                <div key={auction.id} className={cardSizingClass}>
                  <AuctionCard auction={auction} />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Clocks */}
        <section>
          <div className="flex items-end justify-between mb-6">
            <h2 className="font-playfair text-3xl md:text-4xl font-bold text-slate-900 border-l-4 border-primary pl-4 leading-none">
              Clocks
            </h2>
          </div>
          <div className={maskClass}>
            <div className={scrollContainerClass}>
              {data?.clocks.map((auction) => (
                <div key={auction.id} className={cardSizingClass}>
                  <AuctionCard auction={auction} />
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
