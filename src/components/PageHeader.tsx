import React from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

/**
 * Notion-style page header: big bold title, subtle subtitle, optional action.
 * No decorative icons or boxes.
 */
export default function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <div className="mb-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[rgb(var(--copy-primary))] tracking-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-1 text-sm text-[rgb(var(--copy-muted))]">{subtitle}</p>
          )}
        </div>
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>
    </div>
  );
}
