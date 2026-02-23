import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { ThunkDispatch } from "redux-thunk";
import { AnyAction } from "redux";
import { signupUser } from "../redux/authThunks";
import type { RootState } from "../redux/store";
import pineLogo from "../assets/pine-transparent.png";

interface FormData {
  email: string;
  name: string;
  password: string;
  re_password: string;
}

interface Errors {
  email?: string;
  name?: string;
  password?: string;
  re_password?: string;
}

const Signup: React.FC = () => {
  const [form, setForm] = useState<FormData>({
    email: "",
    name: "",
    password: "",
    re_password: "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [strength, setStrength] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const dispatch: ThunkDispatch<RootState, unknown, AnyAction> = useDispatch();
  const navigate = useNavigate();
  const isSigningUp = useSelector(
    (state: RootState) => state.auth?.isSigningUp || false
  );

  // Password strength
  useEffect(() => {
    const pwd = form.password;
    let score = 0;
    if (pwd.length >= 8) score++;
    if (pwd.length >= 12) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    setStrength(score);
  }, [form.password]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof Errors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validate = (): boolean => {
    const err: Errors = {};

    if (!form.email.includes("@") || !form.email.includes(".")) {
      err.email = "Enter a valid email";
    }
    if (form.name.trim().length < 2) {
      err.name = "Name must be at least 2 characters";
    }
    if (form.password.length < 8) {
      err.password = "Password must be 8+ characters";
    } else if (!/[A-Z]/.test(form.password)) {
      err.password = "Include an uppercase letter";
    } else if (!/[0-9]/.test(form.password)) {
      err.password = "Include a number";
    }
    if (form.password !== form.re_password) {
      err.re_password = "Passwords don't match";
    }

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const result = await dispatch(
        signupUser({
          email: form.email.trim(),
          name: form.name.trim(),
          password: form.password,
          re_password: form.re_password,
          profile_picture: null,
          phone: null,
        })
      );

      if (signupUser.fulfilled.match(result)) {
        toast.success("Welcome to Pine! Account created.");
        navigate("/verifyOtp");
      } else {
        const data = result.payload as any;
        const msg =
          data?.detail ||
          (typeof data === "object"
            ? Object.values(data).flat().join(" ")
            : "") ||
          "Signup failed. Try again.";
        toast.error(msg);
      }
    } catch {
      toast.error("Network error. Please try again.");
    }
  };

  const strengthLabel =
    strength <= 2 ? "Weak" : strength <= 3 ? "Fair" : "Strong";
  const strengthColor =
    strength <= 2
      ? "rgb(var(--error))"
      : strength <= 3
        ? "rgb(var(--warning))"
        : "rgb(var(--success))";

  const inputClasses = (field: keyof Errors) =>
    `auth-input w-full px-3.5 py-2.5 rounded-lg text-sm bg-[rgb(var(--surface))] text-[rgb(var(--copy-primary))] outline-none border ${
      errors[field] ? "border-[rgb(var(--error))]" : "border-[rgb(var(--border))]"
    }`;

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
          Log in
        </NavLink>
      </header>

      {/* ── Content ── */}
      <div className="flex-1 flex items-center justify-center px-4 py-10 relative">
        {/* Radial glow */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(ellipse, rgba(var(--cta), .04) 0%, transparent 70%)" }}
        />

        <div className="relative z-10 w-full max-w-[340px]">
          {/* Logo */}
          <div className="auth-fade-1 flex justify-center mb-8">
            <img src={pineLogo} alt="" className="w-10 h-10" />
          </div>

          {/* Heading */}
          <h1 className="auth-fade-2 font-serif text-3xl font-bold text-center tracking-tight mb-2">
            Create your account
          </h1>
          <p className="auth-fade-2 text-sm text-center text-[rgb(var(--copy-secondary))] mb-10">
            Start your journaling journey with Pine
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
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                autoComplete="email"
                className={inputClasses("email")}
              />
              {errors.email && (
                <p className="text-xs mt-1.5 text-[rgb(var(--error))]">{errors.email}</p>
              )}
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-[rgb(var(--copy-secondary))] mb-1.5">
                Full name
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Jane Doe"
                autoComplete="name"
                className={inputClasses("name")}
              />
              {errors.name && (
                <p className="text-xs mt-1.5 text-[rgb(var(--error))]">{errors.name}</p>
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
                  value={form.password}
                  onChange={handleChange}
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                  className={`${inputClasses("password")} pr-14`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-medium text-[rgb(var(--copy-muted))] hover:text-[rgb(var(--copy-primary))] transition-colors cursor-pointer"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              {/* Strength bar */}
              {form.password && (
                <div className="mt-2">
                  <div className="h-1 rounded-full overflow-hidden bg-[rgb(var(--border))]">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${strength * 20}%`,
                        backgroundColor: strengthColor,
                      }}
                    />
                  </div>
                  <p className="text-[11px] mt-1 text-[rgb(var(--copy-muted))]">
                    {strengthLabel}
                  </p>
                </div>
              )}
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
                  type={showConfirm ? "text" : "password"}
                  name="re_password"
                  value={form.re_password}
                  onChange={handleChange}
                  placeholder="Re-enter your password"
                  autoComplete="new-password"
                  className={`${inputClasses("re_password")} pr-14`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((p) => !p)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-medium text-[rgb(var(--copy-muted))] hover:text-[rgb(var(--copy-primary))] transition-colors cursor-pointer"
                >
                  {showConfirm ? "Hide" : "Show"}
                </button>
              </div>
              {errors.re_password && (
                <p className="text-xs mt-1.5 text-[rgb(var(--error))]">{errors.re_password}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSigningUp}
              className="w-full py-2.5 rounded-lg text-sm font-medium bg-[rgb(var(--cta))] text-[rgb(var(--cta-text))] hover:bg-[rgb(var(--cta-active))] transition-all shadow-sm hover:shadow-md active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSigningUp ? "Creating account..." : "Create account"}
            </button>
          </form>

          {/* Sign in link */}
          <p className="auth-fade-4 text-center text-sm text-[rgb(var(--copy-secondary))] mt-8">
            Already have an account?{" "}
            <NavLink
              to="/login"
              className="font-medium text-[rgb(var(--cta))] hover:underline"
            >
              Sign in
            </NavLink>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
