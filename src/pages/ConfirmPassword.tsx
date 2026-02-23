import React, { useState } from "react";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { DJOSER_BACKEND_BASE_URL } from "../constants";
import pineLogo from "../assets/pine-transparent.png";

interface FormData {
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  password?: string;
  confirmPassword?: string;
}

const ResetPassword = () => {
  const navigate = useNavigate();
  const { uid, token } = useParams<{ uid: string; token: string }>();
  const [formData, setFormData] = useState<FormData>({
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.password) {
      newErrors.password = "Password is required.";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters long.";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password.";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      Object.values(newErrors).forEach((error) => toast.error(error));
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    if (!uid || !token) {
      toast.error("Invalid reset link. Please request a new password reset.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(
        `${DJOSER_BACKEND_BASE_URL}/auth/users/reset_password_confirm/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            uid,
            token,
            new_password: formData.password,
            re_new_password: formData.confirmPassword,
          }),
        }
      );

      if (response.ok) {
        toast.success("Your password has been updated!");
        setFormData({ password: "", confirmPassword: "" });
        setTimeout(() => navigate("/login"), 3000);
      } else {
        const data = await response.json();
        const errorMsg =
          data.new_password?.[0] ||
          data.uid?.[0] ||
          data.token?.[0] ||
          "Failed to reset password.";
        toast.error(errorMsg);
      }
    } catch (err) {
      toast.error("An error occurred. Please check your connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClasses = (hasError: boolean) =>
    `auth-input w-full px-3.5 py-2.5 pr-14 rounded-lg text-sm bg-[rgb(var(--surface))] text-[rgb(var(--copy-primary))] outline-none border ${
      hasError ? "border-[rgb(var(--error))]" : "border-[rgb(var(--border))]"
    } disabled:opacity-60`;

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

          {/* Heading */}
          <h1 className="auth-fade-2 font-serif text-3xl font-bold text-center tracking-tight mb-2">
            Set new password
          </h1>
          <p className="auth-fade-2 text-sm text-center text-[rgb(var(--copy-secondary))] mb-10">
            Choose a strong password for your account
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate className="auth-fade-3 space-y-4">
            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-[rgb(var(--copy-secondary))] mb-1.5">
                New password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                  autoFocus
                  disabled={isSubmitting}
                  className={inputClasses(!!errors.password)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-medium text-[rgb(var(--copy-muted))] hover:text-[rgb(var(--copy-primary))] transition-colors cursor-pointer"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs mt-1.5 text-[rgb(var(--error))]">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-[rgb(var(--copy-secondary))] mb-1.5">
                Confirm password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter your password"
                  autoComplete="new-password"
                  disabled={isSubmitting}
                  className={inputClasses(!!errors.confirmPassword)}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-medium text-[rgb(var(--copy-muted))] hover:text-[rgb(var(--copy-primary))] transition-colors cursor-pointer"
                >
                  {showConfirmPassword ? "Hide" : "Show"}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-xs mt-1.5 text-[rgb(var(--error))]">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-lg text-sm font-medium bg-[rgb(var(--cta))] text-[rgb(var(--cta-text))] hover:bg-[rgb(var(--cta-active))] transition-all shadow-sm hover:shadow-md active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSubmitting ? "Updating..." : "Update password"}
            </button>
          </form>

          {/* Back to login */}
          <p className="auth-fade-4 text-center text-sm text-[rgb(var(--copy-muted))] mt-8">
            <NavLink
              to="/login"
              className="text-[rgb(var(--copy-secondary))] hover:text-[rgb(var(--copy-primary))] transition-colors"
            >
              &larr; Back to login
            </NavLink>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
