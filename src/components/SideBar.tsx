import React, { useState } from "react";
import { FaSignOutAlt, FaPlus, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import pineLogo from "../assets/pine-transparent.png";
import { logoutUser } from "../redux/authThunks";
import type { RootState } from "../redux/store";
import { useSidebar, type SidebarState } from "../contexts/SidebarContext";
import { navGroups } from "../config/navConfig";
import type { NavItem, NavGroup } from "../config/navConfig";

// ─── Nav section ─────────────────────────────────────────

function NavSection({
  group,
  sidebarState,
}: {
  group: NavGroup;
  sidebarState: SidebarState;
}) {
  const showLabels = sidebarState === "full";

  return (
    <div className="mb-0.5">
      {group.label && showLabels && (
        <div className="px-2 pt-5 pb-1 text-[11px] font-medium text-[rgb(var(--copy-muted))]">
          {group.label}
        </div>
      )}
      {group.label && !showLabels && <div className="pt-3" />}
      <ul className="space-y-px" role="list">
        {group.items.map(({ to, label, icon }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={to === "/"}
              title={!showLabels ? label : undefined}
              className={({ isActive }) =>
                [
                  "flex items-center gap-2 rounded-md text-[13px] transition-colors duration-100",
                  showLabels ? "px-2 py-[5px]" : "px-2 py-1.5 justify-center",
                  isActive
                    ? "bg-[rgb(var(--copy-primary))]/[0.08] text-[rgb(var(--copy-primary))]"
                    : "text-[rgb(var(--copy-secondary))] hover:bg-[rgb(var(--copy-primary))]/[0.04] hover:text-[rgb(var(--copy-primary))]",
                ].join(" ")
              }
            >
              <span className="flex items-center justify-center w-5 opacity-[0.75]">
                {icon}
              </span>
              {showLabels && <span>{label}</span>}
            </NavLink>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── Main sidebar ────────────────────────────────────────

const SideBar: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoggingOut, name, profilePicture } = useSelector((state: RootState) => state.auth);
  const { sidebarState, setSidebarState } = useSidebar();
  const [isHoveringEdge, setIsHoveringEdge] = useState(false);

  const showLabels = sidebarState === "full";
  const isHidden = sidebarState === "hidden";
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

  const getNextState = (): { nextState: SidebarState; tooltip: string } => {
    switch (sidebarState) {
      case "full":
        return { nextState: "mid", tooltip: "Collapse sidebar (\u2318B)" };
      case "mid":
        return { nextState: "hidden", tooltip: "Hide sidebar (\u2318B)" };
      case "hidden":
        return { nextState: "full", tooltip: "Show sidebar (\u2318B)" };
    }
  };

  const { nextState, tooltip } = getNextState();

  // When hidden, show edge hover zone
  if (isHidden) {
    return (
      <>
        <div
          className="fixed top-0 left-0 w-4 h-full z-50 hidden sm:block"
          onMouseEnter={() => setIsHoveringEdge(true)}
          onMouseLeave={() => setIsHoveringEdge(false)}
        />
        <button
          onClick={() => setSidebarState("full")}
          onMouseEnter={() => setIsHoveringEdge(true)}
          onMouseLeave={() => setIsHoveringEdge(false)}
          className={`fixed top-1/2 -translate-y-1/2 left-0 z-50 h-12 w-5 rounded-r-lg bg-[rgb(var(--surface))] border border-l-0 border-[rgb(var(--border))] items-center justify-center text-[rgb(var(--copy-muted))] hover:text-[rgb(var(--copy-primary))] transition-all duration-200 hidden sm:flex ${
            isHoveringEdge ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-1"
          }`}
          title="Show sidebar (\u2318B)"
          aria-label="Show sidebar"
        >
          <FaChevronRight size={9} />
        </button>
      </>
    );
  }

  return (
    <>
      <aside
        className={`fixed top-0 left-0 z-40 h-screen hidden sm:block transition-all duration-300 ease-in-out ${sidebarWidth}`}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="h-full flex flex-col justify-between py-2.5 px-1.5 bg-[rgb(var(--surface))]">
          {/* Top */}
          <div className="flex-1 min-h-0 flex flex-col">
            {/* Workspace header */}
            <div className={`flex items-center gap-2 mb-1 ${showLabels ? "px-2 py-1" : "px-0 py-1 justify-center"}`}>
              <img src={pineLogo} alt="Pine" className="w-5 h-5 object-contain flex-shrink-0 opacity-80" />
              {showLabels && (
                <span className="text-[13px] font-semibold text-[rgb(var(--copy-primary))] tracking-tight">
                  Pine
                </span>
              )}
            </div>

            {/* New note */}
            <button
              onClick={() => navigate("/new-note")}
              title={!showLabels ? "New Note" : undefined}
              aria-label="New note"
              className={`flex items-center gap-2 w-full rounded-md text-[13px] text-[rgb(var(--copy-secondary))] hover:bg-[rgb(var(--copy-primary))]/[0.04] hover:text-[rgb(var(--copy-primary))] transition-colors duration-100 mb-1 ${
                showLabels ? "px-2 py-[5px]" : "px-2 py-1.5 justify-center"
              }`}
            >
              <span className="flex items-center justify-center w-5 opacity-[0.75]">
                <FaPlus size={13} />
              </span>
              {showLabels && <span>New note</span>}
            </button>

            {/* Nav groups from config */}
            {navGroups.map((group, i) => (
              <NavSection key={group.label || i} group={group} sidebarState={sidebarState} />
            ))}
          </div>

          {/* Bottom -- user */}
          <div className="pt-2 mt-1">
            <NavLink
              to="/settings"
              className={({ isActive }) =>
                `flex items-center gap-2 rounded-md py-1.5 transition-colors duration-100 ${showLabels ? "px-2" : "px-0 justify-center"} ${
                  isActive
                    ? "bg-[rgb(var(--copy-primary))]/[0.08]"
                    : "hover:bg-[rgb(var(--copy-primary))]/[0.04]"
                }`
              }
              title={!showLabels ? firstName : undefined}
            >
              {profilePicture ? (
                <img
                  src={profilePicture}
                  alt=""
                  className="w-6 h-6 rounded-sm object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-6 h-6 rounded-sm bg-[rgb(var(--copy-primary))]/[0.08] flex items-center justify-center text-[10px] font-semibold text-[rgb(var(--copy-secondary))] flex-shrink-0">
                  {firstName.charAt(0).toUpperCase()}
                </div>
              )}
              {showLabels && (
                <span className="text-[13px] text-[rgb(var(--copy-secondary))] truncate">
                  {firstName}
                </span>
              )}
            </NavLink>
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              title={!showLabels ? "Log out" : undefined}
              aria-label="Log out"
              className={`flex items-center gap-2 w-full rounded-md text-[13px] text-[rgb(var(--copy-muted))] hover:bg-[rgb(var(--copy-primary))]/[0.04] hover:text-[rgb(var(--copy-secondary))] transition-colors duration-100 disabled:opacity-50 ${
                showLabels ? "px-2 py-[5px]" : "py-1.5 justify-center"
              }`}
            >
              <span className="flex items-center justify-center w-5 opacity-[0.75]">
                <FaSignOutAlt size={13} />
              </span>
              {showLabels && <span>{isLoggingOut ? "Logging out..." : "Log out"}</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Hover zone at right edge */}
      <div
        className="fixed top-0 h-full w-4 z-50 hidden sm:block"
        style={{ left: sidebarState === "full" ? "calc(14rem - 8px)" : "calc(3.5rem - 8px)" }}
        onMouseEnter={() => setIsHoveringEdge(true)}
        onMouseLeave={() => setIsHoveringEdge(false)}
      />

      {/* Toggle pill */}
      <button
        onClick={() => setSidebarState(nextState)}
        onMouseEnter={() => setIsHoveringEdge(true)}
        onMouseLeave={() => setIsHoveringEdge(false)}
        className={`fixed top-1/2 -translate-y-1/2 z-50 h-12 w-5 rounded-r-lg bg-[rgb(var(--surface))] border border-l-0 border-[rgb(var(--border))] items-center justify-center text-[rgb(var(--copy-muted))] hover:text-[rgb(var(--copy-primary))] transition-all duration-200 hidden sm:flex ${
          isHoveringEdge ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        style={{
          left: sidebarState === "full" ? "calc(14rem - 1px)" : "calc(3.5rem - 1px)",
          transitionProperty: "opacity, background-color, color",
        }}
        title={tooltip}
        aria-label={tooltip}
      >
        <FaChevronLeft size={9} />
      </button>
    </>
  );
};

export default SideBar;
