import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { ThunkDispatch } from "redux-thunk";
import { AnyAction } from "redux";

import { signupUser } from "../redux/authThunks";
import type { RootState } from "../redux/store";

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

  const dispatch: ThunkDispatch<RootState, unknown, AnyAction> = useDispatch();
  const navigate = useNavigate();
  const isSigningUp = useSelector((state: RootState) => state.auth?.isSigningUp || false);

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
          (typeof data === "object" ? Object.values(data).flat().join(" ") : "") ||
          "Signup failed. Try again.";
        toast.error(msg);
      }
    } catch {
      toast.error("Network error. Please try again.");
    }
  };

  const strengthColor = strength <= 2 ? "bg-red-500" : strength <= 3 ? "bg-yellow-500" : "bg-green-500";
  const strengthLabel = strength <= 2 ? "Weak" : strength <= 3 ? "Fair" : "Strong";

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-light text-gray-800">Join Pine</h1>
          <p className="text-sm text-gray-600 mt-1">Start your journaling journey</p>
        </div>

        {/* Form Card */}
        <form
          onSubmit={handleSubmit}
          className="bg-white p-8 rounded-xl shadow-sm space-y-5"
        >
          {/* Email */}
          <div>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Email"
              className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                errors.email ? "border-red-400" : "border-gray-300"
              }`}
            />
            {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
          </div>

          {/* Name */}
          <div>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Full Name"
              className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                errors.name ? "border-red-400" : "border-gray-300"
              }`}
            />
            {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
          </div>

          {/* Password */}
          <div>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Password"
              className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                errors.password ? "border-red-400" : "border-gray-300"
              }`}
            />
            {form.password && (
              <div className="mt-2">
                <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${strengthColor}`}
                    style={{ width: `${strength * 20}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Strength: {strengthLabel}</p>
              </div>
            )}
            {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password}</p>}
          </div>

          {/* Confirm Password */}
          <div>
            <input
              type="password"
              name="re_password"
              value={form.re_password}
              onChange={handleChange}
              placeholder="Confirm Password"
              className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                errors.re_password ? "border-red-400" : "border-gray-300"
              }`}
            />
            {errors.re_password && (
              <p className="text-xs text-red-600 mt-1">{errors.re_password}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSigningUp}
            className={`w-full py-2.5 rounded-lg text-white font-medium text-sm transition-all ${
              isSigningUp
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 active:scale-[0.98]"
            }`}
          >
            {isSigningUp ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        {/* Login Link */}
        <p className="text-center mt-6 text-sm text-gray-600">
          Already have an account?{" "}
          <NavLink
            to="/login"
            className="text-blue-600 hover:text-blue-700 hover:underline font-medium"
          >
            Sign in
          </NavLink>
        </p>
      </div>
    </div>
  );
};

export default Signup;