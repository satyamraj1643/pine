import { Navigate, Route, Routes } from "react-router-dom";
import SideBar from "./components/SideBar";
import { SidebarProvider, useSidebar } from "./contexts/SidebarContext";

// Pages
import Home from "./pages/Home";
import Notes from "./pages/RecentEntries";
import Notebooks from "./pages/Chapters";
import Statistics from "./pages/Statistics";
import Backup from "./pages/Backup";
import Settings from "./pages/Settings";
import Archives from "./pages/Archives";
import Tags from "./pages/Collections";
import NoteView from "./pages/EntryView";
import NotebookView from "./pages/ChapterView";
import NewNote from "./pages/CreateEntry";
import NewNotebook from "./pages/CreateChapter";
import Hero from "./pages/Hero";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import NotFound from "./components/NotFound404";

import useValidateUser from "./hooks/useValidateUser";
import { useSelector } from "react-redux";
import type { RootState } from "./redux/store";
import Validating from "./components/IsValidating";
import { Toaster } from "react-hot-toast";
import RequestPasswordReset from "./pages/RequestPasswordReset";
import ResetPassword from "./pages/ConfirmPassword";
import NewTag from "./pages/CreateCollection";
import Mood from "./pages/Mood";
import useIsMobile from "./hooks/useIsMobile";
import VerifyOTP from "./pages/VerifyOTP";

/* ── Global toast styling (theme-aware) ── */
const toastOptions = {
  duration: 3500,
  style: {
    background: "rgb(var(--card))",
    color: "rgb(var(--copy-primary))",
    border: "1px solid rgb(var(--border))",
    borderRadius: "12px",
    fontSize: "14px",
    fontWeight: "500",
    padding: "12px 16px",
    gap: "10px",
    maxWidth: "420px",
    boxShadow:
      "0 8px 30px -4px rgba(0,0,0,.12), 0 2px 6px rgba(0,0,0,.04)",
  },
  success: {
    duration: 3000,
    iconTheme: {
      primary: "rgb(var(--success))",
      secondary: "rgb(var(--card))",
    },
  },
  error: {
    duration: 4000,
    iconTheme: {
      primary: "rgb(var(--error))",
      secondary: "rgb(var(--card))",
    },
  },
} as const;

function AppContent() {
  const { sidebarState } = useSidebar();
  
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
      <main 
        className={`flex-1 transition-all duration-300 ease-in-out ${getMarginClass()}`}
      >
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/notes" element={<Notes />} />
          <Route path="/notebooks" element={<Notebooks />} />
          <Route path="/tags" element={<Tags />} />
          <Route path="/statistics" element={<Statistics />} />
          <Route path="/backup" element={<Backup />} />
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
          position="top-center"
          gutter={8}
          containerStyle={{ top: 20 }}
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
        position="top-center"
        gutter={8}
        containerStyle={{ top: 20 }}
        toastOptions={toastOptions}
      />
      <Routes>
        <Route path="/" element={<Hero />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/verifyOtp" element={<VerifyOTP />} />
        <Route path="/reset_password" element={<RequestPasswordReset />} />
        <Route
          path="/password/reset/confirm/:uid/:token"
          element={<ResetPassword />}
        />
        <Route path="*" element={<Login />} />
      </Routes>
    </>
  );
};

export default App;
