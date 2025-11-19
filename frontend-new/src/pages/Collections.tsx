import React, { useState, useEffect, useRef } from "react";
import {
  FaTag,
  FaSearch,
  FaSortAlphaDown,
  FaClock,
  FaFilter,
  FaHeart,
  FaBookOpen,
  FaHashtag,
  FaArrowUp,
  FaArrowDown,
  FaBook,
  FaFileAlt,
  FaPlus,
  FaTimes,
  FaPenNib,
  FaWatchmanMonitoring,
} from "react-icons/fa";
import { GetAllCollections, DeleteCollection } from "../APIs";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { FaRegClock } from "react-icons/fa6";



const formatDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  //@ts-ignore
  const diffInMinutes = Math.floor((now - date) / (1000 * 60));



  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  } else if (diffInMinutes < 1440) {
    const hours = Math.floor(diffInMinutes / 60);
    return `${hours}h ago`;
  } else if (diffInMinutes < 10080) {
    const days = Math.floor(diffInMinutes / 1440);
    return `${days}d ago`;
  } else {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }
};



const SkeletonCard = () => (
  <div className="rounded-xl overflow-hidden bg-[rgb(var(--card))] flex transition-all duration-200 border border-[rgb(var(--border))] animate-pulse">
    {/* Color accent ribbon skeleton */}
    <div className="w-1.5 bg-gray-300" />
  
    {/* Card Content */}
    <div className="flex-1 p-3">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
         <div className="w-8 h-8 rounded-lg bg-gray-300 flex-shrink-0" />
         <div className="h-4 bg-gray-300 rounded flex-1 max-w-24" />
        </div>
      </div>



      <div className="space-y-2">
        <div className="flex items-center gap-1">
         <div className="w-3 h-3 bg-gray-200 rounded" />
         <div className="h-3 bg-gray-200 rounded w-16" />
        </div>
        <div className="flex items-center gap-1">
         <div className="w-3 h-3 bg-gray-200 rounded" />
         <div className="h-3 bg-gray-200 rounded w-14" />
        </div>
        <div className="flex items-center gap-1">
         <div className="w-3 h-3 bg-gray-200 rounded" />
         <div className="h-3 bg-gray-200 rounded w-20" />
        </div>
      </div>
    </div>



    {/* Delete Button skeleton */}
    <div className="w-10 bg-gray-100 border-l border-[rgb(var(--border))]" />
  </div>
);



const SkeletonLoader = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {[...Array(6)].map((_, index) => (
      <SkeletonCard key={index} />
    ))}
  </div>
);



