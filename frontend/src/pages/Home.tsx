// WE CAN CHANGE THE STATIC PARTS WITH DATABASES FOR THE HERO SECTION
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
    <main className="w-full">
      <div className="max-w-[1400px] mx-auto p-4 md:p-10">
        <div
          className="relative w-full h-[600px] rounded-3xl overflow-hidden bg-cover bg-center shadow-2xl transition-all duration-1000 ease-in-out border border-white/10"
          style={{ backgroundImage: `url('${current.url}')` }}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] flex flex-col justify-center px-10 md:px-20">
            <div className="max-w-2xl bg-white/5 backdrop-blur-md p-8 md:p-12 rounded-2xl border border-white/10 shadow-2xl">
              <h1 className="font-playfair text-4xl md:text-6xl font-bold text-primary mb-4 drop-shadow-lg">
                {current.title}
              </h1>

              <p className="font-inter text-lg md:text-xl text-gray-200 mb-8 leading-relaxed">
                {current.texts}
              </p>

              <div className="flex gap-4">
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
      <div className="">
        <h1 className="font-playfair text-4xl text-surface mx-20">Promoted</h1>
        <div className="flex flew-row gap-10 mx-25">
          {data?.promoted.map((auction) => (
            <AuctionCard key={auction.id} auction={auction} />
          ))}
        </div>
      </div>
      <div className="">
        <h1 className="font-playfair text-4xl text-surface mx-20">
          Most Popular
        </h1>
        <div className="flex flew-row gap-10 mx-25">
          {data?.trending.map((item, index) => (
            <AuctionCard key={index} auction={item.auction} />
          ))}
        </div>
      </div>
      <div>
        <h1 className="font-playfair text-4xl text-surface mx-20">
          Ending Soon
        </h1>
        <div className="flex flew-row gap-10 mx-25">
          {data?.latest.map((auction) => (
            <AuctionCard key={auction.id} auction={auction} />
          ))}
        </div>
      </div>
      <div>
        <h1 className="font-playfair text-4xl text-surface mx-20">
          Smartwatches
        </h1>
        <div className="flex flew-row gap-10 mx-25">
          {data?.smartwatches.map((auction) => (
            <AuctionCard key={auction.id} auction={auction} />
          ))}
        </div>
      </div>
      <div>
        <h1 className="font-playfair text-4xl text-surface mx-20">
          Wristwatches
        </h1>
        <div className="flex flew-row gap-10 mx-25">
          {data?.wristwatches.map((auction) => (
            <AuctionCard key={auction.id} auction={auction} />
          ))}
        </div>
      </div>
      <div>
        <h1 className="font-playfair text-4xl text-surface mx-20">
          Pocket Wathes
        </h1>
        <div className="flex flew-row gap-10 mx-25">
          {data?.pocketWatches.map((auction) => (
            <AuctionCard key={auction.id} auction={auction} />
          ))}
        </div>
      </div>
      <div>
        <h1 className="font-playfair text-4xl text-surface mx-20">Clocks</h1>
        <div className="flex flew-row gap-10 mx-25">
          {data?.clocks.map((auction) => (
            <AuctionCard key={auction.id} auction={auction} />
          ))}
        </div>
      </div>
    </main>
  );
}
