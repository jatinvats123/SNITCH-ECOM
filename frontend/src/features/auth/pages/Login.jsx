import React, { useState } from 'react';
import { useAuth } from "../hook/useAuth";
import { useNavigate } from "react-router";
import ContinueWithGoogle from "../components/ContinueWithGoogle";
const Login = () => {
  const { handleLogin } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await handleLogin({
      email: formData.email,
      password: formData.password,
    });
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center lg:justify-end lg:pr-[12%] font-sans text-[#e5e2e1] relative overflow-hidden">
      {/* Full Screen Background Image */}
      <img 
        src="/register-bg.png" 
        alt="High fashion background" 
        className="absolute inset-0 w-full h-full object-cover object-top mix-blend-luminosity opacity-40 z-0"
      />
      {/* Gradient Overlays for moody effect */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#131313] via-transparent to-[#131313] z-0 opacity-80"></div>
      <div className="absolute inset-0 bg-[#FFD700] mix-blend-overlay opacity-10 z-0"></div>
      
      {/* Form Container - Centered Overlay */}
      <div className="w-full max-w-md bg-[#1C1B1B]/70 backdrop-blur-2xl rounded-2xl p-10 shadow-2xl relative z-10 border border-[#4D4732]/30 m-6">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-[#FFD700] opacity-[0.05] blur-[80px] pointer-events-none"></div>
        
        <div className="mb-8 text-center relative z-10">
          <h1 className="text-3xl font-light tracking-tight mb-1">
            Welcome to <span className="text-[#FFD700] font-medium tracking-widest uppercase">Aveniq</span>
          </h1>
          <p className="text-[#d0c6ab] text-xs uppercase tracking-[0.2em]">The Digital Atelier</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          <div>
            <label className="block text-xs font-semibold text-[#d0c6ab] mb-2 uppercase tracking-wider" htmlFor="email">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="name@example.com"
              required
              className="w-full bg-[#0E0E0E]/80 backdrop-blur-sm border border-[#4D4732]/40 rounded-md px-4 py-3.5 text-[#e5e2e1] placeholder-[#d0c6ab]/40 focus:border-[#FFD700] focus:ring-1 focus:ring-[#FFD700] focus:outline-none transition-all duration-300"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-[#d0c6ab] uppercase tracking-wider" htmlFor="password">
                Password
              </label>
              <a href="#" className="text-xs text-[#FFD700] hover:underline transition-all">Forgot your password?</a>
            </div>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
              className="w-full bg-[#0E0E0E]/80 backdrop-blur-sm border border-[#4D4732]/40 rounded-md px-4 py-3.5 text-[#e5e2e1] placeholder-[#d0c6ab]/40 focus:border-[#FFD700] focus:ring-1 focus:ring-[#FFD700] focus:outline-none transition-all duration-300"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-br from-[#E9C400] to-[#FFD700] text-[#3A3000] font-bold uppercase tracking-wider text-sm py-4 rounded-md hover:from-[#FFD700] hover:to-[#FFE16D] transition-all duration-300 shadow-[0_4px_24px_-8px_rgba(255,215,0,0.5)] transform hover:-translate-y-0.5 active:translate-y-0 mt-4"
          >
            Log In
          </button>
          <ContinueWithGoogle />
        </form>

        <p className="mt-8 text-center text-xs text-[#d0c6ab]/70">
          Don't have an account? <a href="/register" className="text-[#FFD700] hover:underline transition-all">Create Account</a>
        </p>
      </div>
    </div>
  );
};

export default Login;