const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, tagName, isDeleting }) => {
  if (!isOpen) return null;



  return (
    <div className={`fixed inset-0 flex items-center justify-center z-50 bg-[rgb(var(--background))] bg-opacity-20 backdrop-blur-sm ${isDeleting ? 'pointer-events-none' : ''}`}>
      <div className="bg-[rgb(var(--card))] rounded-xl shadow-lg border border-[rgb(var(--border))] max-w-sm w-full p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-serif text-[rgb(var(--copy-primary))]">
            Delete Collection
          </h3>
          <button
            onClick={onClose}
            disabled={isDeleting}
            className={`p-1 rounded-full hover:bg-[rgb(var(--surface))] transition-colors ${isDeleting ? 'opacity-50 cursor-not-allowed' : ''}`}
            aria-label="Close modal"
          >
            <FaTimes className="text-[rgb(var(--copy-muted))] text-sm" />
          </button>
        </div>
        <p className="text-sm text-[rgb(var(--copy-secondary))] mb-4">
          Are you sure you want to delete the collection "{tagName}"? This
          action cannot be undone.
        </p>
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="px-3 py-2 bg-[rgb(var(--surface))] text-[rgb(var(--copy-secondary))] rounded-lg text-sm hover:bg-[rgb(var(--border))] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              isDeleting
                ? "bg-[rgb(var(--error))] opacity-70 cursor-not-allowed"
                : "bg-[rgb(var(--error))] hover:opacity-80"
            } text-white`}
          >
            {isDeleting ? (
              <>
                <svg
                  className="animate-spin h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};



const Collections = () => {
  const [tags, setTags] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTag, setSelectedTag] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const dropdownRefs = useRef({});
  const navigate = useNavigate();



  const getData = async () => {
    try {
      setIsLoading(true);
      const response = await GetAllCollections();
      console.log("Getting the response in collections", response.data)
      if (response && Array.isArray(response.data)) {
        setTags(response.data);
        setError(null);
      } else {
        setError("Failed to load collections: Invalid data format");
      }
    } catch (err) {
      setError("Failed to load collections. Please try again later.");
      console.error("Error fetching collections:", err);
    } finally {
      setIsLoading(false);
    }
  };



  useEffect(() => {
    getData();
  }, []);



  useEffect(() => {
    const handleClickOutside = (event) => {
      const sortDropdownRef = dropdownRefs.current["sort"];
      if (sortDropdownRef && !sortDropdownRef.contains(event.target)) {
        setActiveDropdown(null);
      }
    };



    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);



  const filteredAndSortedTags = tags
    .filter((tag) =>
      tag.Name.toLowerCase().includes(searchTerm.toLowerCase().trim())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "chapters":
          return sortOrder === "asc"
            ? (a.Chapters || 0) - (b.Chapters || 0)
            : (b.Chapters || 0) - (a.Chapters || 0);
        case "entries":
          return sortOrder === "asc"
            ? (a.Entries || 0) - (b.Entries || 0)
            : (b.Entries || 0) - (a.Entries || 0);
        case "recent":
          //@ts-ignore
          return sortOrder === "asc"
            ? //@ts-ignore
              new Date(a.LastUsed) - new Date(b.LastUsed)
            : //@ts-ignore
              new Date(b.LastUsed) - new Date(a.LastUsed);
        case "name":
        default:
          return sortOrder === "asc"
            ? a.Name.localeCompare(b.Name)
            : b.Name.localeCompare(a.Name);
      }
    });



  const toggleDropdown = (id, event) => {
    event.stopPropagation();
    setActiveDropdown(activeDropdown === id ? null : id);
  };



  const getSortLabel = () => {
    switch (sortBy) {
      case "chapters":
        return "Chapters Used";
      case "entries":
        return "Entries Used";
      // case "recent":
      //   return "Recently Used";
      case "name":
      default:
        return "Alphabetical";
    }
  };



  const handleCreateCollection = () => {
    navigate("/create-collection");
  };



  const handleDeleteClick = async (id: number, name: string) => {
    setIsDeleting(true);
    try {
      const isDeleted = await DeleteCollection(id);

      if (isDeleted) {
        toast.success(`Collection "${name}" deleted successfully.`);
        await getData(); // Refresh the list
      } else {
        toast.error("Failed to delete collection.");
      }
    } catch (err) {
      toast.error("An error occurred while deleting.");
      console.error("Delete error:", err);
    } finally {
      setIsDeleting(false);
    }
  };



  const openDeleteModal = (tag) => {
    setSelectedTag(tag);
    setIsModalOpen(true);
  };



  const confirmDelete = async () => {
    if (selectedTag) {
      await handleDeleteClick(selectedTag.ID, selectedTag.Name);
    }
    setIsModalOpen(false);
    setSelectedTag(null);
  };



  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedTag(null);
  };



  return (
    <div className="min-h-screen bg-[rgb(var(--background))]">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-[rgb(var(--card))] rounded-lg shadow-sm border border-[rgb(var(--border))]">
            <FaBookOpen className="text-amber-600 text-lg" />
          </div>
          <div>
            <h1 className="text-2xl font-serif text-[rgb(var(--copy-primary))] font-semibold">
              My Collections
            </h1>
            <p
              className="text-sm mt-1"
              style={{ color: "rgb(var(--copy-secondary))" }}
            >
              Organise your stories in a meaningful way.
            </p>
          </div>
        </div>



        {/* Search and Controls */}
        <div className="mb-8">
          <div className="bg-[rgb(var(--card))] rounded-xl p-4 shadow-sm ring-1 ring-[rgb(var(--border))]">
            <div className="flex flex-col md:flex-row gap-3 justify-between items-center">
              <div className="relative flex-1 max-w-md w-full">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgb(var(--copy-muted))]">
                  <FaSearch className="text-xs" />
                </div>
                <input
                  type="text"
                  placeholder="Search collections"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  disabled={isLoading}
                  className="w-full pl-8 pr-3 py-2 bg-[rgb(var(--surface))] border border-[rgb(var(--border))] rounded-lg text-sm text-[rgb(var(--copy-primary))] focus:ring-2 focus:ring-[rgb(var(--cta))] focus:border-transparent transition-all font-light placeholder-[rgb(var(--copy-muted))] disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>



              <div className="flex gap-3 items-center">
                <div
                  className="relative"
                  // @ts-ignore
                  ref={(el) => (dropdownRefs.current["sort"] = el)}
                >
                  <button
                    onClick={(e) => toggleDropdown("sort", e)}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-3 py-2 bg-[rgb(var(--surface))] rounded-lg text-sm border border-[rgb(var(--border))] hover:opacity-80 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FaFilter className="text-[rgb(var(--copy-muted))] text-xs" />
                    <span className="text-[rgb(var(--copy-secondary))]">
                      {getSortLabel()}
                    </span>
                  </button>



                  {activeDropdown === "sort" && !isLoading && (
                    <div className="absolute right-0 top-full mt-1 w-48 bg-[rgb(var(--card))] rounded-lg shadow-md border border-[rgb(var(--border))] z-20">
                      {[
                        {
                          label: "Alphabetical",
                          value: "name",
                          icon: FaSortAlphaDown,
                        },
                        // {
                        //   label: "Recently Used",
                        //   value: "recent",
                        //   icon: FaClock,
                        // },
                        {
                          label: "Chapters Used",
                          value: "chapters",
                          icon: FaBook,
                        },
                        {
                          label: "Entries Used",
                          value: "entries",
                          icon: FaFileAlt,
                        },
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() => {
                            setSortBy(option.value);
                            setActiveDropdown(null);
                          }}
                          className={`w-full text-left px-4 py-2 hover:bg-[rgb(var(--surface))] flex items-center gap-2 text-sm border-b border-[rgb(var(--border))] last:border-b-0 ${
                            sortBy === option.value
                              ? "bg-amber-50 text-amber-600"
                              : "text-[rgb(var(--copy-primary))]"
                          }`}
                        >
                          <option.icon className="text-xs" />
                          <span>{option.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>



                <button
                  onClick={() =>
                    setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                  }
                  disabled={isLoading}
                  className="flex items-center gap-2 px-3 py-2 bg-[rgb(var(--surface))] rounded-lg text-sm border border-[rgb(var(--border))] hover:opacity-80 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sortOrder === "asc" ? (
                    <>
                      <FaArrowUp className="text-[rgb(var(--cta))] text-xs" />
                      <span className="text-[rgb(var(--copy-secondary))]">
                        Asc
                      </span>
                    </>
                  ) : (
                    <>
                      <FaArrowDown className="text-[rgb(var(--cta))] text-xs" />
                      <span className="text-[rgb(var(--copy-secondary))]">
                        Desc
                      </span>
                    </>
                  )}
                </button>



                <button
                  onClick={handleCreateCollection}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:opacity-80 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: "rgba(var(--success), 0.1)",
                    color: "rgb(var(--success))",
                  }}
                >
                  <FaPlus className="text-xs" />
                  <span>Create Collection</span>
                </button>
              </div>
            </div>
          </div>
        </div>



        {/* Loading State */}
        {isLoading && <SkeletonLoader />}



        {/* Error State */}
        {error && !isLoading && (
          <div className="text-center py-12">
            <div className="relative inline-block mb-6">
              <div className="absolute -top-1 -left-1 w-full h-full bg-[rgb(var(--error-subtle))] rounded-full transform rotate-12 opacity-60"></div>
              <div className="relative p-6 rounded-full bg-[rgb(var(--card))] shadow-sm ring-1 ring-[rgb(var(--border))]">
                <FaTag className="text-2xl text-[rgb(var(--error))]" />
              </div>
            </div>
            <h3 className="text-xl font-serif font-semibold text-[rgb(var(--copy-primary))] mb-2">
              Error Loading Collections
            </h3>
            <p className="text-[rgb(var(--copy-secondary))] text-sm mb-4">
              {error}
            </p>
            <button
              onClick={getData}
              className="px-3 py-2 bg-[rgb(var(--cta))] text-[rgb(var(--cta-text))] rounded-lg text-sm font-medium shadow-sm hover:bg-[rgb(var(--cta-active))]"
            >
              Retry
            </button>
          </div>
        )}



        {/* Tags Grid */}
        {!error && !isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAndSortedTags.map((tag) => (
              <div
                key={tag.ID}
                className="rounded-xl overflow-hidden bg-[rgb(var(--card))] flex transition-all duration-200 border border-[rgb(var(--border))] hover:shadow-md"
              >
                {/* Color accent ribbon */}
                <div className="w-1.5" style={{ backgroundColor: tag.Color }} />



                {/* Card Content */}
                <div className="flex-1 p-3">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-white flex-shrink-0"
                        style={{ backgroundColor: tag.Color }}
                      >
                        <FaHashtag className="text-xs" />
                      </div>
                      <h3 className="text-sm font-medium text-[rgb(var(--copy-primary))] capitalize truncate">
                        {tag.Name}
                      </h3>
                    </div>
                  </div>



                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-[rgb(var(--copy-secondary))] text-xs">
                      <FaBookOpen className="text-xs" />
                      <span>{tag.Chapters || 0} chapters</span>
                    </div>
                    <div className="flex items-center gap-1 text-[rgb(var(--copy-secondary))] text-xs">
                      <FaPenNib className="text-xs" />
                      <span>{tag.Entries || 0} entries</span>
                    </div>
                    {/* <div className="flex items-center gap-1 text-[rgb(var(--copy-muted))] text-xs">
                      <FaRegClock className="text-xs" />
                      <span>Used {formatDate(tag.LastUsed)}</span>
                    </div> */}
                  </div>
                </div>



                {/* Delete Button */}
                <button
                  onClick={() => openDeleteModal(tag)}
                  disabled={isDeleting}
                  className="w-10 flex items-center justify-center bg-[rgb(var(--surface))] text-[rgb(var(--copy-muted))] hover:bg-[rgb(var(--error))] hover:text-white transition-all border-l border-[rgb(var(--border))] disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Delete collection"
                  aria-label="Delete collection"
                >
                  <FaTimes className="text-sm" />
                </button>
              </div>
            ))}
          </div>
        )}



        {/* Empty State */}
        {!error && !isLoading && filteredAndSortedTags.length === 0 && (
          <div className="text-center py-12">
            <div className="relative inline-block mb-6">
              <div className="absolute -top-1 -left-1 w-full h-full bg-[rgb(var(--error-subtle))] rounded-full transform rotate-12 opacity-60"></div>
              <div className="relative p-6 rounded-full bg-[rgb(var(--card))] shadow-sm ring-1 ring-[rgb(var(--border))]">
                <FaTag className="text-2xl text-[rgb(var(--cta))]" />
              </div>
            </div>
            <h3 className="text-xl font-serif font-semibold text-[rgb(var(--copy-primary))] mb-2">
              {searchTerm ? "No collections found" : "No collections yet"}
            </h3>
            <p className="text-[rgb(var(--copy-secondary))] text-sm mb-4">
              {searchTerm
                ? `No collections match "${searchTerm}"`
                : "You haven't created any collections yet."}
            </p>
          </div>
        )}



        {/* Delete Confirmation Modal */}
        <DeleteConfirmationModal
          isOpen={isModalOpen}
          onClose={closeModal}
          onConfirm={confirmDelete}
          tagName={selectedTag?.Name || ""}
          isDeleting={isDeleting}
        />



        {/* Footer */}
        {!error && !isLoading && filteredAndSortedTags.length > 0 && (
          <div className="mt-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[rgb(var(--card))] rounded-full shadow-sm ring-1 ring-[rgb(var(--border))]">
              <FaHeart className="text-[rgb(var(--accent))] text-xs" />
              <span className="text-[rgb(var(--copy-secondary))] text-sm font-light">
                {filteredAndSortedTags.length}{" "}
                {filteredAndSortedTags.length === 1 ? "tag" : "tags"} found
              </span>
              <FaHeart className="text-[rgb(var(--accent))] text-xs" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};



export default Collections;