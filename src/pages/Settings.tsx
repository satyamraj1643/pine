import React, { useState, useEffect } from "react";
import { useTheme } from "../hooks/useTheme";
import PageHeader from "../components/PageHeader";

const themes = [
  { id: "theme-light", name: "Clean Girl", category: "light", featured: true },
  { id: "theme-dark", name: "Y2K Dark", category: "dark", featured: true },
  { id: "theme-light-warm", name: "Cottagecore", category: "light", featured: true },
  { id: "theme-dark-purple", name: "Dark Academia", category: "dark", featured: true },
  { id: "theme-ivory", name: "Vanilla Latte", category: "light" },
  { id: "theme-sage", name: "Soft Sage", category: "light" },
  { id: "theme-twilight", name: "After Hours", category: "dark" },
  { id: "theme-lavender", name: "Soft Lilac", category: "light" },
  { id: "theme-honey", name: "Golden Hour", category: "light" },
  { id: "theme-midnight", name: "Midnight Blue", category: "dark" },
  { id: "theme-blush", name: "Y2K Pink", category: "light" },
  { id: "theme-ocean", name: "Y2K Blue", category: "light" },
  { id: "theme-autumn", name: "Pumpkin Spice", category: "light" },
  { id: "theme-forest", name: "Moss & Stone", category: "dark" },
  { id: "theme-sunset", name: "Peach Fuzz", category: "light" },
  { id: "theme-plum", name: "Grape Soda", category: "dark" },
  { id: "theme-mint", name: "Matcha", category: "light" },
  { id: "theme-coral", name: "Strawberry Glaze", category: "light" },
  { id: "theme-slate", name: "Carbon", category: "dark" },
];

function ThemeSwatch({ id, name, isSelected, onSelect }: {
  id: string;
  name: string;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={`flex flex-col items-center gap-1.5 group ${id}`}
      title={name}
    >
      <div
        className={`w-10 h-16 rounded-lg overflow-hidden border-2 transition-all ${
          isSelected
            ? "border-[rgb(var(--cta))] ring-2 ring-[rgb(var(--cta))]/30"
            : "border-[rgb(var(--border))] group-hover:border-[rgb(var(--copy-muted))]"
        }`}
      >
        <div className="w-full h-1/4 bg-[rgb(var(--background))]" />
        <div className="w-full h-1/4 bg-[rgb(var(--surface))]" />
        <div className="w-full h-1/4 bg-[rgb(var(--copy-primary))]" />
        <div className="w-full h-1/4 bg-[rgb(var(--cta))]" />
      </div>
      <span className="text-[10px] text-[rgb(var(--copy-muted))] text-center leading-tight max-w-[60px]">
        {name}
      </span>
    </button>
  );
}

export default function Settings() {
  const { setTheme, currentTheme } = useTheme();

  const featuredThemes = themes.filter((t) => t.featured);
  const lightThemes = themes.filter((t) => t.category === "light" && !t.featured);
  const darkThemes = themes.filter((t) => t.category === "dark" && !t.featured);

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <PageHeader title="Settings" subtitle="Preferences" />

      {/* Appearance */}
      <section className="mb-10">
        <h2 className="text-sm font-semibold text-[rgb(var(--copy-secondary))] uppercase tracking-wider mb-4">
          Theme
        </h2>

        {/* Featured */}
        <div className="mb-6">
          <p className="text-xs text-[rgb(var(--copy-muted))] mb-3">Recommended</p>
          <div className="flex gap-5 flex-wrap">
            {featuredThemes.map((t) => (
              <ThemeSwatch
                key={t.id}
                id={t.id}
                name={t.name}
                isSelected={currentTheme === t.id}
                onSelect={() => setTheme(t.id)}
              />
            ))}
          </div>
        </div>

        {/* Light */}
        <div className="mb-6">
          <p className="text-xs text-[rgb(var(--copy-muted))] mb-3">Light</p>
          <div className="flex gap-4 flex-wrap">
            {lightThemes.map((t) => (
              <ThemeSwatch
                key={t.id}
                id={t.id}
                name={t.name}
                isSelected={currentTheme === t.id}
                onSelect={() => setTheme(t.id)}
              />
            ))}
          </div>
        </div>

        {/* Dark */}
        <div className="mb-6">
          <p className="text-xs text-[rgb(var(--copy-muted))] mb-3">Dark</p>
          <div className="flex gap-4 flex-wrap">
            {darkThemes.map((t) => (
              <ThemeSwatch
                key={t.id}
                id={t.id}
                name={t.name}
                isSelected={currentTheme === t.id}
                onSelect={() => setTheme(t.id)}
              />
            ))}
          </div>
        </div>

        <p className="text-xs text-[rgb(var(--copy-muted))]">
          Changes apply immediately and persist across sessions.
        </p>
      </section>
    </div>
  );
}
