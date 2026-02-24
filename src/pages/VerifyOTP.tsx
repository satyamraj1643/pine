import React, { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AnyAction } from "redux";
import toast from "react-hot-toast";
import { ThunkDispatch } from "redux-thunk";

import { verifyOTP } from "../redux/authThunks";
import type { RootState } from "../redux/store";
import pineLogo from "../assets/pine-transparent.png";

const VerifyOTP: React.FC = () => {
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const dispatch: ThunkDispatch<RootState, unknown, AnyAction> = useDispatch();
  const navigate = useNavigate();

  const { email, isOtpVerifying } = useSelector(
    (state: RootState) => state.auth
  );

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const newOtp = pasted.padEnd(6, "").split("").slice(0, 6);
    setOtp(newOtp);

    const nextEmpty = newOtp.findIndex((d) => !d);
    inputRefs.current[nextEmpty === -1 ? 5 : nextEmpty]?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const code = otp.join("");
    if (code.length !== 6) {
      toast.error("Please enter all 6 digits");
      return;
    }

    const result = await dispatch(verifyOTP({ email, otp: code }));

    if (verifyOTP.fulfilled.match(result)) {
      toast.success("Email verified");
      navigate("/login");
    } else {
      const msg = result.payload as { detail?: string } | undefined;
      toast.error(msg?.detail || "Invalid or expired OTP");

      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    }
  };

  const isComplete = otp.join("").length === 6;

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

        <div className="relative z-10 w-full max-w-[380px]">
          {/* Logo */}
          <div className="auth-fade-1 flex justify-center mb-8">
            <img src={pineLogo} alt="" className="w-10 h-10" />
          </div>

          {/* Heading */}
          <h1 className="auth-fade-2 font-serif text-3xl font-bold text-center tracking-tight mb-2">
            Verify your email
          </h1>
          <p className="auth-fade-2 text-sm text-center text-[rgb(var(--copy-secondary))] mb-10">
            We sent a 6-digit code to{" "}
            <span className="font-medium text-[rgb(var(--copy-primary))]">{email}</span>
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="auth-fade-3">
            {/* OTP inputs */}
            <div className="flex justify-center gap-3 mb-8">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  onPaste={i === 0 ? handlePaste : undefined}
                  ref={(el: HTMLInputElement | null) => {
                    if (el) inputRefs.current[i] = el;
                  }}
                  className={`auth-input w-12 h-13 text-center text-lg font-medium rounded-lg outline-none bg-[rgb(var(--surface))] text-[rgb(var(--copy-primary))] border ${
                    digit ? "border-[rgb(var(--cta))]" : "border-[rgb(var(--border))]"
                  }`}
                />
              ))}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isOtpVerifying || !isComplete}
              className="w-full py-2.5 rounded-lg text-sm font-medium bg-[rgb(var(--cta))] text-[rgb(var(--cta-text))] hover:bg-[rgb(var(--cta-active))] transition-all shadow-sm hover:shadow-md active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isOtpVerifying ? "Verifying..." : "Verify"}
            </button>
          </form>

          {/* Help text */}
          <p className="auth-fade-4 text-center text-sm text-[rgb(var(--copy-muted))] mt-8">
            Didn't receive a code? Check your spam folder.
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;
