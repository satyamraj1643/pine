import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import Pine from "../assets/pine-transparent.png";

/**
 * Guest navigation bar -- shown on all unauthenticated pages.
 * Sticky top bar with logo + auth links.
 */
const Navbar: React.FC = () => {
  const location = useLocation();
  const isLogin = location.pathname === "/login";
  const isSignup = location.pathname === "/signup";

  return (
    <nav
      role="navigation"
      aria-label="Guest navigation"
      className="sticky top-0 z-50 border-b border-[rgb(var(--border))] backdrop-blur-sm bg-[rgba(var(--background),0.85)]"
    >
      <div className="max-w-4xl mx-auto px-6 lg:px-16 xl:px-24 h-14 flex items-center justify-between">
        <NavLink to="/" className="flex items-center gap-2">
          <img src={Pine} alt="Pine" className="w-6 h-6 object-contain" />
          <span className="font-serif text-[15px] font-bold text-[rgb(var(--copy-primary))] tracking-tight">
            Pine
          </span>
        </NavLink>
        <div className="flex items-center gap-5 text-sm">
          {!isLogin && (
            <NavLink
              to="/login"
              className="text-[rgb(var(--copy-secondary))] hover:text-[rgb(var(--copy-primary))] transition-colors"
            >
              Log in
            </NavLink>
          )}
          {!isSignup && (
            <NavLink
              to="/signup"
              className="px-3.5 py-1.5 rounded-md font-medium bg-[rgb(var(--cta))] text-[rgb(var(--cta-text))] hover:bg-[rgb(var(--cta-active))] transition-colors"
            >
              Get Pine free
            </NavLink>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
