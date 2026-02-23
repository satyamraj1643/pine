import React from "react";
import Pine from "../assets/pine-transparent.png";

const Validating: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[rgb(var(--background))]">
      <div className="text-center">
        <img src={Pine} alt="Pine" className="w-10 h-10 mx-auto mb-4 opacity-60" />
        <p className="text-sm text-[rgb(var(--copy-muted))]">Loading...</p>
      </div>
    </div>
  );
};

export default Validating;
