import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FaPlusCircle,
  FaArrowLeft,
  FaCheck,
  FaTimes,
  FaTag,
  FaPalette,
} from "react-icons/fa";
import { createCollection } from "../APIs";
import toast from "react-hot-toast";

// Color options for collections using hex values
const collectionColors = [
  { name: "Sunset Orange", value: "#FF5722" },   // rgb(255, 87, 34)
  { name: "Ocean Blue", value: "#007BFF" },      // rgb(0, 123, 255)
  { name: "Forest Green", value: "#28A745" },    // rgb(40, 167, 69)
  { name: "Rose Pink", value: "#DC3545" },       // rgb(220, 53, 69)
  { name: "Violet Purple", value: "#6F42C1" },   // rgb(111, 66, 193)
  { name: "Slate Gray", value: "#6C757D" },      // rgb(108, 117, 125)
  { name: "Sage Green", value: "#ADBE98" },      // rgb(173, 190, 152)
  { name: "Lavender", value: "#CCCCFF" },        // rgb(204, 204, 255)
];

interface CollectionColor {
  name: string;
  value: string;
}

const CreateCollection: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Form state
  const [name, setName] = useState(location.state || "");
  const [selectedColor, setSelectedColor] = useState<CollectionColor | { name: string; value: string }>(collectionColors[0]);
  const [customColor, setCustomColor] = useState("#ffffff");
  const [isCreating, setIsCreating] = useState(false);

  const handleBack = () => {
    navigate(-1);
  };

  const handleCreate = async () => {
    if (!name.trim()) return;

    const newCollection = {
      name: name.trim(),
      color: selectedColor.value,
      slug: null,
    };

    setIsCreating(true);

    try {
      const result = await createCollection(newCollection);

      setIsCreating(false);

      if (typeof result === "string" || result instanceof Error) {
        // Handle error (statusText or Error object)
        const errorMessage = typeof result === "string" ? result : result.message || "Failed to create tag.";
        toast.error(errorMessage);
      } else {
        // Success: result is Collections object
        toast.success(`Tag "${name}" created!`);
        navigate("/tags");
      }
    } catch (error) {
      setIsCreating(false);
      // Unexpected error not caught by createCollection
      toast.error("An unexpected error occurred.");
      console.error("Unexpected error:", error);
    }
  };

  const handleCancel = () => {
    setName("");
    setSelectedColor(collectionColors[0]);
    setCustomColor("#ffffff");
    navigate(-1);
  };

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    setCustomColor(newColor);
    setSelectedColor({ name: "Custom Color", value: newColor });
  };

  const isFormValid = name.trim();

  // Display hex value in uppercase
  const displayColorValue = () => {
    return selectedColor.value.toUpperCase();
  };

  return (
    <div 
      className="min-h-screen"
      style={{ backgroundColor: 'rgb(var(--background))' }}
    >
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={handleBack}
              className="p-2 rounded-lg hover:opacity-80 transition-all duration-200 border shadow-sm"
              style={{ 
                backgroundColor: 'rgb(var(--card))',
                color: 'rgb(var(--copy-secondary))',
                borderColor: 'rgb(var(--border))'
              }}
              aria-label="Go back"
            >
              <FaArrowLeft className="text-sm" />
            </button>
            <div 
              className="p-2 rounded-lg shadow-sm border"
              style={{ 
                backgroundColor: 'rgba(var(--accent), 0.1)',
                borderColor: 'rgba(var(--accent), 0.2)'
              }}
            >
              <FaTag 
                className="text-lg"
                style={{ color: 'rgb(var(--accent))' }}
              />
            </div>
            <div>
              <h1 
                className="text-2xl font-serif font-semibold"
                style={{ color: 'rgb(var(--copy-primary))' }}
              >
                New Tag
              </h1>
              <p 
                className="text-sm"
                style={{ color: 'rgb(var(--copy-secondary))' }}
              >
                Create a tag to organize your notes
              </p>
            </div>
          </div>
        </div>

        {/* Main Form */}
        <div 
          className="rounded-xl shadow-sm border overflow-hidden"
          style={{ 
            backgroundColor: 'rgb(var(--card))',
            borderColor: 'rgb(var(--border))'
          }}
        >
          {/* Color accent bar */}
          <div 
            className="h-1.5"
            style={{ backgroundColor: selectedColor.value }}
          />

          <div className="p-6 space-y-6">
            {/* Form Controls */}
            <div className="flex flex-col lg:flex-row gap-6 items-start">
              {/* Name Input */}
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Tag name..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-0 py-2 bg-transparent border-none text-xl font-serif focus:outline-none focus:ring-0"
                  style={{ 
                    color: 'rgb(var(--copy-primary))',
                    '::placeholder': { color: 'rgb(var(--copy-muted))' }
                  } as React.CSSProperties}
                  autoFocus
                />
                <div 
                  className="h-px mt-2"
                  style={{ backgroundColor: 'rgb(var(--border))' }}
                />
              </div>

              {/* Color Selection */}
              <div className="w-full lg:w-72">
                <div className="flex items-center gap-2 mb-3">
                  <FaPalette 
                    className="text-sm"
                    style={{ color: 'rgb(var(--copy-primary))' }}
                  />
                  <h3 
                    className="text-sm font-medium"
                    style={{ color: 'rgb(var(--copy-primary))' }}
                  >
                    Select Color
                  </h3>
                </div>
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  {collectionColors.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => setSelectedColor(color)}
                      className="w-6 h-6 rounded-full border hover:scale-110 transition-transform"
                      style={{ 
                        backgroundColor: color.value,
                        borderColor: selectedColor.name === color.name ? 'rgb(var(--cta))' : 'rgb(var(--border))',
                        borderWidth: selectedColor.name === color.name ? '2px' : '1px'
                      }}
                      title={color.name}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative w-6 h-6">
                    <input
                      type="color"
                      value={customColor}
                      onChange={handleCustomColorChange}
                      className="absolute w-10 h-10 p-0 border-none cursor-pointer"
                      style={{ 
                        top: '-8px', 
                        left: '-8px',
                        opacity: 0,
                        zIndex: 10
                      }}
                    />
                    <button
                      onClick={() => {
                        const input = document.querySelector('input[type="color"]') as HTMLInputElement;
                        input?.click();
                      }}
                      className="absolute w-6 h-6 rounded-full border hover:scale-110 transition-transform"
                      style={{ 
                        backgroundColor: customColor,
                        borderColor: selectedColor.name === "Custom Color" ? 'rgb(var(--cta))' : 'rgb(var(--border))',
                        borderWidth: selectedColor.name === "Custom Color" ? '2px' : '1px',
                        zIndex: 5
                      }}
                      title="Choose your own color"
                    />
                  </div>
                  <span 
                    className="text-xs font-mono px-2 py-1 rounded border"
                    style={{ 
                      color: 'rgb(var(--copy-secondary))',
                      borderColor: 'rgb(var(--border))',
                      backgroundColor: 'rgb(var(--surface))'
                    }}
                  >
                    {displayColorValue()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-4 mt-8">
          <button
            onClick={handleCancel}
            className="px-6 py-2.5 border rounded-lg hover:opacity-80 transition-all"
            style={{ 
              backgroundColor: 'transparent',
              color: 'rgb(var(--copy-secondary))',
              borderColor: 'rgb(var(--border))'
            }}
            disabled={isCreating}
          >
            Cancel
          </button>
          
          <button
            onClick={handleCreate}
            disabled={!isFormValid || isCreating}
            className={`px-6 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2 ${
              isFormValid && !isCreating ? 'shadow-sm' : 'cursor-not-allowed'
            }`}
            style={{
              backgroundColor: isFormValid && !isCreating ? 'rgb(var(--cta))' : 'rgb(var(--copy-muted))',
              color: 'rgb(var(--cta-text))',
              opacity: isFormValid && !isCreating ? 1 : 0.6
            }}
          >
            {isCreating ? (
              <svg className="animate-spin h-5 w-5 text-rgb(var(--cta-text))" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <FaCheck className="text-sm" />
            )}
            {isCreating ? "Creating..." : "Create Tag"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateCollection;