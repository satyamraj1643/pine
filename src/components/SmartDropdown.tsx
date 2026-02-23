import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  createContext,
  useContext,
} from "react";
import { createPortal } from "react-dom";

// ────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────

interface DropdownContextValue {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  isMobile: boolean;
  triggerRef: React.RefObject<HTMLDivElement>;
}

interface SmartDropdownProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

interface DropdownTriggerProps {
  children: React.ReactNode;
  className?: string;
  asChild?: boolean;
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
// Hook for mobile detection
// ────────────────────────────────────────────────────────────

const useIsMobile = (breakpoint = 640) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [breakpoint]);

  return isMobile;
};

// ────────────────────────────────────────────────────────────
// Main SmartDropdown Component
// ────────────────────────────────────────────────────────────

export function SmartDropdown({
  children,
  open: controlledOpen,
  onOpenChange,
}: SmartDropdownProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isMobile = useIsMobile();
  const triggerRef = useRef<HTMLDivElement>(null);

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

  // Lock body scroll on mobile when open
  useEffect(() => {
    if (isMobile && isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isMobile, isOpen]);

  return (
    <DropdownContext.Provider value={{ isOpen, setIsOpen, isMobile, triggerRef }}>
      <div className="relative inline-block">{children}</div>
    </DropdownContext.Provider>
  );
}

// ────────────────────────────────────────────────────────────
// Trigger Component
// ────────────────────────────────────────────────────────────

export function DropdownTrigger({
  children,
  className = "",
  asChild = false,
}: DropdownTriggerProps) {
  const { isOpen, setIsOpen, triggerRef } = useDropdownContext();

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      onClick: handleClick,
      ref: triggerRef,
    });
  }

  return (
    <div
      ref={triggerRef as React.RefObject<HTMLDivElement>}
      onClick={handleClick}
      className={`cursor-pointer ${className}`}
    >
      {children}
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// Content Component (Desktop: Dropdown, Mobile: Bottom Sheet)
// ────────────────────────────────────────────────────────────

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
  const { isOpen, setIsOpen, isMobile, triggerRef } = useDropdownContext();
  const contentRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });

  // Calculate position for desktop dropdown
  useEffect(() => {
    if (!isMobile && isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const scrollTop = window.scrollY;
      const scrollLeft = window.scrollX;

      let left = rect.left + scrollLeft;
      if (align === "center") {
        left = rect.left + scrollLeft + rect.width / 2;
      } else if (align === "end") {
        left = rect.right + scrollLeft;
      }

      setPosition({
        top: rect.bottom + scrollTop + sideOffset,
        left,
        width: rect.width,
      });
    }
  }, [isOpen, isMobile, align, sideOffset, triggerRef]);

  // Click outside handler
  useEffect(() => {
    if (!isOpen) return;

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

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, setIsOpen, triggerRef]);

  // Handle search
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch?.(query);
  };

  // Reset search when closed
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery("");
      onSearch?.("");
    }
  }, [isOpen, onSearch]);

  if (!isOpen) return null;

  // Mobile: Bottom Sheet
  if (isMobile) {
    return createPortal(
      <div className="fixed inset-0 z-[100]">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
          onClick={() => setIsOpen(false)}
        />

        {/* Bottom Sheet */}
        <div
          ref={contentRef}
          className={`absolute bottom-0 left-0 right-0 max-h-[85vh] rounded-t-2xl animate-slide-up ${className}`}
          style={{
            backgroundColor: "rgb(var(--card))",
            boxShadow: "0 -4px 32px rgba(0,0,0,0.15)",
          }}
        >
          {/* Handle */}
          <div className="flex justify-center pt-3 pb-2">
            <div
              className="w-10 h-1 rounded-full"
              style={{ backgroundColor: "rgb(var(--border))" }}
            />
          </div>

          {/* Header */}
          {title && (
            <div
              className="px-4 pb-3 border-b"
              style={{ borderColor: "rgb(var(--border))" }}
            >
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
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ color: "rgb(var(--copy-muted))" }}
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" />
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
                    onClick={() => {
                      setSearchQuery("");
                      onSearch?.("");
                    }}
                    className="p-1 rounded-full hover:bg-[rgb(var(--border))]"
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      style={{ color: "rgb(var(--copy-muted))" }}
                    >
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Content */}
          <div className="overflow-y-auto overflow-x-hidden overscroll-contain" style={{ maxHeight: "60vh" }}>
            <div className="py-2 px-2">{children}</div>
          </div>

          {/* Safe area padding for iOS */}
          <div className="h-[env(safe-area-inset-bottom)]" />
        </div>
      </div>,
      document.body
    );
  }

  // Desktop: Regular Dropdown
  const alignmentStyles: React.CSSProperties = {
    position: "absolute",
    top: position.top,
    zIndex: 50,
  };

  if (align === "start") {
    alignmentStyles.left = position.left;
  } else if (align === "center") {
    alignmentStyles.left = position.left;
    alignmentStyles.transform = "translateX(-50%)";
  } else {
    alignmentStyles.left = position.left;
    alignmentStyles.transform = "translateX(-100%)";
  }

  return createPortal(
    <div
      ref={contentRef}
      className={`min-w-[180px] max-w-[320px] rounded-xl border overflow-hidden animate-dropdown-in ${className}`}
      style={{
        ...alignmentStyles,
        backgroundColor: "rgb(var(--card))",
        borderColor: "rgb(var(--border))",
        boxShadow: "0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08)",
      }}
    >
      {/* Header for desktop (optional) */}
      {title && (
        <div
          className="px-3 py-2 border-b"
          style={{ borderColor: "rgb(var(--border))" }}
        >
          <span
            className="text-xs font-medium uppercase tracking-wider"
            style={{ color: "rgb(var(--copy-muted))" }}
          >
            {title}
          </span>
        </div>
      )}

      {/* Search for desktop */}
      {searchable && (
        <div className="p-2 border-b" style={{ borderColor: "rgb(var(--border))" }}>
          <div
            className="flex items-center gap-2 px-2.5 py-2 rounded-lg"
            style={{ backgroundColor: "rgb(var(--surface))" }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ color: "rgb(var(--copy-muted))" }}
            >
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
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
// Item Component
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

  const baseColor = destructive
    ? "rgb(var(--error))"
    : selected
    ? "rgb(var(--cta))"
    : "rgb(var(--copy-primary))";

  const bgColor = selected ? "rgba(var(--cta), 0.08)" : "transparent";

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`
        w-full flex items-center gap-3 text-left transition-all
        ${isMobile ? "px-4 py-3.5 text-base" : "px-3 py-2 text-sm rounded-lg mx-1"}
        ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}
        ${isMobile ? "" : "hover:bg-[rgb(var(--surface))]"}
        ${className}
      `}
      style={{
        color: baseColor,
        backgroundColor: bgColor,
      }}
    >
      {children}
    </button>
  );
}

// ────────────────────────────────────────────────────────────
// Separator Component
// ────────────────────────────────────────────────────────────

export function DropdownSeparator({ className = "" }: DropdownSeparatorProps) {
  const { isMobile } = useDropdownContext();

  return (
    <div
      className={`${isMobile ? "my-2" : "my-1 mx-2"} ${className}`}
      style={{
        height: 1,
        backgroundColor: "rgb(var(--border))",
      }}
    />
  );
}

// ────────────────────────────────────────────────────────────
// Label Component
// ────────────────────────────────────────────────────────────

export function DropdownLabel({ children, className = "" }: DropdownLabelProps) {
  const { isMobile } = useDropdownContext();

  return (
    <div
      className={`
        ${isMobile ? "px-4 py-2 text-xs" : "px-3 py-1.5 text-[10px]"}
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
// Empty State Component
// ────────────────────────────────────────────────────────────

export function DropdownEmpty({ children }: { children: React.ReactNode }) {
  const { isMobile } = useDropdownContext();

  return (
    <div
      className={`
        ${isMobile ? "py-8 px-4" : "py-4 px-3"}
        text-center
      `}
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
// Exports
// ────────────────────────────────────────────────────────────

export default SmartDropdown;
