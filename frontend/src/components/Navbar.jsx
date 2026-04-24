import { useEffect, useState } from "react";
import { Link } from "react-router";

const Navbar = ({ variant = "dark" }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const isLight = variant === "light";

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 16);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 ${
        isLight
          ? isScrolled
            ? "border-b border-black/10 bg-[#f5f5f3]/90 backdrop-blur-xl"
            : "bg-[#f5f5f3]/70 backdrop-blur-md"
          : isScrolled
            ? "border-b border-white/10 bg-black/45 backdrop-blur-xl"
            : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 items-center justify-between px-5 sm:h-18 sm:px-8 lg:px-10">
        <button
          type="button"
          aria-label="Open menu"
          className={`group inline-flex h-10 w-10 items-center justify-center rounded-full border backdrop-blur-md transition-all duration-300 ${
            isLight
              ? "border-black/10 bg-white/50 text-black/80 hover:border-black/20 hover:bg-white"
              : "border-white/15 bg-white/5 text-white/90 hover:border-white/30 hover:bg-white/10"
          }`}
        >
          <span className="flex flex-col gap-1.5">
            <span className="block h-px w-4 bg-current transition-all duration-300 group-hover:w-5" />
            <span className="block h-px w-5 bg-current transition-all duration-300 group-hover:w-4" />
            <span className="block h-px w-3.5 bg-current transition-all duration-300 group-hover:w-4.5" />
          </span>
        </button>

        <div className="absolute left-1/2 -translate-x-1/2 text-center">
          <Link
            to="/"
            className={`text-sm font-medium uppercase tracking-[0.35em] transition-opacity duration-300 hover:opacity-80 sm:text-[0.95rem] ${
              isLight ? "text-black" : "text-white"
            }`}
          >
            Aveniq
          </Link>
        </div>

        <Link
          to="/register"
          aria-label="Go to register"
          className={`group inline-flex h-10 w-10 items-center justify-center rounded-full border backdrop-blur-md transition-all duration-300 ${
            isLight
              ? "border-black/10 bg-white/50 text-black/80 hover:border-black/20 hover:bg-white"
              : "border-white/15 bg-white/5 text-white/90 hover:border-white/30 hover:bg-white/10"
          }`}
        >
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M20 21a8 8 0 10-16 0"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
            <path
              d="M12 12a4 4 0 100-8 4 4 0 000 8z"
              stroke="currentColor"
              strokeWidth="1.6"
            />
          </svg>
        </Link>
      </div>
    </header>
  );
};

export default Navbar;