import React, { useState } from "react";
import { useAuth } from "../hook/useAuth";
import { Link, useNavigate, useParams } from "react-router";
import Navbar from "../../../components/Navbar";

const ResetPassword = () => {
  const { handleResetPassword } = useAuth();
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    setIsSubmitting(true);
    try {
      await handleResetPassword(token, password);
      navigate("/login");
    } catch (err) {
      setError(err?.response?.data?.message || "This reset link is invalid or has expired.");
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
              Set New Password
            </h1>
            <p className="mx-auto mt-4 max-w-sm text-sm leading-6 text-black/55">
              Choose a new password for your account.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                className="mb-2 block text-[10px] font-medium uppercase tracking-[0.28em] text-black/55"
                htmlFor="password"
              >
                New Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={8}
                className="w-full border-0 border-b border-black/15 bg-transparent px-0 py-3 text-[15px] text-black placeholder:text-black/30 transition-all duration-300 focus:border-black focus:outline-none focus:ring-0"
              />
            </div>

            <div>
              <label
                className="mb-2 block text-[10px] font-medium uppercase tracking-[0.28em] text-black/55"
                htmlFor="confirmPassword"
              >
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={8}
                className="w-full border-0 border-b border-black/15 bg-transparent px-0 py-3 text-[15px] text-black placeholder:text-black/30 transition-all duration-300 focus:border-black focus:outline-none focus:ring-0"
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-4 w-full border border-black bg-black py-4 text-[11px] font-medium uppercase tracking-[0.35em] text-white transition-all duration-300 hover:bg-white hover:text-black disabled:opacity-50"
            >
              {isSubmitting ? "Resetting..." : "Reset Password"}
            </button>
          </form>

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

export default ResetPassword;
