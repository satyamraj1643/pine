import React, { useCallback, useEffect, useRef, useState } from "react";
import { Plus, ChevronRight } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import pineLogo from "../assets/pine-transparent.png";
import type { RootState } from "../redux/store";
import { useSidebar } from "../contexts/SidebarContext";
import { navGroups } from "../config/navConfig";
import type { NavGroup } from "../config/navConfig";

// ─── Nav section ─────────────────────────────────────────

function NavSection({
  showLabels,
  group,
}: {
  showLabels: boolean;
  group: NavGroup;
}) {
  return (
    <div className="mb-0.5">
      {group.label && showLabels && (
        <div className="px-2 pt-5 pb-1 text-[11px] font-medium text-[rgb(var(--copy-muted))] tracking-wide">
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
                  "flex items-center gap-2.5 rounded-md text-[13px] transition-colors duration-100",
                  showLabels ? "px-2 py-[6px]" : "px-2 py-1.5 justify-center",
                  isActive
                    ? "bg-[rgb(var(--copy-primary))]/[0.08] text-[rgb(var(--copy-primary))]"
                    : "text-[rgb(var(--copy-primary))]/70 hover:bg-[rgb(var(--copy-primary))]/[0.04] hover:text-[rgb(var(--copy-primary))]",
                ].join(" ")
              }
            >
              <span className="flex items-center justify-center w-5">
                {icon}
              </span>
              {showLabels && <span className="truncate">{label}</span>}
            </NavLink>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── Main sidebar ────────────────────────────────────────

const SideBar: React.FC = () => {
  const navigate = useNavigate();
  const { name, profilePicture } = useSelector((state: RootState) => state.auth);
  const {
    sidebarWidth, setDragWidth, commitDrag, isDragging, setIsDragging,
  } = useSidebar();

  const dragRef = useRef<{ startX: number; startW: number } | null>(null);
  const handleRef = useRef<HTMLDivElement>(null);
  const [edgeHover, setEdgeHover] = useState(false);
  const [edgeY, setEdgeY] = useState(0);

  const firstName = name?.split(" ")[0] || "Writer";
  const initial = firstName.charAt(0).toUpperCase();

  // Derive labels from current pixel width (works for both drag and rest)
  const showLabels = sidebarWidth > 120;
  const isCollapsed = sidebarWidth === 0;

  // ── Single unified drag handler ──
  const startDrag = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragRef.current = { startX: e.clientX, startW: sidebarWidth };
    setIsDragging(true);
    // Always capture on the persistent handle element
    handleRef.current?.setPointerCapture(e.pointerId);
  }, [sidebarWidth, setIsDragging]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragRef.current) return;
    const rawPx = dragRef.current.startW + (e.clientX - dragRef.current.startX);
    setDragWidth(rawPx);
  }, [setDragWidth]);

  const onPointerUp = useCallback(() => {
    if (!dragRef.current) return;
    dragRef.current = null;
    setIsDragging(false);
    commitDrag();
  }, [commitDrag, setIsDragging]);

  // Prevent text selection while dragging
  useEffect(() => {
    if (isDragging) {
      document.body.style.userSelect = "none";
      document.body.style.cursor = "col-resize";
    } else {
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
    }
    return () => {
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
    };
  }, [isDragging]);

  return (
    <>
      {/* Sidebar — always rendered, width can be 0 */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen hidden sm:block overflow-hidden ${
          isDragging ? "" : "transition-[width] duration-200 ease-out"
        }`}
        style={{ width: `${sidebarWidth}px` }}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="h-full flex flex-col justify-between py-2.5 px-1.5 bg-[rgb(var(--surface))] min-w-0">
          {/* Top */}
          <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
            {/* Workspace header */}
            <div className={`flex items-center mb-1 ${showLabels ? "justify-between px-2 py-1" : "justify-center px-0 py-1"}`}>
              <div className="flex items-center gap-2 min-w-0">
                <img src={pineLogo} alt="Pine" className="w-5 h-5 object-contain flex-shrink-0 opacity-80" />
                {showLabels && (
                  <span className="text-[13px] font-semibold text-[rgb(var(--copy-primary))] tracking-tight truncate">
                    Pine
                  </span>
                )}
              </div>
            </div>

            {/* New note */}
            <button
              onClick={() => navigate("/new-note")}
              title={!showLabels ? "New Note" : undefined}
              aria-label="New note"
              className={`flex items-center gap-2.5 w-full rounded-md text-[13px] text-[rgb(var(--copy-primary))]/70 hover:bg-[rgb(var(--copy-primary))]/[0.04] hover:text-[rgb(var(--copy-primary))] transition-colors duration-100 mb-1 ${
                showLabels ? "px-2 py-[6px]" : "px-2 py-1.5 justify-center"
              }`}
            >
              <span className="flex items-center justify-center w-5">
                <Plus size={16} strokeWidth={1.75} />
              </span>
              {showLabels && <span>New note</span>}
            </button>

            {/* Nav groups */}
            {navGroups.map((group, i) => (
              <NavSection key={group.label || i} group={group} showLabels={showLabels} />
            ))}
          </div>

          {/* Bottom -- user profile */}
          <div className="pt-2 mt-1">
            <NavLink
              to="/settings"
              className={`flex items-center gap-2 rounded-md py-1.5 transition-colors duration-100 hover:bg-[rgb(var(--copy-primary))]/[0.04] ${showLabels ? "px-2" : "px-0 justify-center"}`}
              title={!showLabels ? "Settings" : undefined}
            >
              {profilePicture ? (
                <img src={profilePicture} alt="" className="w-6 h-6 rounded-full object-cover flex-shrink-0" />
              ) : (
                <div className="w-6 h-6 rounded-full bg-[rgb(var(--copy-primary))]/[0.08] flex items-center justify-center text-[10px] font-semibold text-[rgb(var(--copy-secondary))] flex-shrink-0">
                  {initial}
                </div>
              )}
              {showLabels && (
                <span className="text-[13px] text-[rgb(var(--copy-primary))]/70 truncate">
                  {firstName}
                </span>
              )}
            </NavLink>
          </div>
        </div>
      </aside>

      {/* Drag handle — always rendered, never unmounts */}
      <div
        ref={handleRef}
        onPointerDown={startDrag}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        className={`fixed top-0 z-50 h-screen hidden sm:block cursor-col-resize group ${
          isDragging ? "" : "transition-[left] duration-200 ease-out"
        }`}
        style={{ left: `${Math.max(sidebarWidth - 4, 0)}px`, width: isCollapsed && !isDragging ? "12px" : "8px" }}
        onMouseEnter={() => isCollapsed && setEdgeHover(true)}
        onMouseLeave={() => isCollapsed && setEdgeHover(false)}
        onMouseMoveCapture={(e) => isCollapsed && setEdgeY(e.clientY)}
      >
        {/* Normal resize indicator line (visible states) */}
        {!isCollapsed && (
          <div className={`absolute inset-y-0 left-1/2 -translate-x-1/2 w-[2px] transition-colors duration-150 ${
            isDragging
              ? "bg-[rgb(var(--cta))]/60"
              : "bg-transparent group-hover:bg-[rgb(var(--copy-muted))]/30"
          }`} />
        )}

        {/* ">" chevron for hidden state */}
        {isCollapsed && !isDragging && (
          <div
            className={`fixed left-0 flex items-center justify-center w-5 h-10 rounded-r-md bg-[rgb(var(--surface))] border border-l-0 border-[rgb(var(--border))] text-[rgb(var(--copy-muted))] transition-all duration-150 pointer-events-none ${
              edgeHover ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-1"
            }`}
            style={{ top: `${edgeY - 20}px` }}
          >
            <ChevronRight size={14} strokeWidth={2} />
          </div>
        )}
      </div>
    </>
  );
};

export default SideBar;
