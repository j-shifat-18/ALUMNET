"use client";

import React, { useEffect, useState, useCallback } from "react";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import Navbar from "@/components/layout/Navbar";
import JobCard from "@/components/jobs/JobCard";
import CreateEditJobModal from "@/components/jobs/CreateEditJobModal";
import { useAuth } from "@/context/AuthProvider";
import axiosInstance from "@/lib/axios";
import {
  Briefcase,
  Search,
  Plus,
  Filter,
  X,
  Loader2,
  Sparkles,
  Building2,
  GraduationCap,
  Globe,
  Layers,
  ArrowRight,
  TrendingUp,
} from "lucide-react";

const JOB_TYPE_FILTERS = [
  { label: "All Opportunities", value: "ALL" },
  { label: "Full-Time", value: "FULL_TIME" },
  { label: "Internships", value: "INTERNSHIP" },
  { label: "Alumni Referrals", value: "REFERRAL" },
  { label: "Research", value: "RESEARCH" },
  { label: "Part-Time", value: "PART_TIME" },
  { label: "Contract", value: "CONTRACT" },
];

const WORK_MODE_FILTERS = [
  { label: "All Work Modes", value: "ALL" },
  { label: "Remote", value: "REMOTE" },
  { label: "In-Person", value: "IN_PERSON" },
  { label: "Hybrid", value: "HYBRID" },
];

const DEPARTMENTS = [
  { label: "All Departments", value: "ALL" },
  { label: "CSE", value: "CSE" },
  { label: "SWE", value: "SWE" },
  { label: "EEE", value: "EEE" },
  { label: "ME", value: "ME" },
  { label: "CEE", value: "CEE" },
  { label: "MCE", value: "MCE" },
  { label: "BTM", value: "BTM" },
];

