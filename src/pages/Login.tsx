import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector, TypedUseSelectorHook } from "react-redux";
import toast from "react-hot-toast";
import { AnyAction } from "redux";
import { ThunkDispatch } from "redux-thunk";
import { loginUser } from "../redux/authThunks";
import type { RootState } from "../redux/store";
import pineLogo from "../assets/pine-transparent.png";

interface FormData {
  email: string;
  password: string;
}
interface FormErrors {
  email?: string;
  password?: string;
}

type AppDispatch = ThunkDispatch<RootState, unknown, AnyAction>;
const useTypedSelector: TypedUseSelectorHook<RootState> = useSelector;

const Login: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();

  const { isLoggingIn } = useTypedSelector(
    (state: RootState) => state.auth
  );

  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: FormErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.email.trim()) newErrors.email = "Email is required.";
    else if (!emailRegex.test(formData.email))
      newErrors.email = "Please enter a valid email address.";

    if (!formData.password) newErrors.password = "Password is required.";
    else if (formData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const resultAction = await dispatch(
      loginUser({
        email: formData.email.trim(),
        password: formData.password,
      })
    );

    const data = resultAction.payload as any;

    if (loginUser.fulfilled.match(resultAction)) {
      if (!data.isOtpVerified) {
      toast("OTP sent — check your email");
        navigate("/verifyOtp");
        return;
      }

      toast.success("Welcome back!");
      navigate("/");
    } else {
      if (data?.detail) toast.error(data.detail);
      else toast.error("Login failed. Please check your credentials.");
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
          to="/signup"
          className="text-sm text-[rgb(var(--copy-secondary))] hover:text-[rgb(var(--copy-primary))] transition-colors"
        >
          Create account
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
            Welcome back
          </h1>
          <p className="auth-fade-2 text-sm text-center text-[rgb(var(--copy-secondary))] mb-10">
            Sign in to continue to Pine
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate className="auth-fade-3 space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-[rgb(var(--copy-secondary))] mb-1.5">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                autoComplete="email"
                className={`auth-input w-full px-3.5 py-2.5 rounded-lg text-sm bg-[rgb(var(--surface))] text-[rgb(var(--copy-primary))] outline-none border ${
                  errors.email ? "border-[rgb(var(--error))]" : "border-[rgb(var(--border))]"
                }`}
              />
              {errors.email && (
                <p className="text-xs mt-1.5 text-[rgb(var(--error))]">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-[rgb(var(--copy-secondary))] mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className={`auth-input w-full px-3.5 py-2.5 pr-14 rounded-lg text-sm bg-[rgb(var(--surface))] text-[rgb(var(--copy-primary))] outline-none border ${
                    errors.password ? "border-[rgb(var(--error))]" : "border-[rgb(var(--border))]"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-medium text-[rgb(var(--copy-muted))] hover:text-[rgb(var(--copy-primary))] transition-colors cursor-pointer"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs mt-1.5 text-[rgb(var(--error))]">{errors.password}</p>
              )}
            </div>

            {/* Forgot password */}
            <div className="flex justify-end">
              <NavLink
                to="/reset_password"
                className="text-sm text-[rgb(var(--copy-muted))] hover:text-[rgb(var(--copy-primary))] transition-colors"
              >
                Forgot password?
              </NavLink>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-2.5 rounded-lg text-sm font-medium bg-[rgb(var(--cta))] text-[rgb(var(--cta-text))] hover:bg-[rgb(var(--cta-active))] transition-all shadow-sm hover:shadow-md active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoggingIn ? "Signing in..." : "Continue"}
            </button>
          </form>

          {/* Sign up link */}
          <p className="auth-fade-4 text-center text-sm text-[rgb(var(--copy-secondary))] mt-8">
            Don't have an account?{" "}
            <NavLink
              to="/signup"
              className="font-medium text-[rgb(var(--cta))] hover:underline"
            >
              Get started free
            </NavLink>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
