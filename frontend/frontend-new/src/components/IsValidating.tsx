import React, { useEffect, useState } from "react";
import { FaLeaf, FaSpinner } from "react-icons/fa";
import Pine from "../assets/pine-transparent.png"; // Reusing the Pine logo from Hero.tsx

const Validating: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: "rgb(var(--background))" }}
    >
      <div className="relative text-center max-w-md mx-auto px-4">
        {/* Decorative background elements - squircles like in Hero.tsx */}
        <div
          className="absolute top-0 left-0 w-20 h-20 bg-[rgba(var(--accent),0.1)] rounded-2xl blur-xl"
          style={{ transform: "translate(-50%, -50%)" }}
        ></div>
        <div
          className="absolute bottom-0 right-0 w-24 h-24 bg-[rgba(var(--warning),0.1)] rounded-3xl blur-xl"
          style={{ transform: "translate(50%, 50%)" }}
        ></div>

        <div
          className={`relative z-10 transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          {/* Pine Logo with squircle background */}
          <div className="relative inline-block mb-6">
            <div className="absolute -top-2 -left-2 w-16 h-16 bg-[rgba(var(--accent),0.2)] rounded-2xl transform rotate-6 opacity-60 animate-pulse"></div>
            <div className="relative p-4 rounded-2xl bg-[rgb(var(--card))] shadow-lg border border-[rgb(var(--border))] backdrop-blur-sm">
              <img src={Pine} alt="Pine Logo" className="w-16 h-16 mx-auto" />
            </div>
          </div>

          {/* Heading */}
          <h2
            className="text-3xl font-serif font-semibold mb-4"
            style={{ color: "rgb(var(--copy-primary))" }}
          >
            Validating...
          </h2>

          {/* Comforting Message */}
          <p
            className="text-base font-light leading-relaxed mb-6"
            style={{ color: "rgb(var(--copy-secondary))" }}
          >
            Just a moment while we prepare your cozy journaling space. Your thoughts are almost ready to find their home.
          </p>

          {/* Spinner with Leaf Icon */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <FaSpinner
              className="text-xl animate-spin"
              style={{ color: "rgb(var(--accent))" }}
            />
            <FaLeaf
              className="text-sm"
              style={{ color: "rgb(var(--success))" }}
            />
          </div>

          {/* Subtle Quote */}
          <div className="relative">
            <FaLeaf
              className="text-xs mb-2 mx-auto"
              style={{ color: "rgb(var(--copy-muted))" }}
            />
            <p
              className="text-xs italic font-light"
              style={{ color: "rgb(var(--copy-muted))" }}
            >
              “Every story begins with a single step. Yours is starting now.”
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Validating;