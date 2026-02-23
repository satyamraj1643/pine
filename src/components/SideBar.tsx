import React, { useState } from "react";
import {
  FaHome,
  FaBookOpen,
  FaTag,
  FaArchive,
  FaCog,
  FaSignOutAlt,
  FaSmile,
  FaPlus,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import pineLogo from "../assets/pine-transparent.png";
import { logoutUser } from "../redux/authThunks";
import type { RootState } from "../redux/store";
import { FaPenNib } from "react-icons/fa6";
import { useSidebar, type SidebarState } from "../contexts/SidebarContext";

interface NavItem {
  to: string;
  label: string;
  icon: React.ReactElement;
}

const mainNavItems: NavItem[] = [
  { to: "/", label: "Home", icon: <FaHome size={16} /> },
  { to: "/notes", label: "Notes", icon: <FaPenNib size={16} /> },
  { to: "/notebooks", label: "Notebooks", icon: <FaBookOpen size={16} /> },
];

const organizeNavItems: NavItem[] = [
  { to: "/tags", label: "Tags", icon: <FaTag size={16} /> },
  { to: "/mood", label: "Moods", icon: <FaSmile size={16} /> },
];

const systemNavItems: NavItem[] = [
  { to: "/archives", label: "Archive", icon: <FaArchive size={16} /> },
  { to: "/settings", label: "Settings", icon: <FaCog size={16} /> },
];

function NavSection({
  label,
  items,
  sidebarState,
}: {
  label?: string;
  items: NavItem[];
  sidebarState: SidebarState;
}) {
  const showLabels = sidebarState === "full";
  
  return (
    <div className="mb-1">
      {label && showLabels && (
        <div className="px-3 pt-4 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-[rgb(var(--copy-muted))]">
          {label}
        </div>
      )}
      {label && !showLabels && <div className="pt-3" />}
      <ul className="space-y-0.5">
        {items.map(({ to, label: navLabel, icon }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={to === "/"}
              title={!showLabels ? navLabel : undefined}
              className={({ isActive }) =>
                [
                  "flex items-center gap-2.5 rounded-lg text-[13px] transition-all duration-150",
                  showLabels ? "px-3 py-[7px]" : "px-2.5 py-2 justify-center",
                  isActive
                    ? "bg-[rgb(var(--card))] text-[rgb(var(--copy-primary))] font-medium shadow-sm"
                    : "text-[rgb(var(--copy-secondary))] hover:bg-[rgb(var(--card))]/60 hover:text-[rgb(var(--copy-primary))]",
                ].join(" ")
              }
            >
              <span className={`flex items-center justify-center ${showLabels ? "w-4 opacity-60" : "w-5"}`}>
                {icon}
              </span>
              {showLabels && <span>{navLabel}</span>}
            </NavLink>
          </li>
        ))}
      </ul>
    </div>
  );
}

const SideBar: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoggingOut, name } = useSelector((state: RootState) => state.auth);
  const { sidebarState, setSidebarState } = useSidebar();
  const [isHoveringEdge, setIsHoveringEdge] = useState(false);

  const showLabels = sidebarState === "full";
  const isHidden = sidebarState === "hidden";

  // Width classes based on state
  const sidebarWidth = sidebarState === "full" ? "w-56" : sidebarState === "mid" ? "w-14" : "w-0";

  const handleLogout = async () => {
    try {
      // @ts-ignore
      await dispatch(logoutUser()).unwrap();
      toast.success("Logged out");
      navigate("/login");
    } catch {
      toast.error("Logout failed");
    }
  };

  const firstName = name?.split(" ")[0] || "Writer";

  // Get next state info
  const getNextState = (): { nextState: SidebarState; tooltip: string } => {
    switch (sidebarState) {
      case "full":
        return { nextState: "mid", tooltip: "Collapse sidebar (⌘B)" };
      case "mid":
        return { nextState: "hidden", tooltip: "Hide sidebar (⌘B)" };
      case "hidden":
        return { nextState: "full", tooltip: "Show sidebar (⌘B)" };
    }
  };

  const { nextState, tooltip } = getNextState();

  // When hidden, show invisible hover zone on left edge to reveal toggle
  if (isHidden) {
    return (
      <>
        {/* Invisible hover zone */}
        <div 
          className="fixed top-0 left-0 w-4 h-full z-50 hidden sm:block"
          onMouseEnter={() => setIsHoveringEdge(true)}
          onMouseLeave={() => setIsHoveringEdge(false)}
        />
        {/* Toggle button - only visible on hover */}
        <button
          onClick={() => setSidebarState("full")}
          onMouseEnter={() => setIsHoveringEdge(true)}
          onMouseLeave={() => setIsHoveringEdge(false)}
          className={`fixed top-1/2 -translate-y-1/2 left-0 z-50 h-16 w-6 rounded-r-xl bg-[rgb(var(--surface))] border border-l-0 border-[rgb(var(--border))] shadow-lg items-center justify-center text-[rgb(var(--copy-muted))] hover:text-[rgb(var(--copy-primary))] hover:bg-[rgb(var(--card))] transition-all duration-200 hidden sm:flex ${
            isHoveringEdge ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2"
          }`}
          title="Show sidebar (⌘B)"
        >
          <FaChevronRight size={10} />
        </button>
      </>
    );
  }

  return (
    <>
      <aside
        className={`fixed top-0 left-0 z-40 h-screen hidden sm:block transition-all duration-300 ease-in-out ${sidebarWidth}`}
      >
        <div className="h-full flex flex-col justify-between py-3 px-2 bg-[rgb(var(--surface))] border-r border-[rgb(var(--border))]">
          {/* Top section */}
          <div>
            {/* Logo + branding */}
            <div className={`flex items-center gap-2.5 mb-2 ${showLabels ? "px-3" : "px-0 justify-center"}`}>
              <img src={pineLogo} alt="Pine" className="w-6 h-6 object-contain flex-shrink-0" />
              {showLabels && (
                <span className="text-[15px] font-serif font-bold text-[rgb(var(--copy-primary))] tracking-tight">
                  Pine
                </span>
              )}
            </div>

            {/* Quick create CTA */}
            <button
              onClick={() => navigate("/new-note")}
              title={!showLabels ? "New Note" : undefined}
              className={`flex items-center justify-center gap-2 w-full mt-3 mb-4 rounded-lg text-[13px] font-medium bg-[rgb(var(--cta))] text-[rgb(var(--cta-text))] hover:bg-[rgb(var(--cta-active))] transition-colors shadow-sm ${
                showLabels ? "px-3 py-2" : "py-2.5"
              }`}
            >
              <FaPlus className="text-[10px]" />
              {showLabels && "New Note"}
            </button>

            {/* Navigation sections */}
            <NavSection items={mainNavItems} sidebarState={sidebarState} />
            <NavSection label="Organize" items={organizeNavItems} sidebarState={sidebarState} />
            <NavSection label="System" items={systemNavItems} sidebarState={sidebarState} />
          </div>

          {/* Bottom section — user info + logout */}
          <div className="border-t border-[rgb(var(--border))] pt-2.5 mt-2">
            <div className={`flex items-center gap-2.5 py-1.5 mb-1 ${showLabels ? "px-3" : "px-0 justify-center"}`}>
              <div className="w-7 h-7 rounded-full bg-[rgb(var(--cta))]/10 flex items-center justify-center text-xs font-semibold text-[rgb(var(--cta))] flex-shrink-0">
                {firstName.charAt(0).toUpperCase()}
              </div>
              {showLabels && (
                <span className="text-[13px] text-[rgb(var(--copy-primary))] font-medium truncate">
                  {firstName}
                </span>
              )}
            </div>
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              title={!showLabels ? "Log out" : undefined}
              className={`flex items-center gap-2.5 w-full rounded-lg text-[13px] text-[rgb(var(--copy-muted))] hover:bg-[rgb(var(--card))]/60 hover:text-[rgb(var(--copy-secondary))] transition-all duration-150 disabled:opacity-50 ${
                showLabels ? "px-3 py-[7px]" : "py-2 justify-center"
              }`}
            >
              <FaSignOutAlt size={13} className="opacity-60 flex-shrink-0" />
              {showLabels && <span>{isLoggingOut ? "Logging out..." : "Log out"}</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Hover zone for toggle - positioned at the right edge of sidebar */}
      <div 
        className="fixed top-0 h-full w-4 z-50 hidden sm:block"
        style={{ left: sidebarState === "full" ? "calc(14rem - 8px)" : "calc(3.5rem - 8px)" }}
        onMouseEnter={() => setIsHoveringEdge(true)}
        onMouseLeave={() => setIsHoveringEdge(false)}
      />
      
      {/* Toggle button - Notion style, appears on hover */}
      <button
        onClick={() => setSidebarState(nextState)}
        onMouseEnter={() => setIsHoveringEdge(true)}
        onMouseLeave={() => setIsHoveringEdge(false)}
        className={`fixed top-1/2 -translate-y-1/2 z-50 h-16 w-6 rounded-r-xl bg-[rgb(var(--surface))] border border-l-0 border-[rgb(var(--border))] shadow-lg items-center justify-center text-[rgb(var(--copy-muted))] hover:text-[rgb(var(--copy-primary))] hover:bg-[rgb(var(--card))] transition-all duration-200 hidden sm:flex ${
          isHoveringEdge ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        style={{ 
          left: sidebarState === "full" ? "calc(14rem - 1px)" : "calc(3.5rem - 1px)",
          transitionProperty: "opacity, background-color, color"
        }}
        title={tooltip}
      >
        <FaChevronLeft size={10} />
      </button>
    </>
  );
};

export default SideBar;
