import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaEnvelope,
  FaKey,
  FaCheck,
  FaTimes,
} from "react-icons/fa";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import toast from "react-hot-toast";
import { DJOSER_BACKEND_BASE_URL } from "../constants";

const RequestPasswordReset = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    // Clear error when user starts typing
    if (error) {
      setError("");
    }
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
          credentials: "include", // Required for CORS with credentials
          body: JSON.stringify({ email }),
        }
      );
      if (response.ok) {
        toast.success("Password reset link has been sent to your email.");
        setEmail(""); // Clear the input on success
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

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-6">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={handleBack}
              className="p-2 rounded-full bg-white text-gray-700 hover:bg-gray-200 hover:text-blue-600 transition-all duration-200 shadow-sm"
              aria-label="Go back"
              type="button"
            >
              <FaArrowLeft size={16} />
            </button>
            <div className="p-2 bg-white rounded-full shadow-sm">
              <FaKey className="text-xl text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-serif text-gray-800 font-bold">
                Reset Password
              </h1>
              <p className="text-gray-600 text-sm mt-1">
                Enter your email to receive a password reset link
              </p>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="rounded-2xl bg-white shadow-lg overflow-hidden">
          <div className="h-1 bg-blue-600" />
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              {/* Email Field */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Email Address
                </label>
                <div className="relative">
                  <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={email}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-3 bg-gray-50 border rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      error ? "border-red-300 bg-red-50" : "border-gray-300"
                    }`}
                    placeholder="Enter your email address"
                    autoComplete="email"
                    autoFocus
                    disabled={isSubmitting}
                    aria-describedby={error ? "email-error" : undefined}
                    aria-invalid={!!error}
                  />
                </div>
                {error && (
                  <p
                    id="email-error"
                    className="text-sm text-red-600 mt-1 flex items-center gap-1"
                  >
                    <FaTimes className="text-xs" />
                    {error}
                  </p>
                )}
              </div>

              {/* Success Message */}
              {success && (
                <div className="bg-green-50 border border-green-200 text-sm text-green-800 rounded-lg px-4 py-3">
                  <div className="flex items-start gap-2">
                    <FaCheck className="text-green-600 mt-0.5 flex-shrink-0" />
                    <p>{success}</p>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium rounded-lg text-white transition-all duration-200 ${
                  isSubmitting
                    ? "bg-blue-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-200"
                }`}
                aria-label={
                  isSubmitting ? "Sending reset link..." : "Send reset link"
                }
              >
                {isSubmitting ? (
                  <>
                    <AiOutlineLoading3Quarters
                      className="animate-spin"
                      size={16}
                    />
                    Sending...
                  </>
                ) : (
                  <>
                    <FaEnvelope className="text-xs" />
                    Send Reset Link
                  </>
                )}
              </button>
            </form>

            {/* Back to Login Link */}
            <div className="mt-6 text-center text-sm text-gray-600">
              Remember your password?{" "}
              <button
                onClick={() => navigate("/login")}
                className="text-blue-600 hover:text-blue-700 hover:underline transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
              >
                Back to login
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestPasswordReset;
