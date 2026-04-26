import { useEffect, useState } from "react";
import { Link } from "react-router";

const Navbar = ({ variant = "dark", animatedBrand = false }) => {
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
          className={`group inline-flex h-10 w-10 items-center justify-center rounded-full backdrop-blur-md transition-all duration-300 ${
            isLight
              ? "text-black/80"
              : "text-white/90"
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
            className="relative flex items-center justify-center"
            aria-label="Aveniq home"
          >
            {animatedBrand ? (
              <>
                <span
                  className={`text-sm font-medium uppercase tracking-[0.35em] transition-all duration-300 sm:text-[0.95rem] ${
                    isLight ? "text-black" : "text-white"
                  } ${isScrolled ? "pointer-events-none scale-90 opacity-0" : "scale-100 opacity-100"}`}
                >
                  Aveniq
                </span>

                <span
                  className={`absolute inline-flex items-center justify-center transition-all duration-300 ${
                    isLight ? "text-black" : "text-white"
                  } ${isScrolled ? "scale-100 opacity-100" : "pointer-events-none scale-90 opacity-0"}`}
                >
                  <svg width="38" height="38" viewBox="0 0 42 42" fill="none" aria-hidden="true">
                    <path d="M12.5 30.5L21 10L29.5 30.5" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M16.2 24H25.8" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" />
                    <path d="M29.2 18.2C31.3 16.5 33.3 15.8 34.9 15.8C34.6 17.8 33.6 20 31.7 21.9C29.8 23.9 27.9 25 26.3 25.3C26.1 23.7 27 20.9 29.2 18.2Z" fill="currentColor" opacity="0.96" />
                    <path d="M29.7 24.9C31.8 24.7 33.6 25.2 34.8 26.1C33.7 27.4 31.8 28.5 29.5 28.9C27.4 29.2 25.7 28.8 24.5 28.1C25.2 27 26.7 25.5 29.7 24.9Z" fill="currentColor" opacity="0.78" />
                    <path d="M14.4 16.2C15.8 15.1 17.4 14.4 19.1 14.2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" opacity="0.7" />
                    <path d="M31.2 11.7C31.4 13.4 31 15 30 16.6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" opacity="0.7" />
                  </svg>
                </span>
              </>
            ) : (
              <span
                className={`text-sm font-medium uppercase tracking-[0.35em] sm:text-[0.95rem] ${
                  isLight ? "text-black" : "text-white"
                }`}
              >
                Aveniq
              </span>
            )}
          </Link>
        </div>

        <Link
          to="/register"
          aria-label="Go to register"
          className={`group inline-flex h-10 w-10 items-center justify-center rounded-full backdrop-blur-md transition-all duration-300 ${
            isLight
              ? "text-black/80"
              : "text-white/90"
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