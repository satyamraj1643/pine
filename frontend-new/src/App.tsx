import { Route, Routes } from "react-router-dom";
import SideBar from "./components/SideBar";

// Pages
import Home from "./pages/Home";
import RecentEntries from "./pages/RecentEntries";
import Chapters from "./pages/Chapters";
import Statistics from "./pages/Statistics";
import Backup from "./pages/Backup";
import Settings from "./pages/Settings";
import Archives from "./pages/Archives";
import Collections from "./pages/Collections";
import EntryView from "./pages/EntryView";
import ChapterView from "./pages/ChapterView";
import CreateEntry from "./pages/CreateEntry";
import CreateChapter from "./pages/CreateChapter";
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
import CreateCollection from "./pages/CreateCollection";
import Mood from "./pages/Mood";
import useIsMobile from "./hooks/useIsMobile";
import VerifyOTP from "./pages/VerifyOTP";

const App = () => {
  useValidateUser();

  const {
    isOtpVerified,
    isLoggedIn,
    isValidating,
  } = useSelector((state: RootState) => state.auth);

  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "2rem",
          fontSize: "1.2rem",
          fontFamily: "sans-serif",
        }}
      >
        📱 You can't possibly write a journal on mobile, try opening on tablet/desktop!
      </div>
    );
  }

  // ⏳ Show loader only during validation
  if (isValidating) return <Validating />;

  // 🔐 User has JWT but OTP is NOT verified
  if (isLoggedIn && !isOtpVerified) {
    return (
      <>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/verifyOtp" element={<VerifyOTP />} />
          <Route path="*" element={<VerifyOTP />} />
        </Routes>
      </>
    );
  }

  // 🟩 User is logged in + OTP verified → full app
  if (isLoggedIn && isOtpVerified) {
    return (
      <>
        <Toaster position="top-right" />
        <div className="flex">
          <SideBar />
          <div className="flex-1 bg-[rgb(var(--background))] p-4 ml-64">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/my-entries" element={<RecentEntries />} />
              <Route path="/chapters" element={<Chapters />} />
              <Route path="/collections" element={<Collections />} />
              <Route path="/statistics" element={<Statistics />} />
              <Route path="/backup" element={<Backup />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/archives" element={<Archives />} />
              <Route path="/entry-view" element={<EntryView />} />
              <Route path="/mood" element={<Mood />} />
              <Route path="/chapter-view" element={<ChapterView />} />
              <Route path="/create-entry" element={<CreateEntry />} />
              <Route path="/create-chapter" element={<CreateChapter />} />
              <Route path="/create-collection" element={<CreateCollection />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </div>
      </>
    );
  }

  // 🚪 Not logged in → show guest routes
  return (
    <>
      <Toaster position="top-right" />
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
