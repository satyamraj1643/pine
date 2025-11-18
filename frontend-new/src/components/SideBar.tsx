import React from "react";
import {
  FaHome,
  FaClock,
  FaBookOpen,
  FaTag,
  FaArchive,
  FaCog,
  FaSignOutAlt,
  FaSmile,
} from "react-icons/fa";
import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import pineLogo from "../assets/pine-transparent.png";

import { logoutUser } from "../redux/authThunks"; // ✅ Updated
import type { RootState } from "../redux/store";
import { FaPenNib } from "react-icons/fa6";

// Define interfaces
interface NavItem {
  to: string;
  label: string;
  icon: React.ReactElement;
}

const navItems: NavItem[] = [
  { to: "/", label: "Home", icon: <FaHome size={16} /> },
  { to: "/my-entries", label: "My Entries", icon: <FaPenNib size={16} /> },
  { to: "/chapters", label: "My Chapters", icon: <FaBookOpen size={16} /> },
  { to: "/collections", label: "My Collections", icon: <FaTag size={16} /> },
   {to: "/mood", label: "Mood", icon : <FaSmile size={16}/>},
  { to: "/archives", label: "Archives", icon: <FaArchive size={16} /> },
  { to: "/settings", label: "Settings", icon: <FaCog size={16} /> },

];

const SideBar: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const isLoggingOut = useSelector(
    (state: RootState) => state.auth.isLoggingOut
  );

  const handleLogout = async () => {
    try {
      //@ts-ignore
      await dispatch(logoutUser()).unwrap();
      toast.success("Logged out successfully!");
      navigate("/login");
    } catch (err) {
      console.error("Logout error:", err);
      toast.error("Failed to logout. Please try again.");
    }
  };

  return (
    <aside
      id="default-sidebar"
      className="fixed top-0 left-0 z-40 w-64 h-screen transform -translate-x-full sm:translate-x-0 transition-transform duration-300"
      aria-label="Sidebar"
    >
      <div
        className="
          h-full px-4 py-6 flex flex-col justify-between overflow-y-auto
          bg-[rgb(var(--background))]
          border-r border-[rgb(var(--border))]
          shadow-sm
        "
      >
        <div>
          <div className="flex items-center gap-4 mb-8 px-3">
            <img
              src={pineLogo}
              alt="Pine Logo"
              className="w-12 h-12 object-contain filter drop-shadow-sm"
            />
            <div>
              <h2 className="text-2xl font-serif text-[rgb(var(--copy-primary))] font-bold tracking-wide">
                Pine
              </h2>
              <p className="text-sm text-[rgb(var(--copy-secondary))] font-medium">
                Your digital sanctuary
              </p>
            </div>
          </div>
          <ul className="space-y-1">
            {navItems.map(({ to, label, icon }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  className={({ isActive }) =>
                    [
                      "flex items-center p-3 rounded-lg transition-all duration-200 text-sm",
                      isActive
                        ? "bg-[rgb(var(--card))] text-[rgb(var(--copy-primary))] shadow-sm"
                        : "text-[rgb(var(--copy-secondary))] hover:bg-[rgb(var(--surface))] hover:text-[rgb(var(--copy-primary))] hover:shadow-sm",
                    ].join(" ")
                  }
                  aria-label={`Navigate to ${label}`}
                >
                  <div className="w-5 flex items-center justify-center">{icon}</div>
                  <span className="ml-3 font-medium">{label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </div>

        <div className="border-t border-[rgb(var(--border))] pt-4 mt-4 px-3">
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className={`
              w-full flex items-center p-3 text-sm
              text-[rgb(var(--copy-secondary))]
              rounded-lg
              transition-all duration-200
              ${isLoggingOut ? "opacity-50 cursor-not-allowed" : "hover:bg-[rgb(var(--surface))] hover:text-amber-600"}
            `}
            aria-label={isLoggingOut ? "Logging out..." : "Logout"}
          >
            <FaSignOutAlt size={16} />
            <span className="ml-3 font-medium">
              {isLoggingOut ? "Logging out..." : "Logout"}
            </span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default SideBar;
