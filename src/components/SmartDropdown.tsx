import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useLayoutEffect,
  createContext,
  useContext,
  useId,
} from "react";
import { createPortal } from "react-dom";

// ────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────

interface DropdownContextValue {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  isMobile: boolean;
  triggerRef: React.RefObject<HTMLElement>;
  contentId: string;
}

interface SmartDropdownProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

interface DropdownTriggerProps {
  children: React.ReactNode;
  className?: string;
}

interface DropdownContentProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  align?: "start" | "center" | "end";
  sideOffset?: number;
  searchable?: boolean;
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
}

interface DropdownItemProps {
  children: React.ReactNode;
  onClick?: () => void;
  selected?: boolean;
  disabled?: boolean;
  destructive?: boolean;
  className?: string;
  closeOnSelect?: boolean;
}

interface DropdownSeparatorProps {
  className?: string;
}

interface DropdownLabelProps {
  children: React.ReactNode;
  className?: string;
}

// ────────────────────────────────────────────────────────────
// Context
// ────────────────────────────────────────────────────────────

const DropdownContext = createContext<DropdownContextValue | null>(null);

const useDropdownContext = () => {
  const context = useContext(DropdownContext);
  if (!context) {
    throw new Error("Dropdown components must be used within SmartDropdown");
  }
  return context;
};

// ────────────────────────────────────────────────────────────
// Hook: mobile detection
// ────────────────────────────────────────────────────────────

const useIsMobile = (breakpoint = 640) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < breakpoint);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [breakpoint]);

  return isMobile;
};

// ────────────────────────────────────────────────────────────
// Main SmartDropdown
// ────────────────────────────────────────────────────────────

export function SmartDropdown({
  children,
  open: controlledOpen,
  onOpenChange,
}: SmartDropdownProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isMobile = useIsMobile();
  const triggerRef = useRef<HTMLElement>(null);
  const contentId = useId();

  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;

  const setIsOpen = useCallback(
    (open: boolean) => {
      if (controlledOpen === undefined) {
        setInternalOpen(open);
      }
      onOpenChange?.(open);
    },
    [controlledOpen, onOpenChange]
  );

  return (
    <DropdownContext.Provider value={{ isOpen, setIsOpen, isMobile, triggerRef, contentId }}>
      {children}
    </DropdownContext.Provider>
  );
}

// ────────────────────────────────────────────────────────────
// Trigger
// ────────────────────────────────────────────────────────────

export function DropdownTrigger({
  children,
  className = "",
}: DropdownTriggerProps) {
  const { isOpen, setIsOpen, triggerRef, contentId } = useDropdownContext();

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  // Attach ref + props to the child element directly (no wrapper div)
  const child = React.Children.only(children) as React.ReactElement<any>;

  return React.cloneElement(child, {
    ref: triggerRef,
    onClick: (e: React.MouseEvent) => {
      handleClick(e);
      child.props.onClick?.(e);
    },
    "aria-haspopup": "menu",
    "aria-expanded": isOpen,
    "aria-controls": isOpen ? contentId : undefined,
    className: child.props.className
      ? `${child.props.className} ${className}`
      : className || child.props.className,
  });
}

// ────────────────────────────────────────────────────────────
// Content (Desktop dropdown / Mobile bottom sheet)
// ────────────────────────────────────────────────────────────

// Closing state management: we delay unmount to allow exit animation
function useAnimatedPresence(isOpen: boolean, duration: number) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      // Force a frame so the enter animation triggers after mount
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setVisible(true));
      });
    } else {
      setVisible(false);
      const timer = setTimeout(() => setMounted(false), duration);
      return () => clearTimeout(timer);
    }
  }, [isOpen, duration]);

  return { mounted, visible };
}

interface Position {
  top: number;
  left: number;
  width: number;
  flipped: boolean;
}

