import React, { useState } from 'react';
import { useAuth } from "../hook/useAuth";
import { Link } from "react-router";
import Navbar from "../../../components/Navbar";

const ForgotPassword = () => {
  const { handleForgotPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState(null);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const data = await handleForgotPassword(email);
      setStatus('success');
      setMessage(data.message);
    } catch (error) {
      setStatus('error');
      setMessage(error?.response?.data?.message || "Something went wrong. Please try again.");
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
            <h1 className="text-2xl font-light uppercase tracking-[0.28em] text-black sm:text-3xl">
              Reset Password
            </h1>
            <p className="mx-auto mt-4 max-w-sm text-sm leading-6 text-black/55">
              Enter your email and we'll send you a link to reset your password.
            </p>
          </div>

          {status === 'success' ? (
            <div className="border border-black/15 px-5 py-4 text-center text-sm text-black/70">
              {message}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="mb-2 block text-[10px] font-medium uppercase tracking-[0.28em] text-black/55" htmlFor="email">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full border-0 border-b border-black/15 bg-transparent px-0 py-3 text-[15px] text-black placeholder:text-black/30 transition-all duration-300 focus:border-black focus:outline-none focus:ring-0"
                />
              </div>

              {status === 'error' && (
                <p className="text-sm text-red-600">{message}</p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-4 w-full border border-black bg-black py-4 text-[11px] font-medium uppercase tracking-[0.35em] text-white transition-all duration-300 hover:bg-white hover:text-black disabled:opacity-50"
              >
                {isSubmitting ? "Sending..." : "Send Reset Link"}
              </button>
            </form>
          )}

          <Link
            to="/login"
            className="mt-5 inline-flex w-full items-center justify-center border border-black/15 px-5 py-4 text-[11px] uppercase tracking-[0.28em] text-black transition-all duration-300 hover:bg-black hover:text-white"
          >
            Back to Login
          </Link>
        </section>
      </main>
    </div>
  );
};

export default ForgotPassword;
