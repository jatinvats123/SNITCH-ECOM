import React from "react";

const ContinueWithGoogle = () => {
  return (
    <a
      href="/api/auth/google"
      className="mt-4 flex w-full items-center justify-center gap-3 rounded-full border border-[#dadce0] bg-white px-5 py-3 text-sm font-medium text-[#3c4043] shadow-sm transition-all duration-200 hover:bg-[#f8f9fa] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#1a73e8] focus:ring-offset-2 focus:ring-offset-transparent"
    >
      <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true" focusable="false">
        <path
          fill="#EA4335"
          d="M24 9.5c3.54 0 6.72 1.22 9.22 3.6l6.9-6.9C35.89 2.68 30.42 0 24 0 14.62 0 6.51 5.38 2.56 13.22l8.04 6.25C12.6 13.32 17.73 9.5 24 9.5z"
        />
        <path
          fill="#4285F4"
          d="M46.5 24.55c0-1.58-.14-3.1-.4-4.55H24v8.63h12.7c-.55 2.98-2.25 5.5-4.82 7.18l7.37 5.72C44.02 36.38 46.5 30.97 46.5 24.55z"
        />
        <path
          fill="#FBBC05"
          d="M10.6 28.47A14.48 14.48 0 0 1 9.5 24c0-1.56.27-3.08.76-4.47L2.22 13.28A23.98 23.98 0 0 0 0 24c0 3.86.92 7.5 2.56 10.72l8.04-6.25z"
        />
        <path
          fill="#34A853"
          d="M24 48c6.42 0 11.81-2.13 15.75-5.78l-7.37-5.72c-2.05 1.38-4.67 2.2-8.38 2.2-6.27 0-11.4-3.82-13.4-9.03l-8.04 6.25C6.51 42.62 14.62 48 24 48z"
        />
      </svg>
      <span>Continue with Google</span>
    </a>
  );
};

export default ContinueWithGoogle;
