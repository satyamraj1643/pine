import React from "react";

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

/**
 * Minimal empty state with text only. No decorative icons or backgrounds.
 */
export default function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <h3 className="text-base font-medium text-[rgb(var(--copy-primary))] mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-[rgb(var(--copy-muted))] max-w-sm">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
