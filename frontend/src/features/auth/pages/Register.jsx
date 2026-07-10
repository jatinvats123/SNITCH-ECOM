import React, { useState } from 'react';
import {useAuth} from "../hook/useAuth";
import { Link, useNavigate } from "react-router";
import ContinueWithGoogle from "../components/ContinueWithGoogle";
import Navbar from "../../../components/Navbar";
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
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await handleRegister({
        email:formData.email,
        contact:formData.contactNumber,
        password:formData.password,
        fullname:formData.fullName,
        isSeller:formData.isSeller,
      })
      navigate("/");
    } catch (err) {
      setError(err?.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f3] text-black relative overflow-hidden font-sans">
      <Navbar variant="light" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(0,0,0,0.04),transparent_42%)]" />

      <main className="relative mx-auto flex min-h-screen max-w-7xl items-center justify-center px-6 pb-16 pt-28 sm:pt-32">
        <section className="w-full" style={{ maxWidth: 420 }}>
          <div className="mb-12 text-center">
            <h1 className="mt-4 text-2xl font-light uppercase tracking-[0.28em] text-black sm:text-3xl">
              Create Account
            </h1>
            <p className="mx-auto mt-4 max-w-sm text-sm leading-6 text-black/55">
              Join the collection with a refined and minimal experience.
            </p>
          </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="mb-2 block text-[10px] font-medium uppercase tracking-[0.28em] text-black/55" htmlFor="fullName">
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
              className="w-full border-0 border-b border-black/15 bg-transparent px-0 py-3 text-[15px] text-black placeholder:text-black/30 transition-all duration-300 focus:border-black focus:outline-none focus:ring-0"
            />
          </div>

          <div>
            <label className="mb-2 block text-[10px] font-medium uppercase tracking-[0.28em] text-black/55" htmlFor="contactNumber">
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
              className="w-full border-0 border-b border-black/15 bg-transparent px-0 py-3 text-[15px] text-black placeholder:text-black/30 transition-all duration-300 focus:border-black focus:outline-none focus:ring-0"
            />
          </div>

          <div>
            <label className="mb-2 block text-[10px] font-medium uppercase tracking-[0.28em] text-black/55" htmlFor="email">
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
              className="w-full border-0 border-b border-black/15 bg-transparent px-0 py-3 text-[15px] text-black placeholder:text-black/30 transition-all duration-300 focus:border-black focus:outline-none focus:ring-0"
            />
          </div>

          <div>
            <label className="mb-2 block text-[10px] font-medium uppercase tracking-[0.28em] text-black/55" htmlFor="password">
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
              className="w-full border-0 border-b border-black/15 bg-transparent px-0 py-3 text-[15px] text-black placeholder:text-black/30 transition-all duration-300 focus:border-black focus:outline-none focus:ring-0"
            />
          </div>

          <div className="pt-1 pb-2">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isSeller"
                name="isSeller"
                checked={formData.isSeller}
                onChange={handleChange}
                className="h-5 w-5 rounded border-black/20 bg-transparent text-black focus:ring-black/70 focus:ring-offset-0"
              />
              <label htmlFor="isSeller" className="cursor-pointer select-none text-sm text-black/70">
                Register as a Seller
              </label>
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="group w-full border border-black bg-black py-4 text-[11px] font-medium uppercase tracking-[0.35em] text-white transition-all duration-300 hover:bg-white hover:text-black disabled:opacity-50"
          >
            {isSubmitting ? "Creating Account..." : "Create Account"}
          </button>

          <ContinueWithGoogle />
        </form>

          <Link
            to="/login"
            className="mt-5 inline-flex w-full items-center justify-center border border-black/15 px-5 py-4 text-[11px] uppercase tracking-[0.28em] text-black transition-all duration-300 hover:bg-black hover:text-white"
          >
            Already have an account? Log in
          </Link>
        </section>
      </main>
    </div>
  );
};

export default Register;
