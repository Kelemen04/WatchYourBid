export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-stone-900 border-t border-stone-800 py-6 mt-auto">
      <div className="max-w-[1400px] mx-auto px-4 md:px-10 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <img
            src="/images/WatchYourBid1.png"
            alt="Logo"
            className="w-8 h-8 rounded-full object-cover opacity-90"
          />
          <span className="font-playfair text-primary font-bold text-lg tracking-wide">
            WatchYourBid
          </span>
        </div>

        <p className="text-stone-400 text-[11px] font-inter uppercase tracking-widest text-center md:text-right font-medium">
          Premium Luxury Auctions &copy; {currentYear}
        </p>
      </div>
    </footer>
  );
}