export function DropdownContent({
  children,
  className = "",
  title,
  align = "start",
  sideOffset = 4,
  searchable = false,
  searchPlaceholder = "Search...",
  onSearch,
}: DropdownContentProps) {
  const { isOpen, setIsOpen, isMobile, triggerRef, contentId } = useDropdownContext();
  const contentRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [position, setPosition] = useState<Position>({ top: 0, left: 0, width: 0, flipped: false });
  const [ready, setReady] = useState(false);
  const onSearchRef = useRef(onSearch);
  onSearchRef.current = onSearch;

  // Animation durations
  const DESKTOP_DURATION = 150;
  const MOBILE_DURATION = 250;
  const duration = isMobile ? MOBILE_DURATION : DESKTOP_DURATION;

  const { mounted, visible } = useAnimatedPresence(isOpen, duration);

  // ── Position calculation (desktop) ──
  useLayoutEffect(() => {
    if (isMobile || !mounted || !triggerRef.current) {
      setReady(true);
      return;
    }

    const update = () => {
      if (!triggerRef.current) return;
      const rect = triggerRef.current.getBoundingClientRect();
      const contentEl = contentRef.current;
      const contentHeight = contentEl?.offsetHeight || 280;
      const contentWidth = contentEl?.offsetWidth || 180;

      // Check if dropdown overflows the bottom of the viewport
      const spaceBelow = window.innerHeight - rect.bottom - sideOffset;
      const spaceAbove = rect.top - sideOffset;
      const flipped = spaceBelow < contentHeight && spaceAbove > spaceBelow;

      const top = flipped
        ? rect.top - sideOffset - contentHeight
        : rect.bottom + sideOffset;

      // Calculate left based on alignment
      let left = rect.left;
      if (align === "center") {
        left = rect.left + rect.width / 2 - contentWidth / 2;
      } else if (align === "end") {
        left = rect.right - contentWidth;
      }

      // Clamp to viewport edges (8px margin)
      const margin = 8;
      left = Math.max(margin, Math.min(left, window.innerWidth - contentWidth - margin));

      setPosition({ top, left, width: rect.width, flipped });
      setReady(true);
    };

    // Initial + follow on scroll/resize
    update();
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [mounted, isMobile, align, sideOffset, triggerRef]);

  // ── Click outside ──
  useEffect(() => {
    if (!mounted) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        contentRef.current &&
        !contentRef.current.contains(target) &&
        triggerRef.current &&
        !triggerRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    // Use capture phase so we can stop propagation before the click reaches the page
    document.addEventListener("mousedown", handleClickOutside, true);
    return () => document.removeEventListener("mousedown", handleClickOutside, true);
  }, [mounted, setIsOpen, triggerRef]);

  // ── Keyboard: Escape + arrow navigation ──
  useEffect(() => {
    if (!mounted) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setIsOpen(false);
        // Restore focus to trigger
        triggerRef.current?.focus();
        return;
      }

      if (!contentRef.current) return;
      const items = Array.from(
        contentRef.current.querySelectorAll<HTMLElement>('[role="menuitem"]:not([disabled])')
      );
      if (items.length === 0) return;

      const currentIndex = items.findIndex((el) => el === document.activeElement);

      if (e.key === "ArrowDown") {
        e.preventDefault();
        const next = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
        items[next].focus();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        const prev = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
        items[prev].focus();
      } else if (e.key === "Home") {
        e.preventDefault();
        items[0].focus();
      } else if (e.key === "End") {
        e.preventDefault();
        items[items.length - 1].focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [mounted, setIsOpen, triggerRef]);

  // ── Focus first item on open (desktop) ──
  useEffect(() => {
    if (!visible || isMobile || !contentRef.current) return;
    // Small delay to let animation start
    const timer = setTimeout(() => {
      const first = contentRef.current?.querySelector<HTMLElement>('[role="menuitem"]:not([disabled])');
      first?.focus();
    }, 50);
    return () => clearTimeout(timer);
  }, [visible, isMobile]);

  // ── Body scroll lock (mobile) ──
  useEffect(() => {
    if (!isMobile || !mounted) return;
    const orig = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = orig; };
  }, [isMobile, mounted]);

  // ── Search ──
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setSearchQuery(q);
    onSearchRef.current?.(q);
  };

  useEffect(() => {
    if (!isOpen) {
      setSearchQuery("");
      onSearchRef.current?.("");
    }
  }, [isOpen]);

  // ── Mobile: swipe-to-dismiss ──
  const touchStartY = useRef(0);
  const touchCurrentY = useRef(0);
  const sheetTranslateY = useRef(0);
  const isDragging = useRef(false);
  const sheetRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    touchCurrentY.current = e.touches[0].clientY;
    isDragging.current = true;
    sheetTranslateY.current = 0;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging.current || !sheetRef.current) return;
    touchCurrentY.current = e.touches[0].clientY;
    const dy = touchCurrentY.current - touchStartY.current;
    // Only allow dragging down (positive dy)
    const translate = Math.max(0, dy);
    sheetTranslateY.current = translate;
    sheetRef.current.style.transform = `translateY(${translate}px)`;
    sheetRef.current.style.transition = "none";
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!isDragging.current || !sheetRef.current) return;
    isDragging.current = false;
    const dy = sheetTranslateY.current;

    if (dy > 100) {
      // Dismiss
      sheetRef.current.style.transition = `transform ${MOBILE_DURATION}ms cubic-bezier(0.32, 0.72, 0, 1)`;
      sheetRef.current.style.transform = `translateY(100%)`;
      setTimeout(() => setIsOpen(false), MOBILE_DURATION);
    } else {
      // Snap back
      sheetRef.current.style.transition = `transform ${MOBILE_DURATION}ms cubic-bezier(0.32, 0.72, 0, 1)`;
      sheetRef.current.style.transform = `translateY(0)`;
    }
  }, [setIsOpen]);

  if (!mounted) return null;

  // ── Mobile: Bottom Sheet ──
  if (isMobile) {
    return createPortal(
      <div className="fixed inset-0 z-[100]">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/40"
          style={{
            opacity: visible ? 1 : 0,
            transition: `opacity ${MOBILE_DURATION}ms ease`,
          }}
          onClick={() => setIsOpen(false)}
        />

        {/* Sheet */}
        <div
          ref={(el) => {
            (contentRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
            (sheetRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
          }}
          id={contentId}
          role="menu"
          aria-label={title || "Menu"}
          className={`absolute bottom-0 left-0 right-0 max-h-[85vh] rounded-t-2xl ${className}`}
          style={{
            backgroundColor: "rgb(var(--card))",
            boxShadow: "0 -4px 32px rgba(0,0,0,0.15)",
            transform: visible ? "translateY(0)" : "translateY(100%)",
            transition: isDragging.current ? "none" : `transform ${MOBILE_DURATION}ms cubic-bezier(0.32, 0.72, 0, 1)`,
          }}
        >
          {/* Handle (draggable) */}
          <div
            className="flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing touch-none"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div
              className="w-10 h-1 rounded-full"
              style={{ backgroundColor: "rgb(var(--border))" }}
            />
          </div>

          {/* Header */}
          {title && (
            <div className="px-4 pb-3 border-b" style={{ borderColor: "rgb(var(--border))" }}>
              <h3
                className="text-base font-semibold text-center"
                style={{ color: "rgb(var(--copy-primary))" }}
              >
                {title}
              </h3>
            </div>
          )}

          {/* Search */}
          {searchable && (
            <div className="px-4 py-3 border-b" style={{ borderColor: "rgb(var(--border))" }}>
              <div
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl"
                style={{ backgroundColor: "rgb(var(--surface))" }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "rgb(var(--copy-muted))" }}>
                  <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
                </svg>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder={searchPlaceholder}
                  autoFocus
                  className="flex-1 bg-transparent text-sm outline-none"
                  style={{ color: "rgb(var(--copy-primary))" }}
                />
                {searchQuery && (
                  <button
                    onClick={() => { setSearchQuery(""); onSearchRef.current?.(""); }}
                    className="p-1 rounded-full hover:bg-[rgb(var(--border))]"
                    aria-label="Clear search"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: "rgb(var(--copy-muted))" }}>
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Content */}
          <div className="overflow-y-auto overflow-x-hidden overscroll-contain" style={{ maxHeight: "60vh" }}>
            <div className="py-1.5 px-1.5">{children}</div>
          </div>

          {/* iOS safe area */}
          <div className="h-[env(safe-area-inset-bottom)]" />
        </div>
      </div>,
      document.body
    );
  }

  // ── Desktop: Dropdown ──
  const transformOrigin = position.flipped ? "bottom" : "top";

  return createPortal(
    <div
      ref={contentRef}
      id={contentId}
      role="menu"
      aria-label={title || "Menu"}
      className={`min-w-[160px] max-w-[320px] rounded-lg border overflow-hidden ${className}`}
      style={{
        position: "fixed",
        top: position.top,
        left: position.left,
        zIndex: 9999,
        backgroundColor: "rgb(var(--card))",
        borderColor: "rgb(var(--border))",
        boxShadow: "0 4px 16px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.06)",
        opacity: visible && ready ? 1 : 0,
        transform: visible && ready ? "scale(1) translateY(0)" : `scale(0.97) translateY(${position.flipped ? "4px" : "-4px"})`,
        transformOrigin,
        transition: `opacity ${DESKTOP_DURATION}ms ease, transform ${DESKTOP_DURATION}ms ease`,
        pointerEvents: visible ? "auto" : "none",
      }}
    >
      {/* Header */}
      {title && (
        <div className="px-2.5 py-1.5 border-b" style={{ borderColor: "rgb(var(--border))" }}>
          <span
            className="text-[11px] font-medium uppercase tracking-wider"
            style={{ color: "rgb(var(--copy-muted))" }}
          >
            {title}
          </span>
        </div>
      )}

      {/* Search */}
      {searchable && (
        <div className="p-1.5 border-b" style={{ borderColor: "rgb(var(--border))" }}>
          <div
            className="flex items-center gap-2 px-2 py-1.5 rounded-md"
            style={{ backgroundColor: "rgb(var(--surface))" }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "rgb(var(--copy-muted))" }}>
              <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder={searchPlaceholder}
              autoFocus
              className="flex-1 bg-transparent text-xs outline-none"
              style={{ color: "rgb(var(--copy-primary))" }}
            />
          </div>
        </div>
      )}

      {/* Content */}
      <div className="py-1 max-h-[280px] overflow-y-auto overflow-x-hidden overscroll-contain">
        {children}
      </div>
    </div>,
    document.body
  );
}

