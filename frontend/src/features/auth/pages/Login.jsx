import React, { useState } from 'react';
import { useAuth } from "../hook/useAuth";
import { Link, useNavigate } from "react-router";
import ContinueWithGoogle from "../components/ContinueWithGoogle";
import Navbar from "../../../components/Navbar";
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
    <div className="min-h-screen bg-[#f5f5f3] text-black relative overflow-hidden font-sans">
      <Navbar variant="light" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(0,0,0,0.04),transparent_42%)]" />

      <main className="relative mx-auto flex min-h-screen max-w-7xl items-center justify-center px-6 pb-16 pt-28 sm:pt-32">
        <section className="w-full" style={{ maxWidth: 420 }}>
          <div className="mb-12 text-center">
            <h1 className="text-2xl font-light uppercase tracking-[0.28em] text-black sm:text-3xl">
              My Account
            </h1>
            <p className="mx-auto mt-4 max-w-sm text-sm leading-6 text-black/55">
              Sign in to continue your curated shopping experience.
            </p>
          </div>

        <form onSubmit={handleSubmit} className="space-y-6">
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
            <div className="mb-2 flex items-center justify-between">
              <label className="block text-[10px] font-medium uppercase tracking-[0.28em] text-black/55" htmlFor="password">
                Password
              </label>
              <a href="#" className="text-[11px] uppercase tracking-[0.22em] text-black/40 transition-all hover:text-black">
                Forgot your password?
              </a>
            </div>
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

          <button
            type="submit"
            className="mt-4 w-full border border-black bg-black py-4 text-[11px] font-medium uppercase tracking-[0.35em] text-white transition-all duration-300 hover:bg-white hover:text-black"
          >
            Log In
          </button>
          <ContinueWithGoogle />
        </form>

          <Link
            to="/register"
            className="mt-5 inline-flex w-full items-center justify-center border border-black/15 px-5 py-4 text-[11px] uppercase tracking-[0.28em] text-black transition-all duration-300 hover:bg-black hover:text-white"
          >
            Don&apos;t have an account? Create Account
          </Link>
        </section>
      </main>
    </div>
  );
};

export default Login;
