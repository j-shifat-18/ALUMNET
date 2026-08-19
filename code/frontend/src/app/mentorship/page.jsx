"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import Navbar from "@/components/layout/Navbar";
import { useAuth } from "@/context/AuthProvider";
import axiosInstance from "@/lib/axios";
import Swal from "sweetalert2";
import {
  GraduationCap,
  Users,
  Inbox,
  CheckCircle2,
  Clock,
  XCircle,
  Search,
  Check,
  X,
  ExternalLink,
  MessageSquare,
  Sparkles,
  BookOpen,
  Filter,
  ArrowUpRight,
  ChevronRight,
  ShieldCheck,
  Briefcase,
  ListTodo,
} from "lucide-react";
import user_placeholder from "../../../public/placeholder-user.jpg";

export default function MentorshipPage() {
  const { user, dbUser } = useAuth();
  const isAlumni = dbUser?.role === "ALUMNI";
  const isStudent = dbUser?.role === "STUDENT";

  const [activeTab, setActiveTab] = useState(isAlumni ? "REQUESTS" : "MENTORS");

  const [receivedRequests, setReceivedRequests] = useState([]);
  const [mentees, setMentees] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [loadingMentees, setLoadingMentees] = useState(true);

  const [sentRequests, setSentRequests] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [loadingSent, setLoadingSent] = useState(true);
  const [loadingMentors, setLoadingMentors] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [processingIds, setProcessingIds] = useState(new Set());

  const [selectedMessage, setSelectedMessage] = useState(null);

  useEffect(() => {
    if (isAlumni && activeTab !== "REQUESTS" && activeTab !== "MENTEES") {
      setActiveTab("REQUESTS");
    } else if (isStudent && activeTab !== "MENTORS" && activeTab !== "SENT_REQUESTS") {
      setActiveTab("MENTORS");
    }
  }, [isAlumni, isStudent, activeTab]);

  const fetchReceivedRequests = async () => {
    try {
      setLoadingRequests(true);
      const res = await axiosInstance.get("/api/v1/mentorship/received");
      setReceivedRequests(res.data?.data || []);
    } catch (err) {
      console.error("Error fetching received requests:", err);
    } finally {
      setLoadingRequests(false);
    }
  };

  const fetchMentees = async () => {
    try {
      setLoadingMentees(true);
      const res = await axiosInstance.get("/api/v1/mentorship/mentees");
      setMentees(res.data?.data || []);
    } catch (err) {
      console.error("Error fetching mentees:", err);
    } finally {
      setLoadingMentees(false);
    }
  };

  const fetchSentRequests = async () => {
    try {
      setLoadingSent(true);
      const res = await axiosInstance.get("/api/v1/mentorship/sent");
      setSentRequests(res.data?.data || []);
    } catch (err) {
      console.error("Error fetching sent requests:", err);
    } finally {
      setLoadingSent(false);
    }
  };

  const fetchMentors = async () => {
    try {
      setLoadingMentors(true);
      const res = await axiosInstance.get("/api/v1/mentorship/mentors");
      setMentors(res.data?.data || []);
    } catch (err) {
      console.error("Error fetching mentors:", err);
    } finally {
      setLoadingMentors(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    if (isAlumni) {
      fetchReceivedRequests();
      fetchMentees();
    } else if (isStudent) {
      fetchSentRequests();
      fetchMentors();
    }
  }, [user, isAlumni, isStudent]);

  const handleAccept = async (requestId, studentName) => {
    try {
      setProcessingIds((prev) => new Set(prev).add(requestId));

      const res = await axiosInstance.patch(`/api/v1/mentorship/${requestId}/accept`);

      setReceivedRequests((prev) =>
        prev.map((req) =>
          req.id === requestId ? { ...req, status: "ACCEPTED" } : req
        )
      );

      fetchMentees();

      Swal.fire({
        title: "Mentorship Accepted!",
        text: `You are now mentoring ${studentName || "the student"}. They have been added to your Mentees list.`,
        icon: "success",
        timer: 2200,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error("Error accepting mentorship request:", err);
      Swal.fire({
        title: "Failed to Accept",
        text: err.response?.data?.message || "Something went wrong.",
        icon: "error",
      });
    } finally {
      setProcessingIds((prev) => {
        const next = new Set(prev);
        next.delete(requestId);
        return next;
      });
    }
  };

  const handleReject = async (requestId, studentName) => {
    const confirmResult = await Swal.fire({
      title: "Decline Mentorship Request?",
      text: `Are you sure you want to decline the request from ${studentName || "this student"}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, decline",
      cancelButtonText: "Cancel",
    });

    if (!confirmResult.isConfirmed) return;

    try {
      setProcessingIds((prev) => new Set(prev).add(requestId));

      await axiosInstance.patch(`/api/v1/mentorship/${requestId}/reject`);

      setReceivedRequests((prev) =>
        prev.map((req) =>
          req.id === requestId ? { ...req, status: "REJECTED" } : req
        )
      );

      Swal.fire({
        title: "Request Declined",
        text: "The mentorship request has been declined.",
        icon: "info",
        timer: 1800,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error("Error declining mentorship request:", err);
      Swal.fire({
        title: "Failed to Decline",
        text: err.response?.data?.message || "Something went wrong.",
        icon: "error",
      });
    } finally {
      setProcessingIds((prev) => {
        const next = new Set(prev);
        next.delete(requestId);
        return next;
      });
    }
  };

  const filteredReceivedRequests = useMemo(() => {
    return receivedRequests.filter((req) => {
      const studentName = req.student?.name?.toLowerCase() || "";
      const studentUsername = req.student?.username?.toLowerCase() || "";
      const query = searchQuery.toLowerCase();
      const matchesSearch = studentName.includes(query) || studentUsername.includes(query);

      const matchesStatus =
        statusFilter === "ALL" ? true : req.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [receivedRequests, searchQuery, statusFilter]);

  const filteredSentRequests = useMemo(() => {
    return sentRequests.filter((req) => {
      const alumniName = req.alumni?.name?.toLowerCase() || "";
      const alumniUsername = req.alumni?.username?.toLowerCase() || "";
      const query = searchQuery.toLowerCase();
      const matchesSearch = alumniName.includes(query) || alumniUsername.includes(query);

      const matchesStatus =
        statusFilter === "ALL" ? true : req.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [sentRequests, searchQuery, statusFilter]);

  const pendingCount = receivedRequests.filter((r) => r.status === "PENDING").length;
  const acceptedCount = receivedRequests.filter((r) => r.status === "ACCEPTED").length;
  const rejectedCount = receivedRequests.filter((r) => r.status === "REJECTED").length;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-gray-100 flex flex-col font-sans transition-colors duration-200">
        <Navbar />

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-gray-800 p-6 sm:p-8 mb-8 shadow-sm transition-colors">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-xs font-semibold border border-blue-200 dark:border-blue-800/80">
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>{isAlumni ? "Alumni Mentorship" : "Student Mentorship"}</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                  {isAlumni ? "My Mentorship Dashboard" : "Mentorship Portal"}
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-300 max-w-2xl">
                  {isAlumni
                    ? "Manage incoming mentorship requests, review student goals, and empower the next generation of engineers."
                    : "Connect with verified alumni mentors, seek career direction, and accelerate your engineering journey."}
                </p>
              </div>

              {isAlumni ? (
                <div className="grid grid-cols-3 gap-3 sm:gap-4 shrink-0">
                  <div className="bg-gray-50 dark:bg-zinc-800/60 rounded-xl p-3 sm:p-4 border border-gray-200 dark:border-zinc-700 text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Requests</p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mt-0.5">{receivedRequests.length}</p>
                  </div>
                  <div className="bg-amber-50 dark:bg-amber-950/40 rounded-xl p-3 sm:p-4 border border-amber-200 dark:border-amber-800/60 text-center">
                    <p className="text-xs text-amber-700 dark:text-amber-300 font-medium">Pending</p>
                    <p className="text-xl sm:text-2xl font-bold text-amber-600 dark:text-amber-400 mt-0.5">{pendingCount}</p>
                  </div>
                  <div className="bg-emerald-50 dark:bg-emerald-950/40 rounded-xl p-3 sm:p-4 border border-emerald-200 dark:border-emerald-800/60 text-center">
                    <p className="text-xs text-emerald-700 dark:text-emerald-300 font-medium">Mentees</p>
                    <p className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{mentees.length}</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:gap-4 shrink-0">
                  <div className="bg-emerald-50 dark:bg-emerald-950/40 rounded-xl p-3 sm:p-4 border border-emerald-200 dark:border-emerald-800/60 text-center">
                    <p className="text-xs text-emerald-700 dark:text-emerald-300 font-medium">Active Mentors</p>
                    <p className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{mentors.length}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-zinc-800/60 rounded-xl p-3 sm:p-4 border border-gray-200 dark:border-zinc-700 text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Sent Requests</p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mt-0.5">{sentRequests.length}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 mb-6 gap-4 overflow-x-auto pb-1">
            <div className="flex items-center gap-2">
              {isAlumni ? (
                <>
                  <button
                    type="button"
                    onClick={() => setActiveTab("REQUESTS")}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all cursor-pointer whitespace-nowrap ${
                      activeTab === "REQUESTS"
                        ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-sm"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-900"
                    }`}
                  >
                    <Inbox className="w-4 h-4" />
                    <span>Mentorship Requests</span>
                    {pendingCount > 0 && (
                      <span className="ml-1 px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500 text-white">
                        {pendingCount}
                      </span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab("MENTEES")}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all cursor-pointer whitespace-nowrap ${
                      activeTab === "MENTEES"
                        ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-sm"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-900"
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    <span>My Mentees</span>
                    <span className="ml-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-200 dark:bg-zinc-800 text-gray-700 dark:text-gray-300">
                      {mentees.length}
                    </span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setActiveTab("MENTORS")}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all cursor-pointer whitespace-nowrap ${
                      activeTab === "MENTORS"
                        ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-sm"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-900"
                    }`}
                  >
                    <GraduationCap className="w-4 h-4" />
                    <span>My Mentors</span>
                    <span className="ml-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-200 dark:bg-zinc-800 text-gray-700 dark:text-gray-300">
                      {mentors.length}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab("SENT_REQUESTS")}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all cursor-pointer whitespace-nowrap ${
                      activeTab === "SENT_REQUESTS"
                        ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-sm"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-900"
                    }`}
                  >
                    <Inbox className="w-4 h-4" />
                    <span>Sent Requests</span>
                    <span className="ml-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-200 dark:bg-zinc-800 text-gray-700 dark:text-gray-300">
                      {sentRequests.length}
                    </span>
                  </button>
                </>
              )}
            </div>
          </div>

          {isAlumni && activeTab === "REQUESTS" && (
            <div className="space-y-5">
              <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by student name or username..."
                    className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-zinc-800/60 border border-gray-200 dark:border-gray-700/60 rounded-xl text-xs sm:text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-all"
                  />
                </div>

                <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 mr-1 flex items-center gap-1 shrink-0">
                    <Filter className="w-3.5 h-3.5" /> Status:
                  </span>
                  {["ALL", "PENDING", "ACCEPTED", "REJECTED"].map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setStatusFilter(status)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer shrink-0 ${
                        statusFilter === status
                          ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                          : "bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                      }`}
                    >
                      {status === "ALL" ? "All" : status.charAt(0) + status.slice(1).toLowerCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
                {loadingRequests ? (
                  <div className="p-12 text-center text-gray-500 dark:text-gray-400 space-y-3">
                    <div className="w-8 h-8 border-3 border-zinc-900 dark:border-zinc-100 border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-sm font-medium">Loading mentorship requests...</p>
                  </div>
                ) : filteredReceivedRequests.length === 0 ? (
                  <div className="p-12 text-center space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-zinc-800 flex items-center justify-center mx-auto text-gray-400">
                      <Inbox className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-base text-gray-900 dark:text-white">
                      {searchQuery || statusFilter !== "ALL"
                        ? "No matching mentorship requests found"
                        : "No mentorship requests yet"}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                      {searchQuery || statusFilter !== "ALL"
                        ? "Try adjusting your search terms or filter to see more requests."
                        : "When students request mentorship from your profile, their requests will appear here for your review."}
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50/75 dark:bg-zinc-950/40 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          <th className="py-3.5 px-4 sm:px-6">Student</th>
                          <th className="py-3.5 px-4">Message / Goal</th>
                          <th className="py-3.5 px-4">Date Sent</th>
                          <th className="py-3.5 px-4 text-center">Status</th>
                          <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-zinc-800/80 text-sm">
                        {filteredReceivedRequests.map((req) => {
                          const isProcessing = processingIds.has(req.id);
                          const formattedDate = req.createdAt
                            ? new Date(req.createdAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })
                            : "Recently";

                          return (
                            <tr
                              key={req.id}
                              className="hover:bg-gray-50/80 dark:hover:bg-zinc-800/40 transition-colors group"
                              >
                                {/* Student Profile Info */}
                              <td className="py-4 px-4 sm:px-6 align-middle">
                                <div className="flex items-center gap-3">
                                  <Link
                                    href={`/profile/${req.student?.uid}`}
                                    className="w-10 h-10 rounded-full overflow-hidden relative shrink-0 border border-gray-200 dark:border-zinc-700 hover:opacity-90 transition-opacity"
                                  >
                                    <Image
                                      src={req.student?.profileImage || user_placeholder}
                                      alt={req.student?.name || "Student"}
                                      fill
                                      className="object-cover"
                                    />
                                  </Link>
                                  <div className="min-w-0">
                                    <Link
                                      href={`/profile/${req.student?.uid}`}
                                      className="font-bold text-gray-900 dark:text-white hover:underline truncate block leading-snug"
                                    >
                                      {req.student?.name || "Student"}
                                    </Link>
                                  </div>
                                </div>
                              </td>

                              <td className="py-4 px-4 align-middle max-w-xs sm:max-w-sm">
                                {req.message ? (
                                  <button
                                    type="button"
                                    onClick={() => setSelectedMessage({ student: req.student, message: req.message, date: formattedDate })}
                                    className="text-left group/msg block"
                                  >
                                    <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 line-clamp-2 italic hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer">
                                      "{req.message}"
                                    </p>
                                    <span className="text-[11px] text-blue-600 dark:text-blue-400 font-medium group-hover/msg:underline mt-0.5 inline-block">
                                      View note
                                    </span>
                                  </button>
                                ) : (
                                  <span className="text-xs text-gray-400 dark:text-gray-500 italic">
                                    No custom note attached
                                  </span>
                                )}
                              </td>

                              <td className="py-4 px-4 align-middle text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">
                                <div className="flex items-center gap-1.5">
                                  <Clock className="w-3.5 h-3.5 text-gray-400" />
                                  <span>{formattedDate}</span>
                                </div>
                              </td>

                              <td className="py-4 px-4 align-middle text-center whitespace-nowrap">
                                {req.status === "PENDING" && (
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                    Pending
                                  </span>
                                )}
                                {req.status === "ACCEPTED" && (
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                    <Check className="w-3 h-3" />
                                    Accepted
                                  </span>
                                )}
                                {req.status === "REJECTED" && (
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                                    <X className="w-3 h-3" />
                                    Declined
                                  </span>
                                )}
                              </td>

                              <td className="py-4 px-4 sm:px-6 align-middle text-right whitespace-nowrap">
                                {req.status === "PENDING" ? (
                                  <div className="flex items-center justify-end gap-2">
                                    <button
                                      type="button"
                                      disabled={isProcessing}
                                      onClick={() => handleAccept(req.id, req.student?.name)}
                                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
                                      title="Accept Mentorship"
                                    >
                                      <Check className="w-3.5 h-3.5" />
                                      <span>Accept</span>
                                    </button>

                                    <button
                                      type="button"
                                      disabled={isProcessing}
                                      onClick={() => handleReject(req.id, req.student?.name)}
                                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-zinc-800 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/50 dark:hover:text-rose-400 text-gray-700 dark:text-gray-300 text-xs font-semibold border border-gray-200 dark:border-zinc-700 transition-all cursor-pointer disabled:opacity-50"
                                      title="Decline Request"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                      <span>Decline</span>
                                    </button>
                                  </div>
                                ) : req.status === "ACCEPTED" ? (
                                  <div className="flex items-center justify-end gap-2">
                                    <Link
                                      href={`/profile/${req.student?.uid}`}
                                      className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                                    >
                                      <span>View Profile</span>
                                      <ArrowUpRight className="w-3.5 h-3.5" />
                                    </Link>
                                  </div>
                                ) : (
                                  <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">
                                    No action
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {isAlumni && activeTab === "MENTEES" && (
            <div className="space-y-6">
              {loadingMentees ? (
                <div className="p-12 text-center text-gray-500 dark:text-gray-400 space-y-3 bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-gray-800">
                  <div className="w-8 h-8 border-3 border-zinc-900 dark:border-zinc-100 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-sm font-medium">Loading your mentees...</p>
                </div>
              ) : mentees.length === 0 ? (
                <div className="p-12 text-center space-y-4 bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-gray-800">
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
                    <Users className="w-7 h-7" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                      No active mentees yet
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                      Accept incoming student requests from your Mentorship Requests tab to start guiding mentees.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab("REQUESTS")}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 rounded-xl text-xs sm:text-sm font-semibold hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors cursor-pointer"
                  >
                    <span>View Mentorship Requests</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {mentees.map(({ requestId, mentee }) => (
                    <div
                      key={requestId || mentee.id}
                      className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
                    >
                      <div className="space-y-4">
                        <div className="flex items-start gap-3.5">
                          <Link
                            href={`/profile/${mentee.uid}`}
                            className="w-12 h-12 rounded-full overflow-hidden relative shrink-0 border border-gray-200 dark:border-zinc-700"
                          >
                            <Image
                              src={mentee.profileImage || user_placeholder}
                              alt={mentee.name || "Mentee"}
                              fill
                              className="object-cover"
                            />
                          </Link>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <Link
                                href={`/profile/${mentee.uid}`}
                                className="font-bold text-base text-gray-900 dark:text-white hover:underline truncate block"
                              >
                                {mentee.name || "Student"}
                              </Link>
                            </div>
                            <span className="inline-block mt-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-300 border border-blue-100 dark:border-blue-900/50">
                              Active Mentee
                            </span>
                          </div>
                        </div>

                        <div className="space-y-1.5 pt-1 text-xs text-gray-600 dark:text-gray-300 border-t border-gray-100 dark:border-zinc-800">
                          {mentee.studentProfile?.department && (
                            <p className="font-medium">
                              Dept. of {mentee.studentProfile.department}
                              {mentee.studentProfile.batch && ` • Batch ${mentee.studentProfile.batch}`}
                            </p>
                          )}

                          {mentee.studentProfile?.careerGoal && !mentee.studentProfile.careerGoal.startsWith("{") && (
                            <p className="text-gray-500 dark:text-gray-400 line-clamp-2 italic pt-1">
                              Goal: "{mentee.studentProfile.careerGoal}"
                            </p>
                          )}

                          {mentee.studentProfile?.skills && mentee.studentProfile.skills.length > 0 && (
                            <div className="flex flex-wrap gap-1 pt-2">
                              {mentee.studentProfile.skills.slice(0, 3).map((skill) => (
                                <span
                                  key={skill}
                                  className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300"
                                >
                                  {skill}
                                </span>
                              ))}
                              {mentee.studentProfile.skills.length > 3 && (
                                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-gray-100 dark:bg-zinc-800 text-gray-500">
                                  +{mentee.studentProfile.skills.length - 3}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="mt-5 pt-4 border-t border-gray-100 dark:border-zinc-800 flex flex-col gap-2">
                        <Link
                          href={`/mentorship/${requestId}?studentUid=${mentee.uid}`}
                          className="w-full inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-900 dark:text-white border border-gray-200 dark:border-zinc-700 text-xs font-semibold transition-colors cursor-pointer"
                        >
                          <ListTodo className="w-3.5 h-3.5" />
                          <span>Manage Tasks</span>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {isStudent && activeTab === "MENTORS" && (
            <div className="space-y-6">
              {loadingMentors ? (
                <div className="p-12 text-center text-gray-500 dark:text-gray-400 space-y-3 bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-gray-800">
                  <div className="w-8 h-8 border-3 border-zinc-900 dark:border-zinc-100 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-sm font-medium">Loading your alumni mentors...</p>
                </div>
              ) : mentors.length === 0 ? (
                <div className="p-12 text-center space-y-4 bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-gray-800">
                  <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
                    <GraduationCap className="w-7 h-7" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                      No active mentors yet
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                      Explore alumni profiles in your network to request mentorship and receive career guidance.
                    </p>
                  </div>
                  <Link
                    href="/network"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 rounded-xl text-xs sm:text-sm font-semibold hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
                  >
                    <span>Browse Alumni Network</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {mentors.map(({ requestId, mentor }) => (
                    <div
                      key={requestId || mentor.id}
                      className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
                    >
                      <div className="space-y-4">
                        <div className="flex items-start gap-3.5">
                          <Link
                            href={`/profile/${mentor.uid}`}
                            className="w-12 h-12 rounded-full overflow-hidden relative shrink-0 border border-gray-200 dark:border-zinc-700"
                          >
                            <Image
                              src={mentor.profileImage || user_placeholder}
                              alt={mentor.name || "Mentor"}
                              fill
                              className="object-cover"
                            />
                          </Link>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <Link
                                href={`/profile/${mentor.uid}`}
                                className="font-bold text-base text-gray-900 dark:text-white hover:underline truncate block"
                              >
                                {mentor.name || "Alumni"}
                              </Link>
                            </div>
                            <span className="inline-block mt-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-900/50">
                              Your Mentor
                            </span>
                          </div>
                        </div>

                        <div className="space-y-1.5 pt-1 text-xs text-gray-600 dark:text-gray-300 border-t border-gray-100 dark:border-zinc-800">
                          {mentor.alumniProfile?.currentPosition && (
                            <p className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                              <Briefcase className="w-3.5 h-3.5 text-gray-400" />
                              <span>
                                {mentor.alumniProfile.currentPosition}
                                {mentor.alumniProfile.currentCompany && ` at ${mentor.alumniProfile.currentCompany}`}
                              </span>
                            </p>
                          )}

                          {mentor.alumniProfile?.mentorshipDomains && mentor.alumniProfile.mentorshipDomains.length > 0 && (
                            <div className="pt-2">
                              <p className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 mb-1">
                                Mentorship Domains:
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {mentor.alumniProfile.mentorshipDomains.slice(0, 3).map((domain) => (
                                  <span
                                    key={domain}
                                    className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-900/40"
                                  >
                                    {domain}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="mt-5 pt-4 border-t border-gray-100 dark:border-zinc-800 flex flex-col gap-2">
                        <Link
                          href={`/mentorship/${requestId}?alumniUid=${mentor.uid}`}
                          className="w-full inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-900 dark:text-white border border-gray-200 dark:border-zinc-700 text-xs font-semibold transition-colors cursor-pointer"
                        >
                          <ListTodo className="w-3.5 h-3.5" />
                          <span>Show all tasks</span>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {isStudent && activeTab === "SENT_REQUESTS" && (
            <div className="space-y-5">
              <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
                {loadingSent ? (
                  <div className="p-12 text-center text-gray-500 dark:text-gray-400 space-y-3">
                    <div className="w-8 h-8 border-3 border-zinc-900 dark:border-zinc-100 border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-sm font-medium">Loading sent requests...</p>
                  </div>
                ) : filteredSentRequests.length === 0 ? (
                  <div className="p-12 text-center space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-zinc-800 flex items-center justify-center mx-auto text-gray-400">
                      <Inbox className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-base text-gray-900 dark:text-white">
                      No sent mentorship requests
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                      Visit alumni profiles to send mentorship requests and seek career guidance.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50/75 dark:bg-zinc-950/40 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          <th className="py-3.5 px-4 sm:px-6">Alumni Mentor</th>
                          <th className="py-3.5 px-4">Your Note</th>
                          <th className="py-3.5 px-4">Date Sent</th>
                          <th className="py-3.5 px-4 text-center">Status</th>
                          <th className="py-3.5 px-4 sm:px-6 text-right">Profile</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-zinc-800/80 text-sm">
                        {filteredSentRequests.map((req) => {
                          const formattedDate = req.createdAt
                            ? new Date(req.createdAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })
                            : "Recently";

                          return (
                            <tr
                              key={req.id}
                              className="hover:bg-gray-50/80 dark:hover:bg-zinc-800/40 transition-colors"
                            >
                              <td className="py-4 px-4 sm:px-6 align-middle">
                                <div className="flex items-center gap-3">
                                  <Link
                                    href={`/profile/${req.alumni?.uid}`}
                                    className="w-10 h-10 rounded-full overflow-hidden relative shrink-0 border border-gray-200 dark:border-zinc-700 hover:opacity-90 transition-opacity"
                                  >
                                    <Image
                                      src={req.alumni?.profileImage || user_placeholder}
                                      alt={req.alumni?.name || "Alumni"}
                                      fill
                                      className="object-cover"
                                    />
                                  </Link>
                                  <div className="min-w-0">
                                    <Link
                                      href={`/profile/${req.alumni?.uid}`}
                                      className="font-bold text-gray-900 dark:text-white hover:underline truncate block leading-snug"
                                    >
                                      {req.alumni?.name || "Alumni"}
                                    </Link>
                                  </div>
                                </div>
                              </td>

                              <td className="py-4 px-4 align-middle max-w-xs">
                                {req.message ? (
                                  <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 line-clamp-2 italic">
                                    "{req.message}"
                                  </p>
                                ) : (
                                  <span className="text-xs text-gray-400 italic">No note attached</span>
                                )}
                              </td>

                              <td className="py-4 px-4 align-middle text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">
                                {formattedDate}
                              </td>

                              <td className="py-4 px-4 align-middle text-center whitespace-nowrap">
                                {req.status === "PENDING" && (
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                    Pending Response
                                  </span>
                                )}
                                {req.status === "ACCEPTED" && (
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                    <Check className="w-3 h-3" />
                                    Accepted
                                  </span>
                                )}
                                {req.status === "REJECTED" && (
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                                    <X className="w-3 h-3" />
                                    Declined
                                  </span>
                                )}
                              </td>

                              <td className="py-4 px-4 sm:px-6 align-middle text-right whitespace-nowrap">
                                <Link
                                  href={`/profile/${req.alumni?.uid}`}
                                  className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                                >
                                  <span>View Profile</span>
                                  <ArrowUpRight className="w-3.5 h-3.5" />
                                </Link>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>

        {/* Message View Modal */}
        {selectedMessage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-gray-800 w-full max-w-lg overflow-hidden shadow-2xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-zinc-800 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden relative shrink-0 border border-gray-200 dark:border-zinc-700">
                    <Image
                      src={selectedMessage.student?.profileImage || user_placeholder}
                      alt={selectedMessage.student?.name || "Student"}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-gray-900 dark:text-white">
                      {selectedMessage.student?.name || "Student"}
                    </h4>
                    <p className="text-xs text-gray-500">Sent on {selectedMessage.date}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedMessage(null)}
                  className="p-1 rounded-lg text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-800 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Student's Note & Guidance Goal
                </label>
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-zinc-800/60 border border-gray-200 dark:border-zinc-800 text-sm text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">
                  {selectedMessage.message}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Link
                  href={`/profile/${selectedMessage.student?.uid}`}
                  onClick={() => setSelectedMessage(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold border border-gray-200 dark:border-zinc-700 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  View Student Profile
                </Link>
                <button
                  type="button"
                  onClick={() => setSelectedMessage(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