// ────────────────────────────────────────────────────────────
// Item
// ────────────────────────────────────────────────────────────

export function DropdownItem({
  children,
  onClick,
  selected = false,
  disabled = false,
  destructive = false,
  className = "",
  closeOnSelect = true,
}: DropdownItemProps) {
  const { setIsOpen, isMobile } = useDropdownContext();

  const handleClick = () => {
    if (disabled) return;
    onClick?.();
    if (closeOnSelect) {
      setIsOpen(false);
    }
  };

  const color = destructive
    ? "rgb(var(--error))"
    : selected
    ? "rgb(var(--cta))"
    : "rgb(var(--copy-primary))";

  return (
    <button
      role="menuitem"
      onClick={handleClick}
      disabled={disabled}
      tabIndex={disabled ? -1 : 0}
      className={`
        w-full flex items-center gap-2.5 text-left transition-colors duration-75 outline-none
        ${isMobile
          ? "px-4 py-3 text-[15px] active:bg-[rgb(var(--surface))]"
          : "px-2.5 py-[7px] text-[13px] rounded-md hover:bg-[rgb(var(--surface))] focus-visible:bg-[rgb(var(--surface))]"
        }
        ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}
        ${selected && !destructive ? "bg-[rgba(var(--cta),0.06)]" : ""}
        ${className}
      `}
      style={{ color }}
    >
      {children}
    </button>
  );
}

