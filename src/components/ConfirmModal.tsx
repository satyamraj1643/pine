import React from "react";
import { FaTimes, FaExclamationTriangle } from "react-icons/fa";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  itemName?: string;
  isProcessing?: boolean;
  confirmText?: string;
  variant?: "danger" | "warning" | "info";
}

const variantStyles = {
  danger: "bg-[rgb(var(--error))] hover:opacity-90",
  warning: "bg-amber-600 hover:bg-amber-700",
  info: "bg-[rgb(var(--cta))] hover:bg-[rgb(var(--cta-active))]",
};

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  itemName,
  isProcessing = false,
  confirmText = "Confirm",
  variant = "danger",
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={isProcessing ? undefined : onClose} />
      <div className="relative bg-[rgb(var(--card))] rounded-lg border border-[rgb(var(--border))] max-w-sm w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[rgb(var(--border))]">
          <h3 className="text-sm font-semibold text-[rgb(var(--copy-primary))]">{title}</h3>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="p-1 rounded hover:bg-[rgb(var(--surface))] transition-colors disabled:opacity-50"
          >
            <FaTimes className="text-xs text-[rgb(var(--copy-muted))]" />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4">
          <p className="text-sm text-[rgb(var(--copy-secondary))] leading-relaxed">{message}</p>
          {itemName && (
            <p className="mt-2 text-sm font-medium text-[rgb(var(--copy-primary))]">"{itemName}"</p>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-5 py-3 border-t border-[rgb(var(--border))] bg-[rgb(var(--surface))] rounded-b-lg">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="px-3 py-1.5 text-sm text-[rgb(var(--copy-secondary))] hover:bg-[rgb(var(--card))] rounded transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isProcessing}
            className={`px-3 py-1.5 text-sm text-white rounded transition-colors disabled:opacity-50 ${variantStyles[variant]}`}
          >
            {isProcessing ? "Processing..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
