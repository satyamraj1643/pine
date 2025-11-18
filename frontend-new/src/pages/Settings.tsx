import React, { useState, useEffect } from "react";
import {
  FaCog,
  FaBell,
  FaMoon,
  FaCheckCircle,
  FaInfoCircle,
  FaCheck,
} from "react-icons/fa";
import { useTheme } from "../hooks/useTheme";

const themes = [
  // Core Themes
  { id: "theme-light", name: "Clean Light", category: "light", featured: true },
  { id: "theme-dark", name: "Modern Dark", category: "dark", featured: true },
  {
    id: "theme-light-warm",
    name: "Warm Light",
    category: "light",
    featured: true,
  },
  {
    id: "theme-dark-purple",
    name: "Purple Dark",
    category: "dark",
    featured: true,
  },
  // Specialty Themes
  { id: "theme-ivory", name: "Ivory Paper", category: "light" },
  { id: "theme-sage", name: "Sage & Stone", category: "light" },
  { id: "theme-twilight", name: "Twilight Blue", category: "dark" },
  { id: "theme-lavender", name: "Lavender Mist", category: "light" },
  { id: "theme-honey", name: "Honey & Wheat", category: "light" },
  { id: "theme-midnight", name: "Midnight", category: "dark" },
  { id: "theme-blush", name: "Blush Rose", category: "light" },
  { id: "theme-ocean", name: "Ocean Breeze", category: "light" },
  { id: "theme-autumn", name: "Autumn Ember", category: "light" },
  { id: "theme-forest", name: "Forest Deep", category: "dark" },
  { id: "theme-sunset", name: "Sunset Glow", category: "light" },
  { id: "theme-plum", name: "Plum Velvet", category: "dark" },
  { id: "theme-mint", name: "Mint Fresh", category: "light" },
  { id: "theme-coral", name: "Coral Reef", category: "light" },
  { id: "theme-slate", name: "Slate Modern", category: "dark" },
];

