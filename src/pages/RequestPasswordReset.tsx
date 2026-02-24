import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { DJOSER_BACKEND_BASE_URL } from "../constants";
import pineLogo from "../assets/pine-transparent.png";

const RequestPasswordReset = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (error) setError("");
  };

  const validateEmail = (): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      setError("Email is required.");
      return false;
    } else if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateEmail()) return;

    setIsSubmitting(true);

    try {
      const response = await fetch(
        `${DJOSER_BACKEND_BASE_URL}/auth/users/reset_password/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ email }),
        }
      );
      if (response.ok) {
        toast.success("Reset link sent");
        setSent(true);
      } else {
        const data = await response.json();
        toast.error(data.email?.[0] || "Failed to send password reset link.");
      }
    } catch (err) {
      toast.error("An error occurred. Please check your connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[rgb(var(--background))] text-[rgb(var(--copy-primary))]">
      {/* ── Nav ── */}
      <header className="flex items-center justify-between px-6 lg:px-16 h-14 border-b border-[rgb(var(--border))]">
        <NavLink to="/" className="flex items-center gap-2">
          <img src={pineLogo} alt="Pine" className="w-6 h-6" />
          <span className="font-serif text-[15px] font-bold">Pine</span>
        </NavLink>
        <NavLink
          to="/login"
          className="text-sm text-[rgb(var(--copy-secondary))] hover:text-[rgb(var(--copy-primary))] transition-colors"
        >
          Back to login
        </NavLink>
      </header>

      {/* ── Content ── */}
      <div className="flex-1 flex items-center justify-center px-4 relative">
        {/* Radial glow */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[400px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(ellipse, rgba(var(--cta), .04) 0%, transparent 70%)" }}
        />

        <div className="relative z-10 w-full max-w-[340px]">
          {/* Logo */}
          <div className="auth-fade-1 flex justify-center mb-8">
            <img src={pineLogo} alt="" className="w-10 h-10" />
          </div>

          {sent ? (
            /* ── Success state ── */
            <div className="text-center">
              <div className="auth-fade-2 w-12 h-12 mx-auto mb-5 rounded-full bg-[rgb(var(--surface))] border border-[rgb(var(--border))] flex items-center justify-center text-xl">
                &#x2709;
              </div>
              <h1 className="auth-fade-2 font-serif text-3xl font-bold tracking-tight mb-2">
                Check your email
              </h1>
              <p className="auth-fade-3 text-sm text-[rgb(var(--copy-secondary))] mb-8 leading-relaxed">
                We sent a password reset link to{" "}
                <span className="font-medium text-[rgb(var(--copy-primary))]">{email}</span>.
                <br />
                It may take a minute to arrive.
              </p>
              <button
                onClick={() => navigate("/login")}
                className="auth-fade-4 w-full py-2.5 rounded-lg text-sm font-medium bg-[rgb(var(--cta))] text-[rgb(var(--cta-text))] hover:bg-[rgb(var(--cta-active))] transition-all shadow-sm hover:shadow-md active:scale-[0.98] cursor-pointer"
              >
                Back to login
              </button>
            </div>
          ) : (
            /* ── Form state ── */
            <>
              <h1 className="auth-fade-2 font-serif text-3xl font-bold text-center tracking-tight mb-2">
                Reset your password
              </h1>
              <p className="auth-fade-2 text-sm text-center text-[rgb(var(--copy-secondary))] mb-10">
                Enter your email and we'll send you a reset link
              </p>

              <form onSubmit={handleSubmit} noValidate className="auth-fade-3 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--copy-secondary))] mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    autoComplete="email"
                    autoFocus
                    disabled={isSubmitting}
                    className={`auth-input w-full px-3.5 py-2.5 rounded-lg text-sm bg-[rgb(var(--surface))] text-[rgb(var(--copy-primary))] outline-none border ${
                      error ? "border-[rgb(var(--error))]" : "border-[rgb(var(--border))]"
                    } disabled:opacity-60`}
                  />
                  {error && (
                    <p className="text-xs mt-1.5 text-[rgb(var(--error))]">{error}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 rounded-lg text-sm font-medium bg-[rgb(var(--cta))] text-[rgb(var(--cta-text))] hover:bg-[rgb(var(--cta-active))] transition-all shadow-sm hover:shadow-md active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isSubmitting ? "Sending..." : "Send reset link"}
                </button>
              </form>

              <p className="auth-fade-4 text-center text-sm text-[rgb(var(--copy-muted))] mt-8">
                <NavLink
                  to="/login"
                  className="text-[rgb(var(--copy-secondary))] hover:text-[rgb(var(--copy-primary))] transition-colors"
                >
                  &larr; Back to login
                </NavLink>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RequestPasswordReset;
