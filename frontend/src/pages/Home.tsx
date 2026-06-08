import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useHomeData } from "../hooks/useAuctions";
import AuctionCard from "../components/layout/AuctionCard";

export default function Home() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const heroSections = [
    {
      url: "/images/1.jpg",
      link: "/auctions/wristwatches",
      title: "Timeless Elegance",
      texts:
        "Explore our curated collection of vintage Rolex and Patek Philippe timepieces.",
    },
    {
      url: "/images/2.jpg",
      link: "/auctions/pocketwatches",
      title: "Classic Heritage",
      texts:
        "Discover the intricate mechanics of 19th-century gold pocket watches.",
    },
    {
      url: "/images/3.jpg",
      link: "/auctions/smartwatches",
      title: "Modern Innovation",
      texts:
        "Where luxury meets technology. The finest smartwatches on the market.",
    },
    {
      url: "/images/4.jpg",
      link: "/auctions/clocks",
      title: "Grand Presence",
      texts:
        "Exceptional grandfather clocks and maritime chronometers for collectors.",
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

  const current = heroSections[currentIndex];

  const { data } = useHomeData();

  return (
    <main className="w-full bg-slate-50 min-h-screen pb-24">
      {/* --- HERO SZEKCIÓ --- */}
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
                  className="bg-primary hover:bg-primary-hover text-background px-8 py-4 rounded-xl font-bold font-inter transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-primary/20 uppercase tracking-wider text-sm"
                >
                  View Auction
                </Link>
                <button className="border border-white/30 hover:bg-white/10 text-white px-8 py-4 rounded-xl font-bold font-inter transition-all backdrop-blur-sm uppercase tracking-wider text-sm">
                  Details
                </button>
              </div>
            </div>

            {/* Carousel indikátorok */}
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

      {/* --- KATEGÓRIÁK SZEKCIÓ --- */}
      {/* Közös konténer, ugyanazokkal a margókkal, mint a Hero. A gap-16 adja a szekciók közti távolságot */}
      <div className="max-w-[1400px] mx-auto px-4 md:px-10 flex flex-col gap-16 mt-16">
        {/* Promoted */}
        <section>
          <div className="flex items-end justify-between mb-6">
            <h2 className="font-playfair text-3xl md:text-4xl font-bold text-slate-900 border-l-4 border-primary pl-4 leading-none">
              Promoted
            </h2>
            <Link
              to="/promoted"
              className="text-sm font-inter font-bold text-gray-500 hover:text-primary transition-colors uppercase tracking-wider hidden sm:block"
            >
              View All &rarr;
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {data?.promoted.map((auction) => (
              <AuctionCard key={auction.id} auction={auction} />
            ))}
          </div>
        </section>

        {/* Most Popular */}
        <section>
          <div className="flex items-end justify-between mb-6">
            <h2 className="font-playfair text-3xl md:text-4xl font-bold text-slate-900 border-l-4 border-primary pl-4 leading-none">
              Most Popular
            </h2>
            <Link
              to="/popular"
              className="text-sm font-inter font-bold text-gray-500 hover:text-primary transition-colors uppercase tracking-wider hidden sm:block"
            >
              View All &rarr;
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {data?.trending.map((item, index) => (
              <AuctionCard key={index} auction={item.auction} />
            ))}
          </div>
        </section>

        {/* Ending Soon */}
        <section>
          <div className="flex items-end justify-between mb-6">
            <h2 className="font-playfair text-3xl md:text-4xl font-bold text-slate-900 border-l-4 border-red-500 pl-4 leading-none">
              Ending Soon
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {data?.latest.map((auction) => (
              <AuctionCard key={auction.id} auction={auction} />
            ))}
          </div>
        </section>

        {/* Smartwatches */}
        <section>
          <div className="flex items-end justify-between mb-6">
            <h2 className="font-playfair text-3xl md:text-4xl font-bold text-slate-900 border-l-4 border-primary pl-4 leading-none">
              Smartwatches
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {data?.smartwatches.map((auction) => (
              <AuctionCard key={auction.id} auction={auction} />
            ))}
          </div>
        </section>

        {/* Wristwatches */}
        <section>
          <div className="flex items-end justify-between mb-6">
            <h2 className="font-playfair text-3xl md:text-4xl font-bold text-slate-900 border-l-4 border-primary pl-4 leading-none">
              Wristwatches
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {data?.wristwatches.map((auction) => (
              <AuctionCard key={auction.id} auction={auction} />
            ))}
          </div>
        </section>

        {/* Pocket Watches (Javítottam a 'Wathes' elírást) */}
        <section>
          <div className="flex items-end justify-between mb-6">
            <h2 className="font-playfair text-3xl md:text-4xl font-bold text-slate-900 border-l-4 border-primary pl-4 leading-none">
              Pocket Watches
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {data?.pocketWatches.map((auction) => (
              <AuctionCard key={auction.id} auction={auction} />
            ))}
          </div>
        </section>

        {/* Clocks */}
        <section>
          <div className="flex items-end justify-between mb-6">
            <h2 className="font-playfair text-3xl md:text-4xl font-bold text-slate-900 border-l-4 border-primary pl-4 leading-none">
              Clocks
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {data?.clocks.map((auction) => (
              <AuctionCard key={auction.id} auction={auction} />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
