import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector, TypedUseSelectorHook } from "react-redux";
import {
  FaArrowLeft,
  FaEnvelope,
  FaEye,
  FaEyeSlash,
  FaLock,
  FaSignInAlt,
  FaTimes,
} from "react-icons/fa";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import toast from "react-hot-toast";
import { AnyAction } from "redux";
import { ThunkDispatch } from "redux-thunk";
import { loginUser } from "../redux/authThunks";
import type { RootState } from "../redux/store";
import { validateUser } from "../redux/validateThunk";

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

  const { isLoggingIn, isOtpVerified } = useTypedSelector(
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

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const resultAction = await dispatch(
      loginUser({
        email: formData.email.trim(),
        password: formData.password,
      })
    );

    const data = resultAction.payload as any;

    if (loginUser.fulfilled.match(resultAction)) {
      // ✔ If OTP not verified, send user to verification page
      if (!data.isOtpVerified) {
        toast("OTP sent. Please verify to activate your account.", {
          icon: "📩",
        });
        navigate("/verifyOtp");
        return;
      }

      // ✔ Normal login success
      toast.success("Welcome back!");
      navigate("/");
    } else {
      if (data?.detail) toast.error(data.detail);
      else toast.error("Login failed. Please check your credentials.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-6">
      <div className="max-w-md w-full">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-full bg-white text-gray-700 hover:bg-gray-200 hover:text-blue-600 transition-all duration-200 shadow-sm"
              type="button"
            >
              <FaArrowLeft size={16} />
            </button>
            <div className="p-2 bg-white rounded-full shadow-sm">
              <FaSignInAlt className="text-xl text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-serif text-gray-800 font-bold">
                Welcome Back
              </h1>
              <p className="text-gray-600 text-sm mt-1">
                Sign in to your Pine journal
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white shadow-lg overflow-hidden">
          <div className="h-1 bg-blue-600" />
          <div className="p-6">
          
            <div className="space-y-5">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-3 bg-gray-50 border rounded-lg text-sm ${
                      errors.email
                        ? "border-red-300 bg-red-50"
                        : "border-gray-300"
                    }`}
                    placeholder="Enter your email"
                  />
                  <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-700" />
                </div>
                {errors.email && (
                  <p className="text-sm text-red-600 mt-1">{errors.email}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-12 py-3 bg-gray-50 border rounded-lg text-sm ${
                      errors.password
                        ? "border-red-300 bg-red-50"
                        : "border-gray-300"
                    }`}
                    placeholder="Enter your password"
                  />
                  <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-700" />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-600 mt-1">{errors.password}</p>
                )}
              </div>

              <div className="flex justify-end">
                <NavLink
                  to="/reset_password"
                  className="text-sm text-blue-600 hover:underline"
                >
                  Forgot your password?
                </NavLink>
              </div>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={isLoggingIn}
                className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-white ${
                  isLoggingIn
                    ? "bg-blue-400"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {isLoggingIn ? (
                  <>
                    <AiOutlineLoading3Quarters
                      className="animate-spin"
                      size={16}
                    />
                    Signing In...
                  </>
                ) : (
                  <>
                    <FaSignInAlt />
                    Sign In
                  </>
                )}
              </button>
            </div>

            <div className="mt-6 text-center text-sm text-gray-600">
              Don't have an account?{" "}
              <NavLink
                to="/signup"
                className="text-blue-600 hover:underline font-medium"
              >
                Create account
              </NavLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
