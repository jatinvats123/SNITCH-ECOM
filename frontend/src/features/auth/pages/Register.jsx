import React, { useState } from 'react';
import {useAuth} from "../hook/useAuth";
import {useNavigate} from "react-router";
const Register = () => {
  const {handleRegister} = useAuth()
const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    contactNumber: '',
    email: '',
    password: '',
    isSeller: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await handleRegister({
      email:formData.email,
      contact:formData.contactNumber,
      password:formData.password,
      fullname:formData.fullName,
      isSeller:formData.isSeller,
    })
    navigate("/");
    // Add registration logic here
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
            Join <span className="text-[#FFD700] font-medium tracking-widest uppercase">Aveniq</span>
          </h1>
          <p className="text-[#d0c6ab] text-xs uppercase tracking-[0.2em]">The Digital Atelier</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          <div>
            <label className="block text-xs font-semibold text-[#d0c6ab] mb-2 uppercase tracking-wider" htmlFor="fullName">
              Full Name
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="John Doe"
              required
              className="w-full bg-[#0E0E0E]/80 backdrop-blur-sm border border-[#4D4732]/40 rounded-md px-4 py-3.5 text-[#e5e2e1] placeholder-[#d0c6ab]/40 focus:border-[#FFD700] focus:ring-1 focus:ring-[#FFD700] focus:outline-none transition-all duration-300"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#d0c6ab] mb-2 uppercase tracking-wider" htmlFor="contactNumber">
              Contact Number
            </label>
            <input
              type="tel"
              id="contactNumber"
              name="contactNumber"
              value={formData.contactNumber}
              onChange={handleChange}
              placeholder="+1 (555) 000-0000"
              required
              className="w-full bg-[#0E0E0E]/80 backdrop-blur-sm border border-[#4D4732]/40 rounded-md px-4 py-3.5 text-[#e5e2e1] placeholder-[#d0c6ab]/40 focus:border-[#FFD700] focus:ring-1 focus:ring-[#FFD700] focus:outline-none transition-all duration-300"
            />
          </div>

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
            <label className="block text-xs font-semibold text-[#d0c6ab] mb-2 uppercase tracking-wider" htmlFor="password">
              Password
            </label>
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

          <div className="pt-2 pb-4 space-y-3">
            <div className="flex items-center">
            <input
              type="checkbox"
              id="isSeller"
              name="isSeller"
              checked={formData.isSeller}
              onChange={handleChange}
              className="w-5 h-5 rounded border-[#4D4732] bg-[#0E0E0E]/80 text-[#FFD700] focus:ring-[#FFD700] focus:ring-offset-[#131313] focus:ring-2 cursor-pointer transition-colors duration-200"
            />
            <label htmlFor="isSeller" className="ml-3 text-sm text-[#d0c6ab] cursor-pointer select-none">
              Register as a Seller
            </label>
            </div>

            <a
              href="/api/auth/google"
              className="inline-flex items-center justify-center px-1 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#FFD700] transition-all hover:underline"
            >
              Continue with Google
            </a>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-br from-[#E9C400] to-[#FFD700] text-[#3A3000] font-bold uppercase tracking-wider text-sm py-4 rounded-md hover:from-[#FFD700] hover:to-[#FFE16D] transition-all duration-300 shadow-[0_4px_24px_-8px_rgba(255,215,0,0.5)] transform hover:-translate-y-0.5 active:translate-y-0"
          >
            Create Account
          </button>
        </form>

        <p className="mt-8 text-center text-xs text-[#d0c6ab]/70">
          Already have an account? <a href="/login" className="text-[#FFD700] hover:underline transition-all">Log in</a>
        </p>
      </div>
    </div>
  );
};

export default Register;
