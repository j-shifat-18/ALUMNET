"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import Navbar from "@/components/layout/Navbar";
import Modal from "@/components/ui/Modal";
import JobCard, {
  getJobTypeBadgeStyle,
  formatJobTypeLabel,
  formatWorkModeLabel,
  formatDeadline,
  isDeadlinePassed,
} from "@/components/jobs/JobCard";
import CreateEditJobModal from "@/components/jobs/CreateEditJobModal";
import JobCommentsSection from "@/components/jobs/JobCommentsSection";
import { useAuth } from "@/context/AuthProvider";
import axiosInstance from "@/lib/axios";
import Swal from "sweetalert2";
import {
  Briefcase,
  Search,
  Plus,
  Filter,
  X,
  Loader2,
  Calendar,
  Building2,
  MapPin,
  Banknote,
  GraduationCap,
  ExternalLink,
  Mail,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import user_placeholder from "../../../public/placeholder-user.jpg";

const JOB_TYPES = [
  { label: "All Types", value: "ALL" },
  { label: "Full-Time", value: "FULL_TIME" },
  { label: "Internship", value: "INTERNSHIP" },
  { label: "Alumni Referral", value: "REFERRAL" },
  { label: "Research", value: "RESEARCH" },
  { label: "Part-Time", value: "PART_TIME" },
  { label: "Contract", value: "CONTRACT" },
];

const WORK_MODES = [
  { label: "Work Modes", value: "ALL" },
  { label: "Remote", value: "REMOTE" },
  { label: "In-Person", value: "IN_PERSON" },
  { label: "Hybrid", value: "HYBRID" },
];

const DEPARTMENTS = [
  { label: "Departments", value: "ALL" },
  { label: "CSE", value: "CSE" },
  { label: "SWE", value: "SWE" },
  { label: "EEE", value: "EEE" },
  { label: "ME", value: "ME" },
  { label: "CEE", value: "CEE" },
  { label: "IPE", value: "IPE" },
  { label: "BTM", value: "BTM" },
];

export default function JobsPage() {
  const { user, dbUser } = useAuth();
  const canPostOpportunity = Boolean(dbUser);

  const [activeTab, setActiveTab] = useState("ALL");
  const [selectedType, setSelectedType] = useState("ALL");
  const [selectedWorkMode, setSelectedWorkMode] = useState("ALL");
  const [selectedDept, setSelectedDept] = useState("ALL");
  const [searchInput, setSearchInput] = useState("");
  const [activeSearch, setActiveSearch] = useState("");

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [myJobsCount, setMyJobsCount] = useState(0);

  const [currentPage, setCurrentPage] = useState(1);
  const [paginationMeta, setPaginationMeta] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 1,
  });

  // Modal States
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [jobToEdit, setJobToEdit] = useState(null);

  // Job Details / Discussion Modal
  const [selectedJobForDetails, setSelectedJobForDetails] = useState(null);
  const [detailsComments, setDetailsComments] = useState([]);
  const [loadingDetailsComments, setLoadingDetailsComments] = useState(false);

  const [refreshKey, setRefreshKey] = useState(0);

  const refetch = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  useEffect(() => {
    let isCancelled = false;

    const loadJobs = async () => {
      try {
        if (activeTab === "MY_POSTS") {
          const res = await axiosInstance.get("/api/v1/jobs/my", {
            validateStatus: (s) => s < 500,
          });
          if (!isCancelled) {
            if (res.status === 200 && Array.isArray(res.data?.data)) {
              setJobs(res.data.data);
              setMyJobsCount(res.data.data.length);
              setPaginationMeta({
                page: 1,
                limit: res.data.data.length,
                total: res.data.data.length,
                totalPages: 1,
              });
            } else {
              setJobs([]);
            }
          }
        } else {
          const params = {
            page: currentPage,
            limit: 12,
          };

          if (activeSearch.trim()) params.search = activeSearch.trim();
          if (selectedType !== "ALL") params.jobType = selectedType;
          if (selectedWorkMode !== "ALL") params.workMode = selectedWorkMode;
          if (selectedDept !== "ALL") params.department = selectedDept;

          const res = await axiosInstance.get("/api/v1/jobs", {
            params,
            validateStatus: (s) => s < 500,
          });

          if (!isCancelled) {
            if (res.status === 200 && res.data?.data) {
              setJobs(res.data.data);
              if (res.data?.meta) {
                setPaginationMeta(res.data.meta);
              }
            } else {
              setJobs([]);
            }
          }
        }
      } catch (err) {
        console.error("Error fetching jobs:", err);
        if (!isCancelled) setJobs([]);
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    loadJobs();

    return () => {
      isCancelled = true;
    };
  }, [
    activeTab,
    selectedType,
    selectedWorkMode,
    selectedDept,
    activeSearch,
    currentPage,
    refreshKey,
  ]);

  // Fetch count of current user's posts
  useEffect(() => {
    if (user?.uid) {
      axiosInstance
        .get("/api/v1/jobs/my", { validateStatus: (s) => s < 500 })
        .then((res) => {
          if (res.status === 200 && Array.isArray(res.data?.data)) {
            setMyJobsCount(res.data.data.length);
          }
        })
        .catch(() => {});
    }
  }, [user]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setActiveSearch(searchInput.trim());
    setCurrentPage(1);
  };

  const handleClearSearch = () => {
    setLoading(true);
    setSearchInput("");
    setActiveSearch("");
    setCurrentPage(1);
  };

  const clearAllFilters = () => {
    setLoading(true);
    setSearchInput("");
    setActiveSearch("");
    setSelectedType("ALL");
    setSelectedWorkMode("ALL");
    setSelectedDept("ALL");
    setCurrentPage(1);
  };

  const hasActiveFilters =
    Boolean(activeSearch.trim()) ||
    selectedType !== "ALL" ||
    selectedWorkMode !== "ALL" ||
    selectedDept !== "ALL";

  // Filtered in-memory list for tab or quick filter responsiveness
  const displayedJobs = useMemo(() => {
    if (activeTab === "MY_POSTS") {
      return jobs.filter((job) => {
        const matchesType =
          selectedType === "ALL" || job.jobType === selectedType;
        const matchesWorkMode =
          selectedWorkMode === "ALL" || job.workMode === selectedWorkMode;
        const matchesDept =
          selectedDept === "ALL" ||
          (job.department &&
            job.department.toLowerCase().includes(selectedDept.toLowerCase()));
        const query = activeSearch.toLowerCase().trim();
        const matchesSearch =
          !query ||
          job.title?.toLowerCase().includes(query) ||
          job.company?.toLowerCase().includes(query) ||
          job.description?.toLowerCase().includes(query) ||
          job.skills?.some((s) => s.toLowerCase().includes(query));

        return matchesType && matchesWorkMode && matchesDept && matchesSearch;
      });
    }
    return jobs;
  }, [jobs, activeTab, selectedType, selectedWorkMode, selectedDept, activeSearch]);

  const openCreateModal = () => {
    setJobToEdit(null);
    setCreateModalOpen(true);
  };

  const openEditModal = (job) => {
    setJobToEdit(job);
    setCreateModalOpen(true);
  };

  const handleDeleteJob = async (jobId, jobTitle) => {
    const confirm = await Swal.fire({
      title: "Delete Opportunity?",
      text: `Are you sure you want to remove "${jobTitle}"? This will delete the post and all comments.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#e11d48",
      cancelButtonColor: "#4b5563",
      confirmButtonText: "Yes, Delete",
    });

    if (!confirm.isConfirmed) return;

    try {
      await axiosInstance.delete(`/api/v1/jobs/${jobId}`);
      setJobs((prev) => prev.filter((j) => j.id !== jobId));
      setMyJobsCount((prev) => Math.max(0, prev - 1));
      if (selectedJobForDetails?.id === jobId) {
        setSelectedJobForDetails(null);
      }
      Swal.fire({
        title: "Opportunity Deleted",
        text: "The job opportunity has been removed.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error("Error deleting job opportunity:", err);
      Swal.fire({
        title: "Error",
        text: err.response?.data?.message || "Failed to delete opportunity.",
        icon: "error",
      });
    }
  };

  // Open Details Modal and fetch full comments
  const openJobDetailsModal = async (job) => {
    setSelectedJobForDetails(job);
    setDetailsComments(job.comments || []);
    setLoadingDetailsComments(true);
    try {
      const res = await axiosInstance.get(`/api/v1/jobs/${job.id}`, {
        validateStatus: (s) => s < 500,
      });
      if (res.status === 200 && res.data?.data) {
        setDetailsComments(res.data.data.comments || []);
        setSelectedJobForDetails(res.data.data);
      }
    } catch (err) {
      console.error("Error loading job details:", err);
    } finally {
      setLoadingDetailsComments(false);
    }
  };

  const handleModalCommentAdded = (newComment) => {
    setDetailsComments((prev) => [...prev, newComment]);
    // update count in main jobs list
    setJobs((prev) =>
      prev.map((j) =>
        j.id === selectedJobForDetails?.id
          ? {
              ...j,
              _count: {
                ...j._count,
                comments: (j._count?.comments || 0) + 1,
              },
            }
          : j
      )
    );
  };

  const handleModalCommentDeleted = (commentId) => {
    setDetailsComments((prev) => prev.filter((c) => c.id !== commentId));
    // update count in main jobs list
    setJobs((prev) =>
      prev.map((j) =>
        j.id === selectedJobForDetails?.id
          ? {
              ...j,
              _count: {
                ...j._count,
                comments: Math.max(0, (j._count?.comments || 1) - 1),
              },
            }
          : j
      )
    );
  };

  const isEmailApp =
    selectedJobForDetails?.applicationUrl &&
    selectedJobForDetails.applicationUrl.includes("@") &&
    !selectedJobForDetails.applicationUrl.startsWith("http");

  const appHref = isEmailApp
    ? `mailto:${selectedJobForDetails.applicationUrl}?subject=Application for ${encodeURIComponent(
        selectedJobForDetails.title || ""
      )}`
    : selectedJobForDetails?.applicationUrl?.startsWith("http")
    ? selectedJobForDetails.applicationUrl
    : `https://${selectedJobForDetails?.applicationUrl || ""}`;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 font-sans">
        <Navbar />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-8">
          {/* Header Banner */}
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-200/80 dark:border-gray-800 p-6 sm:p-8 shadow-xs mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 text-xs font-bold border border-blue-200 dark:border-blue-900/40">
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>Career & Opportunities Board</span>
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                  Discover Jobs, Internships & Referrals
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  Connect directly with alumni hiring teams, explore verified
                  internships, full-time positions, research roles, and request
                  internal referrals.
                </p>
              </div>

              {canPostOpportunity && (
                <div className="shrink-0">
                  <button
                    type="button"
                    onClick={openCreateModal}
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Post Opportunity</span>
                  </button>
                </div>
              )}
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 pt-6 mt-6 border-t border-gray-100 dark:border-zinc-800/80">
              <button
                type="button"
                onClick={() => {
                  if (activeTab !== "ALL") {
                    setLoading(true);
                    setActiveTab("ALL");
                    setCurrentPage(1);
                  }
                }}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeTab === "ALL"
                    ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800"
                }`}
              >
                {activeTab === "ALL" && loading && (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                )}
                <span>All Opportunities</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  if (activeTab !== "MY_POSTS") {
                    setLoading(true);
                    setActiveTab("MY_POSTS");
                    setCurrentPage(1);
                  }
                }}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeTab === "MY_POSTS"
                    ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800"
                }`}
              >
                {activeTab === "MY_POSTS" && loading && (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                )}
                <span>My Postings</span>
                {myJobsCount > 0 && (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-blue-600 text-white">
                    {myJobsCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="space-y-4 mb-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <form
                onSubmit={handleSearchSubmit}
                className="flex items-center gap-2 w-full md:max-w-md"
              >
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Search by title, company, skills..."
                    className="w-full pl-10 pr-9 py-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-gray-800 rounded-2xl text-xs sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 shadow-2xs"
                  />
                  {searchInput && (
                    <button
                      type="button"
                      onClick={handleClearSearch}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-0.5"
                      title="Clear search"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-2xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-xs sm:text-sm font-bold shadow-xs transition-colors shrink-0 cursor-pointer"
                >
                  Search
                </button>
              </form>

              {/* Job Type Pills */}
              <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-none">
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 mr-1 flex items-center gap-1 shrink-0">
                  <Filter className="w-3.5 h-3.5" /> Type:
                </span>
                {JOB_TYPES.map((type) => {
                  const isActive = selectedType === type.value;
                  const isCurrentFilterLoading = isActive && loading;
                  return (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => {
                        if (selectedType !== type.value) {
                          setLoading(true);
                          setSelectedType(type.value);
                          setCurrentPage(1);
                        }
                      }}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                        isActive
                          ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs"
                          : "bg-white dark:bg-zinc-900 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800 border border-gray-200/80 dark:border-gray-800"
                      }`}
                    >
                      {isCurrentFilterLoading && (
                        <Loader2 className="w-3 h-3 animate-spin text-current" />
                      )}
                      <span>{type.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Secondary Filters: Work Mode & Department */}
            <div className="flex items-center justify-between gap-3 flex-wrap pt-1">
              <div className="flex items-center gap-2 flex-wrap">
                <div className="relative inline-flex items-center">
                  <select
                    value={selectedWorkMode}
                    onChange={(e) => {
                      setLoading(true);
                      setSelectedWorkMode(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="appearance-none pl-3.5 pr-7 py-2 rounded-2xl border border-gray-200/80 dark:border-gray-800 bg-white dark:bg-zinc-900 text-xs font-bold text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 shadow-2xs cursor-pointer"
                  >
                    {WORK_MODES.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" />
                </div>

                <div className="relative inline-flex items-center">
                  <select
                    value={selectedDept}
                    onChange={(e) => {
                      setLoading(true);
                      setSelectedDept(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="appearance-none pl-3.5 pr-7 py-2 rounded-2xl border border-gray-200/80 dark:border-gray-800 bg-white dark:bg-zinc-900 text-xs font-bold text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 shadow-2xs cursor-pointer"
                  >
                    {DEPARTMENTS.map((d) => (
                      <option key={d.value} value={d.value}>
                        {d.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" />
                </div>
              </div>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Reset All Filters</span>
                </button>
              )}
            </div>
          </div>

          {/* Opportunities Feed / Grid */}
          {loading ? (
            <div className="p-16 text-center text-gray-500 dark:text-gray-400 space-y-3 bg-white dark:bg-zinc-900 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-xs">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-400" />
              <p className="text-sm font-semibold">
                Loading career opportunities...
              </p>
            </div>
          ) : displayedJobs.length === 0 ? (
            <div className="p-16 text-center space-y-4 bg-white dark:bg-zinc-900 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-xs">
              <div className="w-16 h-16 rounded-3xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
                <Briefcase className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                  No opportunities found
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                  {hasActiveFilters
                    ? "Try adjusting your search query, job type, or department filter to discover more roles."
                    : activeTab === "MY_POSTS"
                    ? "You haven't posted any job opportunities yet. Share one with the campus & alumni network!"
                    : "No job postings recorded in the board yet. Check back soon!"}
                </p>
              </div>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="mt-2 inline-flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Clear Filters</span>
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedJobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  currentUser={dbUser}
                  onEdit={openEditModal}
                  onDelete={handleDeleteJob}
                  onViewDetails={openJobDetailsModal}
                />
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {paginationMeta.totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-6 border-t border-gray-200/80 dark:border-gray-800">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Showing page{" "}
                <span className="font-bold text-gray-900 dark:text-white">
                  {currentPage}
                </span>{" "}
                of{" "}
                <span className="font-bold text-gray-900 dark:text-white">
                  {paginationMeta.totalPages}
                </span>{" "}
                ({paginationMeta.total} total opportunities)
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={currentPage <= 1 || loading}
                  onClick={() => {
                    setLoading(true);
                    setCurrentPage((p) => Math.max(1, p - 1));
                  }}
                  className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-zinc-900 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 disabled:opacity-40 transition-all cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </button>
                <button
                  type="button"
                  disabled={
                    currentPage >= paginationMeta.totalPages || loading
                  }
                  onClick={() => {
                    setLoading(true);
                    setCurrentPage((p) =>
                      Math.min(paginationMeta.totalPages, p + 1)
                    );
                  }}
                  className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-zinc-900 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 disabled:opacity-40 transition-all cursor-pointer"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Create / Edit Opportunity Modal */}
        <CreateEditJobModal
          isOpen={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          jobToEdit={jobToEdit}
          onSuccess={() => {
            setCreateModalOpen(false);
            refetch();
          }}
        />

        {/* Opportunity Details & Live Q&A Modal */}
        <Modal
          isOpen={Boolean(selectedJobForDetails)}
          onClose={() => setSelectedJobForDetails(null)}
          title="Opportunity Details & Discussion"
          size="lg"
        >
          {selectedJobForDetails && (
            <div className="space-y-6 pt-2">
              {/* Header Box */}
              <div className="space-y-3 p-4 rounded-2xl bg-gray-50 dark:bg-zinc-900/90 border border-gray-200 dark:border-zinc-800">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="space-y-1">
                    <span
                      className={`inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${getJobTypeBadgeStyle(
                        selectedJobForDetails.jobType
                      )}`}
                    >
                      {formatJobTypeLabel(selectedJobForDetails.jobType)}
                    </span>
                    <h2 className="text-lg sm:text-xl font-extrabold text-gray-900 dark:text-white leading-snug">
                      {selectedJobForDetails.title}
                    </h2>
                    <p className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-gray-400" />
                      <span>{selectedJobForDetails.company}</span>
                      {selectedJobForDetails.department && (
                        <>
                          <span className="text-gray-400">•</span>
                          <span className="text-gray-500 dark:text-gray-400">
                            {selectedJobForDetails.department}
                          </span>
                        </>
                      )}
                    </p>
                  </div>

                  {selectedJobForDetails.applicationUrl && (
                    <a
                      href={appHref}
                      target={isEmailApp ? "_self" : "_blank"}
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all shrink-0 cursor-pointer"
                    >
                      {isEmailApp ? (
                        <Mail className="w-3.5 h-3.5" />
                      ) : (
                        <ExternalLink className="w-3.5 h-3.5" />
                      )}
                      <span>Apply Now</span>
                    </a>
                  )}
                </div>

                {/* Metadata Pills */}
                <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400 flex-wrap pt-2 border-t border-gray-200/80 dark:border-zinc-800">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-gray-400" />
                    <span>
                      {selectedJobForDetails.location || "Location TBA"} (
                      {formatWorkModeLabel(selectedJobForDetails.workMode)})
                    </span>
                  </span>

                  {selectedJobForDetails.salaryRange && (
                    <span className="flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                      <Banknote className="w-3.5 h-3.5" />
                      <span>{selectedJobForDetails.salaryRange}</span>
                    </span>
                  )}

                  {selectedJobForDetails.deadline && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      <span
                        className={
                          isDeadlinePassed(selectedJobForDetails.deadline)
                            ? "text-rose-500 font-semibold"
                            : ""
                        }
                      >
                        {isDeadlinePassed(selectedJobForDetails.deadline)
                          ? "Deadline closed"
                          : `Deadline: ${formatDeadline(
                              selectedJobForDetails.deadline
                            )}`}
                      </span>
                    </span>
                  )}
                </div>
              </div>

              {/* Poster info banner */}
              {selectedJobForDetails.poster && (
                <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800">
                  <Link
                    href={`/profile/${selectedJobForDetails.poster.uid || ""}`}
                    className="flex items-center gap-2.5 min-w-0 group"
                  >
                    <div className="w-8 h-8 rounded-full overflow-hidden relative shrink-0 border border-gray-200 dark:border-zinc-700">
                      <Image
                        src={
                          selectedJobForDetails.poster.profileImage ||
                          user_placeholder
                        }
                        alt={selectedJobForDetails.poster.name || "Poster"}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0 text-xs">
                      <p className="font-bold text-gray-900 dark:text-white group-hover:underline truncate">
                        {selectedJobForDetails.poster.name}
                      </p>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                        {selectedJobForDetails.poster.role}
                        {selectedJobForDetails.poster.alumniProfile?.batch &&
                          ` • Batch ${selectedJobForDetails.poster.alumniProfile.batch}`}
                        {selectedJobForDetails.poster.studentProfile?.batch &&
                          ` • Batch ${selectedJobForDetails.poster.studentProfile.batch}`}
                      </p>
                    </div>
                  </Link>

                  <span className="text-[11px] text-gray-400">
                    Posted on{" "}
                    {new Date(
                      selectedJobForDetails.createdAt
                    ).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
              )}

              {/* Description */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Role Overview & Description
                </h3>
                <p className="text-xs sm:text-sm text-gray-800 dark:text-gray-200 whitespace-pre-line leading-relaxed">
                  {selectedJobForDetails.description}
                </p>
              </div>

              {/* Requirements */}
              {selectedJobForDetails.requirements && (
                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Key Requirements & Qualifications
                  </h3>
                  <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-zinc-900/60 border border-gray-100 dark:border-zinc-800 text-xs sm:text-sm text-gray-800 dark:text-gray-200 whitespace-pre-line leading-relaxed">
                    {selectedJobForDetails.requirements}
                  </div>
                </div>
              )}

              {/* Skills Tags */}
              {Array.isArray(selectedJobForDetails.skills) &&
                selectedJobForDetails.skills.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Required Skills & Keywords
                    </h3>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedJobForDetails.skills.map((skill) => (
                        <span
                          key={skill}
                          className="px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 text-xs font-medium"
                        >
                          #{skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

              {/* Live Q&A Section */}
              <div className="pt-2">
                {loadingDetailsComments ? (
                  <div className="py-6 text-center text-gray-400 space-y-2">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto text-gray-400" />
                    <p className="text-xs">Loading discussion thread...</p>
                  </div>
                ) : (
                  <JobCommentsSection
                    jobId={selectedJobForDetails.id}
                    comments={detailsComments}
                    currentUser={dbUser}
                    onCommentAdded={handleModalCommentAdded}
                    onCommentDeleted={handleModalCommentDeleted}
                  />
                )}
              </div>
            </div>
          )}
        </Modal>
      </div>
    </ProtectedRoute>
  );
}
