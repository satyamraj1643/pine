import React from "react";
import { useNavigate } from "react-router-dom";
import Pine from "../assets/pine-transparent.png";

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-[rgb(var(--background))] px-6">
      <div className="text-center max-w-sm">
        <img src={Pine} alt="Pine" className="w-10 h-10 mx-auto mb-6 opacity-60" />
        <h1 className="text-5xl font-bold text-[rgb(var(--copy-muted))] mb-2">404</h1>
        <h2 className="text-lg font-serif font-semibold text-[rgb(var(--copy-primary))] mb-2">
          Page not found
        </h2>
        <p className="text-sm text-[rgb(var(--copy-muted))] mb-8">
          This page doesn't exist or has been moved.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 text-sm font-medium rounded-md bg-[rgb(var(--cta))] text-[rgb(var(--cta-text))] hover:bg-[rgb(var(--cta-active))] transition-colors"
          >
            Go home
          </button>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 text-sm text-[rgb(var(--copy-secondary))] hover:text-[rgb(var(--copy-primary))] transition-colors"
          >
            Go back
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
