import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import SideBar from "./components/SideBar";
import Navbar from "./components/Navbar";
import { CommandPalette } from "./components/CommandPalette";
import { AskJournal } from "./components/AskJournal";
import { SidebarProvider, useSidebar } from "./contexts/SidebarContext";

// Pages
import Home from "./pages/Home";
import Notes from "./pages/Notes";
import Notebooks from "./pages/Notebooks";
import Reflect from "./pages/Reflect";
import Settings from "./pages/Settings";
import Archives from "./pages/Archives";
import Tags from "./pages/Tags";
import NoteView from "./pages/NoteView";
import NotebookView from "./pages/NotebookView";
import NewNote from "./pages/CreateNote";
import NewNotebook from "./pages/CreateNotebook";
import Hero from "./pages/Hero";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import NotFound from "./components/NotFound404";

import useValidateUser from "./hooks/useValidateUser";
import { useSelector } from "react-redux";
import type { RootState } from "./redux/store";
import Validating from "./components/IsValidating";
import { Toaster } from "react-hot-toast";
import NewTag from "./pages/CreateTag";
import Mood from "./pages/Mood";
import Favorites from "./pages/Favorites";
import useIsMobile from "./hooks/useIsMobile";
import { useTheme } from "./hooks/useTheme";
import { useFont } from "./hooks/useFont";
import VerifyOTP from "./pages/VerifyOTP";
import React, { useEffect } from "react";

/* ── Global toast styling — minimal, theme-aware ── */
const toastOptions = {
  duration: 2500,
  style: {
    background: "rgb(var(--card))",
    color: "rgb(var(--copy-primary))",
    border: "1px solid rgb(var(--border))",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: "400" as const,
    padding: "8px 14px",
    maxWidth: "360px",
    boxShadow: "0 4px 12px rgba(0,0,0,.08)",
  },
  success: {
    duration: 2000,
    iconTheme: { primary: "rgb(var(--success))", secondary: "rgb(var(--card))" },
  },
  error: {
    duration: 3000,
    iconTheme: { primary: "rgb(var(--error))", secondary: "rgb(var(--card))" },
  },
} as const;

function AppContent() {
  const { sidebarState } = useSidebar();
  const navigate = useNavigate();
  
  // Global Cmd+N shortcut for new note
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "n") {
        e.preventDefault();
        navigate("/new-note");
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [navigate]);

  // Margin based on sidebar state: full = 14rem (224px), mid = 3.5rem (56px), hidden = 0
  const getMarginClass = () => {
    switch (sidebarState) {
      case "full":
        return "sm:ml-56";
      case "mid":
        return "sm:ml-14";
      case "hidden":
        return "sm:ml-0";
    }
  };
  
  return (
    <div className="flex min-h-screen bg-[rgb(var(--background))]">
      <SideBar />
      <CommandPalette />
      <AskJournal />
      <main 
        className={`flex-1 transition-all duration-300 ease-in-out ${getMarginClass()}`}
      >
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/notes" element={<Notes />} />
          <Route path="/notebooks" element={<Notebooks />} />
          <Route path="/tags" element={<Tags />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/reflect" element={<Reflect />} />
          <Route path="/statistics" element={<Navigate to="/reflect" replace />} />
          <Route path="/backup" element={<Navigate to="/settings" replace />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/archives" element={<Archives />} />
          <Route path="/note" element={<NoteView />} />
          <Route path="/mood" element={<Mood />} />
          <Route path="/notebook" element={<NotebookView />} />
          <Route path="/new-note" element={<NewNote />} />
          <Route path="/new-notebook" element={<NewNotebook />} />
          <Route path="/new-tag" element={<NewTag />} />

          {/* Redirects for old routes */}
          <Route path="/my-entries" element={<Navigate to="/notes" replace />} />
          <Route path="/chapters" element={<Navigate to="/notebooks" replace />} />
          <Route path="/collections" element={<Navigate to="/tags" replace />} />
          <Route path="/entry-view" element={<Navigate to="/notes" replace />} />
          <Route path="/chapter-view" element={<Navigate to="/notebooks" replace />} />
          <Route path="/create-entry" element={<Navigate to="/new-note" replace />} />
          <Route path="/create-chapter" element={<Navigate to="/new-notebook" replace />} />
          <Route path="/create-collection" element={<Navigate to="/new-tag" replace />} />

          {/* Catch-all: unknown paths go to Home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function AppLayout() {
  return (
    <SidebarProvider>
      <AppContent />
    </SidebarProvider>
  );
}

const App = () => {
  useValidateUser();
  useTheme(); // Apply saved theme on every page load
  useFont();  // Apply saved font on every page load

  const { isOtpVerified, isValidating, isValidated } = useSelector(
    (state: RootState) => state.auth
  );

  const isMobile = useIsMobile();

  // Block mobile
  if (isMobile) {
    return (
      <div className="flex items-center justify-center min-h-screen px-6 text-center bg-[rgb(var(--background))]">
        <div>
          <h1 className="text-lg font-serif font-bold text-[rgb(var(--copy-primary))] mb-2">
            Desktop Only
          </h1>
          <p className="text-sm text-[rgb(var(--copy-muted))]">
            Pine is designed for larger screens. Please open on a tablet or desktop.
          </p>
        </div>
      </div>
    );
  }

  // Show loader during validation
  if (isValidating) return <Validating />;

  // Authenticated routes
  if (isOtpVerified && isValidated) {
    
    return (
      <>
        <Toaster
          position="bottom-left"
          gutter={6}
          containerStyle={{ bottom: 24, left: 24 }}
          toastOptions={toastOptions}
        />
        <Routes>
          <Route path="/*" element={<AppLayout />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </>
    );
  }

  // Guest routes
  return (
    <>
      <Toaster
        position="bottom-left"
        gutter={6}
        containerStyle={{ bottom: 24, left: 24 }}
        toastOptions={toastOptions}
      />
      <Routes>
        <Route path="/" element={<Hero />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/verifyOtp" element={<VerifyOTP />} />
        <Route path="*" element={<Login />} />
      </Routes>
    </>
  );
};

export default App;