const ToggleSwitch = ({ enabled, onChange, label, description }) => (
  <div className="flex items-start justify-between py-4">
    <div className="flex-1 pr-4">
      <h3 className="text-sm font-medium text-[rgb(var(--copy-primary))] font-serif">
        {label}
      </h3>
      {description && (
        <p className="text-xs text-[rgb(var(--copy-secondary))] mt-1 drop-shadow-sm">
          {description}
        </p>
      )}
    </div>
    <button
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[rgb(var(--cta))] ${
        enabled ? "bg-[rgb(var(--cta))]" : "bg-[rgb(var(--border))]"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          enabled ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  </div>
);

const SettingsSection = ({ title, description, children, icon: Icon }) => (
  <div className="rounded-xl border border-[rgb(var(--border))] mb-6 overflow-hidden bg-[rgb(var(--card))] shadow-sm">
    <div className="flex items-center gap-3 px-6 py-4">
      {Icon && <Icon className="text-[rgb(var(--cta))]" size={18} />}
      <div>
        <h2 className="text-base font-serif font-semibold text-[rgb(var(--copy-primary))]">
          {title}
        </h2>
        {description && (
          <p className="text-sm text-[rgb(var(--copy-secondary))] mt-1 drop-shadow-sm">
            {description}
          </p>
        )}
      </div>
    </div>
    <div className="px-6 py-4">{children}</div>
  </div>
);

const InfoBanner = ({ children }) => (
  <div className="border-l-4 border-[rgb(var(--cta))] pl-3 py-2 mb-4">
    <div className="flex items-start gap-2 text-sm text-[rgb(var(--copy-secondary))]">
      <FaInfoCircle className="mt-0.5 flex-shrink-0 text-[rgb(var(--cta))]" size={16} />
      <div>{children}</div>
    </div>
  </div>
);

export default function Settings() {
  const { setTheme, currentTheme } = useTheme();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [lastLightTheme, setLastLightTheme] = useState("theme-light");
  const [lastDarkTheme, setLastDarkTheme] = useState("theme-dark");

  const currentThemeData = themes.find((theme) => theme.id === currentTheme);
  const isDarkMode = currentThemeData?.category === "dark";

  useEffect(() => {
    if (currentThemeData?.category === "light") {
      setLastLightTheme(currentTheme);
    } else if (currentThemeData?.category === "dark") {
      setLastDarkTheme(currentTheme);
    }
  }, [currentTheme, currentThemeData]);



  const featuredThemes = themes.filter((theme) => theme.featured);
  const lightThemes = themes.filter(
    (theme) => theme.category === "light" && !theme.featured
  );
  const darkThemes = themes.filter(
    (theme) => theme.category === "dark" && !theme.featured
  );

  return (
    <div
      className="min-h-screen px-4 py-8 relative"
    >
      <div className="absolute inset-0 pointer-events-none" />
      <div className="max-w-3xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-[rgb(var(--card))] rounded-lg shadow-sm border border-[rgb(var(--border))]">
              <FaCog className="text-[rgb(var(--cta))]" size={18} />
            </div>
            <h1 className="text-2xl font-serif text-[rgb(var(--copy-primary))] font-semibold drop-shadow-sm">
              Settings
            </h1>
          </div>
          <p className="text-sm text-[rgb(var(--copy-secondary))] drop-shadow-sm">
            Manage your account preferences and app behavior
          </p>
        </div>

        {/* Appearance Section */}
        <SettingsSection
          title="Appearance"
          description="Customize how the application looks and feels"
          icon={FaMoon}
        >
          <InfoBanner>
            Theme preferences are stored locally and persist across sessions.
          </InfoBanner>

          {/* <ToggleSwitch
            enabled={isDarkMode}
            onChange={handleDarkModeToggle}
            label="Dark Mode"
            description="Toggle between light and dark themes"
          /> */}

          <div className="border-t border-[rgb(var(--border))] mt-6 pt-6">
            <h3 className="text-lg font-serif font-semibold text-[rgb(var(--copy-primary))] mb-6">
              Choose Your Palette
            </h3>

            {/* Featured Themes */}
            <div className="mb-8">
              <h4 className="text-sm font-medium text-[rgb(var(--copy-secondary))] mb-4 drop-shadow-sm">
                Recommended
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {featuredThemes.map(({ id, name }) => (
                  <div key={id} className="flex flex-col items-center">
                    <button
                      onClick={() => setTheme(id)}
                      className={`relative w-16 h-24 rounded-xl border-2 overflow-hidden ${id} ${
                        currentTheme === id
                          ? "border-[rgb(var(--cta))] ring-2 ring-[rgb(var(--cta))] ring-opacity-30"
                          : "border-[rgb(var(--border))]"
                      } hover:shadow-md transition-all duration-200`}
                      title={name}
                    >
                      <div className="w-full h-1/6 bg-[rgb(var(--background))]" />
                      <div className="w-full h-1/6 bg-[rgb(var(--surface))]" />
                      <div className="w-full h-1/6 bg-[rgb(var(--card))]" />
                      <div className="w-full h-1/6 bg-[rgb(var(--copy-primary))]" />
                      <div className="w-full h-1/6 bg-[rgb(var(--copy-secondary))]" />
                      <div className="w-full h-1/6 bg-[rgb(var(--cta))]" />
                      {currentTheme === id && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="bg-white rounded-full p-1 shadow-md">
                            <FaCheck className="text-[rgb(var(--cta))]" size={16} />
                          </div>
                        </div>
                      )}
                    </button>
                    <span className="mt-2 text-xs text-[rgb(var(--copy-secondary))] text-center leading-tight font-medium drop-shadow-sm">
                      {name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Light Themes */}
            <div className="mb-8">
              <h4 className="text-sm font-medium text-[rgb(var(--copy-secondary))] mb-4 drop-shadow-sm">
                Light Themes
              </h4>
              <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-3">
                {lightThemes.map(({ id, name }) => (
                  <div key={id} className="flex flex-col items-center">
                    <button
                      onClick={() => setTheme(id)}
                      className={`relative w-12 h-20 rounded-xl border-2 overflow-hidden ${id} ${
                        currentTheme === id
                          ? "border-[rgb(var(--cta))] ring-2 ring-[rgb(var(--cta))] ring-opacity-30"
                          : "border-[rgb(var(--border))]"
                      } hover:shadow-md transition-all duration-200`}
                      title={name}
                    >
                      <div className="w-full h-1/5 bg-[rgb(var(--background))]" />
                      <div className="w-full h-1/5 bg-[rgb(var(--card))]" />
                      <div className="w-full h-1/5 bg-[rgb(var(--surface))]" />
                      <div className="w-full h-1/5 bg-[rgb(var(--copy-primary))]" />
                      <div className="w-full h-1/5 bg-[rgb(var(--cta))]" />
                      {currentTheme === id && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="bg-white rounded-full p-1 shadow-md">
                            <FaCheck className="text-[rgb(var(--cta))]" size={12} />
                          </div>
                        </div>
                      )}
                    </button>
                    <span className="mt-2 text-xs text-[rgb(var(--copy-secondary))] text-center leading-tight drop-shadow-sm">
                      {name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Dark Themes */}
            <div>
              <h4 className="text-sm font-medium text-[rgb(var(--copy-secondary))] mb-4 drop-shadow-sm">
                Dark Themes
              </h4>
              <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-3">
                {darkThemes.map(({ id, name }) => (
                  <div key={id} className="flex flex-col items-center">
                    <button
                      onClick={() => setTheme(id)}
                      className={`relative w-12 h-20 rounded-xl border-2 overflow-hidden ${id} ${
                        currentTheme === id
                          ? "border-[rgb(var(--cta))] ring-2 ring-[rgb(var(--cta))] ring-opacity-30"
                          : "border-[rgb(var(--border))]"
                      } hover:shadow-md transition-all duration-200`}
                      title={name}
                    >
                      <div className="w-full h-1/5 bg-[rgb(var(--background))]" />
                      <div className="w-full h-1/5 bg-[rgb(var(--card))]" />
                      <div className="w-full h-1/5 bg-[rgb(var(--surface))]" />
                      <div className="w-full h-1/5 bg-[rgb(var(--copy-primary))]" />
                      <div className="w-full h-1/5 bg-[rgb(var(--cta))]" />
                      {currentTheme === id && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="bg-white rounded-full p-1 shadow-md">
                            <FaCheck className="text-[rgb(var(--cta))]" size={12} />
                          </div>
                        </div>
                      )}
                    </button>
                    <span className="mt-2 text-xs text-[rgb(var(--copy-secondary))] text-center leading-tight drop-shadow-sm">
                      {name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-[rgb(var(--border))] mt-6 pt-4">
              <div className="flex items-center gap-2 text-sm text-[rgb(var(--copy-secondary))]">
                <FaCheckCircle className="text-[rgb(var(--cta))]" size={16} />
                Changes are applied immediately
              </div>
            </div>
          </div>
        </SettingsSection>

        {/* Notifications Section */}
        <SettingsSection
          title="Notifications"
          description="Control how and when you receive notifications"
          icon={FaBell}
        >
          <ToggleSwitch
            enabled={emailNotifications}
            onChange={setEmailNotifications}
            label="Email Notifications"
            description="Receive important updates and summaries via email"
          />

          <div className="border-t border-[rgb(var(--border))]">
            <ToggleSwitch
              enabled={pushNotifications}
              onChange={setPushNotifications}
              label="Push Notifications"
              description="Get real-time browser alerts"
            />
          </div>

          <div className="border-t border-[rgb(var(--border))] mt-4 pt-4">
            <p className="text-xs text-[rgb(var(--copy-secondary))] drop-shadow-sm">
              You can change these anytime. Some security alerts are required.
            </p>
          </div>
        </SettingsSection>

        {/* Footer */}
        <div className="text-center text-xs text-[rgb(var(--copy-secondary))] mt-8 drop-shadow-sm">
          Settings are saved automatically
        </div>
      </div>
    </div>
  );
}