export default function JobsPage() {
  const { user, dbUser } = useAuth();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("ALL"); // "ALL" | "MY_POSTS"
  const [myJobsCount, setMyJobsCount] = useState(0);

  // Filters state
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedType, setSelectedType] = useState("ALL");
  const [selectedWorkMode, setSelectedWorkMode] = useState("ALL");
  const [selectedDept, setSelectedDept] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [meta, setMeta] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });

  const [refreshKey, setRefreshKey] = useState(0);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [jobToEdit, setJobToEdit] = useState(null);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch jobs from backend
  useEffect(() => {
    let isCancelled = false;
    const load = async () => {
      try {
        if (activeTab === "MY_POSTS") {
          const res = await axiosInstance.get("/api/v1/jobs/my");
          if (!isCancelled && Array.isArray(res.data?.data)) {
            setJobs(res.data.data);
            setMyJobsCount(res.data.data.length);
            setMeta({ page: 1, limit: res.data.data.length, total: res.data.data.length, totalPages: 1 });
          }
        } else {
          const params = {
            page: currentPage,
            limit: 10,
          };

          if (debouncedSearch) params.search = debouncedSearch;
          if (selectedType !== "ALL") params.jobType = selectedType;
          if (selectedWorkMode !== "ALL") params.workMode = selectedWorkMode;
          if (selectedDept !== "ALL") params.department = selectedDept;

          const res = await axiosInstance.get("/api/v1/jobs", { params });
          if (!isCancelled && res.data?.data) {
            setJobs(res.data.data);
            setMeta(res.data.meta || { page: 1, limit: 10, total: res.data.data.length, totalPages: 1 });
          }
        }
      } catch (err) {
        console.error("Error fetching jobs:", err);
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    load();
    return () => {
      isCancelled = true;
    };
  }, [activeTab, debouncedSearch, selectedType, selectedWorkMode, selectedDept, currentPage, refreshKey]);

  // Fetch count of user's own jobs for tab badge
  useEffect(() => {
    if (user?.uid) {
      axiosInstance
        .get("/api/v1/jobs/my")
        .then((res) => {
          if (Array.isArray(res.data?.data)) {
            setMyJobsCount(res.data.data.length);
          }
        })
        .catch(() => {});
    }
  }, [user]);

  const handleOpenCreateModal = () => {
    setJobToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (job) => {
    setJobToEdit(job);
    setIsModalOpen(true);
  };

  const handleJobCreatedOrUpdated = (savedJob) => {
    setLoading(true);
    setRefreshKey((k) => k + 1);
  };

  const handleJobDeleted = (deletedId) => {
    setJobs((prev) => prev.filter((j) => j.id !== deletedId));
    setMyJobsCount((prev) => Math.max(0, prev - 1));
  };

  const clearAllFilters = () => {
    setSearchQuery("");
    setDebouncedSearch("");
    setSelectedType("ALL");
    setSelectedWorkMode("ALL");
    setSelectedDept("ALL");
    setCurrentPage(1);
  };

  const hasActiveFilters =
    Boolean(searchQuery.trim()) ||
    selectedType !== "ALL" ||
    selectedWorkMode !== "ALL" ||
    selectedDept !== "ALL";

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50/60 dark:bg-black text-gray-900 dark:text-gray-100 flex flex-col font-sans transition-colors duration-200">
        <Navbar />

        <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          {/* Hero Header Banner */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 text-white p-6 sm:p-8 md:p-10 shadow-xl border border-blue-800/40">
            <div className="relative z-10 max-w-2xl space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-bold tracking-wider uppercase">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AlumNet Career Hub</span>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-tight">
                Opportunities & Referral Board
              </h1>
              <p className="text-sm sm:text-base text-blue-100/90 leading-relaxed">
                Connect directly with alumni hiring teams, explore verified internships, full-time positions, research roles, and request direct referrals.
              </p>
            </div>

            <div className="mt-6 flex items-center gap-3 relative z-10">
              <button
                type="button"
                onClick={handleOpenCreateModal}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-white text-gray-900 hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl cursor-pointer"
              >
                <Plus className="w-4 h-4 text-blue-600" />
                <span>Post Opportunity</span>
              </button>
            </div>

            {/* Decorative Background Elements */}
            <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute right-12 top-6 opacity-10 pointer-events-none">
              <Briefcase className="w-56 h-56 text-white" />
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("ALL");
                  setCurrentPage(1);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                  activeTab === "ALL"
                    ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900 shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>All Opportunities</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab("MY_POSTS");
                  setCurrentPage(1);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                  activeTab === "MY_POSTS"
                    ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900 shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                <Briefcase className="w-4 h-4" />
                <span>My Postings</span>
                {myJobsCount > 0 && (
                  <span className="ml-1 px-2 py-0.5 text-xs font-bold rounded-full bg-blue-600 text-white">
                    {myJobsCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Search & Filter Controls (only active on "ALL" tab) */}
          {activeTab === "ALL" && (
            <div className="space-y-3 bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs">
              {/* Keyword Search */}
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by role title, company, skills (e.g. React, Python), or keywords..."
                  className="w-full pl-10 pr-10 py-2.5 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Filter Pills & Dropdowns */}
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Work Mode Dropdown */}
                  <select
                    value={selectedWorkMode}
                    onChange={(e) => {
                      setSelectedWorkMode(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs font-semibold text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    {WORK_MODE_FILTERS.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label}
                      </option>
                    ))}
                  </select>

                  {/* Department Dropdown */}
                  <select
                    value={selectedDept}
                    onChange={(e) => {
                      setSelectedDept(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs font-semibold text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    {DEPARTMENTS.map((dept) => (
                      <option key={dept.value} value={dept.value}>
                        {dept.label}
                      </option>
                    ))}
                  </select>
                </div>

                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={clearAllFilters}
                    className="inline-flex items-center gap-1 text-xs font-bold text-red-500 hover:text-red-600 transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Clear Filters</span>
                  </button>
                )}
              </div>

              {/* Job Type Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 scrollbar-none">
                {JOB_TYPE_FILTERS.map((t) => {
                  const isActive = selectedType === t.value;
                  return (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => {
                        setSelectedType(t.value);
                        setCurrentPage(1);
                      }}
                      className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                        isActive
                          ? "bg-blue-600 text-white shadow-xs shadow-blue-500/20"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                      }`}
                    >
                      {t.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Job Feed */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Loading opportunities...
              </p>
            </div>
          ) : jobs.length === 0 ? (
            <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-10 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
                <Briefcase className="w-8 h-8" />
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {activeTab === "MY_POSTS"
                    ? "You haven't posted any opportunities yet"
                    : hasActiveFilters
                    ? "No opportunities match your filters"
                    : "No opportunities posted yet"}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {activeTab === "MY_POSTS"
                    ? "Share job openings, internships, or referral opportunities from your company."
                    : hasActiveFilters
                    ? "Try adjusting your search terms or clearing some filters to see more results."
                    : "Be the first to share an opening or alumni referral with the IUT network!"}
                </p>
              </div>

              <div>
                {hasActiveFilters && activeTab === "ALL" ? (
                  <button
                    type="button"
                    onClick={clearAllFilters}
                    className="px-4 py-2 rounded-xl text-sm font-bold bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all cursor-pointer"
                  >
                    Reset All Filters
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleOpenCreateModal}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-md shadow-blue-500/20 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Post an Opportunity</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {jobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  currentUser={dbUser || user}
                  onEdit={handleOpenEditModal}
                  onDelete={handleJobDeleted}
                />
              ))}

              {/* Pagination Controls */}
              {activeTab === "ALL" && meta.totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-800 text-sm">
                  <p className="text-gray-500 dark:text-gray-400 text-xs">
                    Showing page <span className="font-bold text-gray-900 dark:text-white">{meta.page}</span> of{" "}
                    <span className="font-bold text-gray-900 dark:text-white">{meta.totalPages}</span> ({meta.total} total)
                  </p>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={currentPage <= 1}
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-800 text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-800 transition-all cursor-pointer"
                    >
                      Previous
                    </button>
                    <button
                      type="button"
                      disabled={currentPage >= meta.totalPages}
                      onClick={() => setCurrentPage((p) => Math.min(meta.totalPages, p + 1))}
                      className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-800 text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-800 transition-all cursor-pointer"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>

        {/* Create / Edit Job Modal */}
        <CreateEditJobModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          jobToEdit={jobToEdit}
          onSuccess={handleJobCreatedOrUpdated}
        />
      </div>
    </ProtectedRoute>
  );
}
