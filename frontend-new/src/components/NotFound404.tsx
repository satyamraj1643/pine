import React, { useEffect, useState } from "react";
import { FaArrowLeft, FaHome, FaExclamationTriangle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Pine from "../assets/pine-transparent.png";

const NotFound: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleBack = () => {
    navigate(-1);
  };

  const handleGoHome = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-6">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={handleBack}
              className="p-2 rounded-full bg-white text-gray-700 hover:bg-gray-200 hover:text-blue-600 transition-all duration-200 shadow-sm"
              aria-label="Go back"
              type="button"
            >
              <FaArrowLeft size={16} />
            </button>
            <div className="p-2 bg-white rounded-full shadow-sm">
              <FaExclamationTriangle className="text-xl text-amber-600" />
            </div>
            <div>
              <h1 className="text-2xl font-serif text-gray-800 font-bold">
                Page Not Found
              </h1>
              <p className="text-gray-600 text-sm mt-1">
                This chapter hasn't been written yet
              </p>
            </div>
          </div>
        </div>

        {/* Content Card */}
        <div className="rounded-2xl bg-white shadow-lg overflow-hidden">
          <div className="h-1 bg-blue-600" />
          <div className="p-6">
            {/* Pine Logo */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-blue-100 rounded-3xl flex items-center justify-center shadow-sm">
                  <img
                    src={Pine}
                    alt="Pine Logo"
                    className="w-12 h-12 object-contain"
                  />
                </div>
              </div>
            </div>

            {/* 404 Message */}
            <div className="text-center mb-6">
              <div className="text-6xl font-bold text-gray-300 mb-2">404</div>
              <p className="text-gray-600 text-sm leading-relaxed">
                It seems this chapter hasn't been written yet. Let's find your way back to your journaling journey.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleGoHome}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all duration-200"
                aria-label="Return to home page"
                type="button"
              >
                <FaHome className="text-xs" />
                Return Home
              </button>
              
              <button
                onClick={handleBack}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium rounded-lg text-gray-700 bg-gray-100 hover:bg-gray-200 focus:ring-4 focus:ring-gray-200 transition-all duration-200"
                aria-label="Go back to previous page"
                type="button"
              >
                <FaArrowLeft className="text-xs" />
                Go Back
              </button>
            </div>

            {/* Inspirational Quote */}
            <div className="mt-6 pt-6 border-t border-gray-100">
              <div className="bg-blue-50 border border-blue-100 text-sm text-blue-800 rounded-lg px-4 py-3">
                <div className="flex items-start gap-2">
                  <svg className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <p className="italic">
                    "Sometimes, a detour leads to the most beautiful stories."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;