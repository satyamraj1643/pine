import React from "react";
import { NavLink } from "react-router-dom";
import Pine from "../assets/pine-transparent.png";

const Navbar: React.FC = () => {
  return (
    <nav className="sticky top-0 z-50 border-b border-[rgb(var(--border))] bg-[rgb(var(--card))]">
      <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
        <NavLink to="/" className="flex items-center gap-2">
          <img src={Pine} alt="Pine" className="w-7 h-7 object-contain" />
          <span className="text-base font-serif font-bold text-[rgb(var(--copy-primary))] tracking-tight">
            Pine
          </span>
        </NavLink>
        <div className="flex items-center gap-4">
          <NavLink
            to="/login"
            className="text-sm text-[rgb(var(--copy-secondary))] hover:text-[rgb(var(--copy-primary))] transition-colors"
          >
            Log in
          </NavLink>
          <NavLink
            to="/signup"
            className="px-3.5 py-1.5 text-sm font-medium rounded-md bg-[rgb(var(--cta))] text-[rgb(var(--cta-text))] hover:bg-[rgb(var(--cta-active))] transition-colors"
          >
            Sign up
          </NavLink>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
