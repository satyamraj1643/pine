import React, { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AnyAction } from "redux";
import toast from "react-hot-toast";
import { ThunkDispatch } from "redux-thunk";

import { verifyOTP } from "../redux/authThunks";
import type { RootState } from "../redux/store";

const VerifyOTP: React.FC = () => {
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const dispatch: ThunkDispatch<RootState, unknown, AnyAction> = useDispatch();
  const navigate = useNavigate();

  const { name, email, isOtpVerifying } = useSelector(
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
      toast.success("Email verified!");
      navigate("/login");
    } else {
      const msg = result.payload as { detail?: string } | undefined;
      toast.error(msg?.detail || "Invalid or expired OTP");

      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        
        <div className="text-center mb-8">
          <h1 className="text-2xl font-light text-gray-800">
            Welcome {name || "there"}!
          </h1>
          <p className="text-sm text-gray-600 mt-2">
            We just sent a 6-digit code to
            <span className="font-medium text-gray-800"> {email}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-sm space-y-6">
          <div className="flex justify-center gap-2">
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
                ref={(el) => (inputRefs.current[i] = el)}
                className={`
                  w-12 h-12 text-center text-lg font-medium
                  border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500
                  transition ${
                    digit ? "border-blue-500" : "border-gray-300"
                  }
                `}
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={isOtpVerifying || otp.join("").length !== 6}
            className={`
              w-full py-2.5 rounded-lg text-white font-medium text-sm transition-all
              ${
                isOtpVerifying || otp.join("").length !== 6
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 active:scale-[0.98]"
              }
            `}
          >
            {isOtpVerifying ? "Verifying..." : "Verify OTP"}
          </button>
        </form>

       
      </div>
    </div>
  );
};

export default VerifyOTP;