// ────────────────────────────────────────────────────────────
// Separator
// ────────────────────────────────────────────────────────────

export function DropdownSeparator({ className = "" }: DropdownSeparatorProps) {
  const { isMobile } = useDropdownContext();

  return (
    <div
      role="separator"
      className={`${isMobile ? "my-1.5 mx-4" : "my-1 mx-2"} ${className}`}
      style={{ height: 1, backgroundColor: "rgb(var(--border))" }}
    />
  );
}

// ────────────────────────────────────────────────────────────
// Label
// ────────────────────────────────────────────────────────────

export function DropdownLabel({ children, className = "" }: DropdownLabelProps) {
  const { isMobile } = useDropdownContext();

  return (
    <div
      className={`
        ${isMobile ? "px-4 py-2 text-xs" : "px-2.5 py-1 text-[10px]"}
        font-semibold uppercase tracking-wider
        ${className}
      `}
      style={{ color: "rgb(var(--copy-muted))" }}
    >
      {children}
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// Empty State
// ────────────────────────────────────────────────────────────

export function DropdownEmpty({ children }: { children: React.ReactNode }) {
  const { isMobile } = useDropdownContext();

  return (
    <div
      className={`${isMobile ? "py-8 px-4" : "py-4 px-3"} text-center`}
      style={{ color: "rgb(var(--copy-muted))" }}
    >
      <p className={isMobile ? "text-base" : "text-sm"}>{children}</p>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// Chevron Icon
// ────────────────────────────────────────────────────────────

export function DropdownChevron({ open }: { open: boolean }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
      style={{ color: "rgb(var(--copy-muted))" }}
    >
      <path d="M3 5L6 8L9 5" />
    </svg>
  );
}

// ────────────────────────────────────────────────────────────
// Default Export
// ────────────────────────────────────────────────────────────

export default SmartDropdown;
