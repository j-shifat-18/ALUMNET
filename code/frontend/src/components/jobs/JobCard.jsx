"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import user_placeholder from "../../../public/placeholder-user.jpg";
import JobCommentsSection from "./JobCommentsSection";
import axiosInstance from "@/lib/axios";
import Swal from "sweetalert2";
import {
  Building2,
  MapPin,
  Briefcase,
  DollarSign,
  Calendar,
  Globe,
  GraduationCap,
  ExternalLink,
  MessageSquare,
  PencilLine,
  Trash2,
  ChevronDown,
  ChevronUp,
  Mail,
  Clock,
  Sparkles,
} from "lucide-react";

export default function JobCard({
  job,
  currentUser,
  onEdit,
  onDelete,
}) {
  const [commentsExpanded, setCommentsExpanded] = useState(false);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const [comments, setComments] = useState(job.comments || []);
  const [commentsCount, setCommentsCount] = useState(job._count?.comments || (job.comments?.length || 0));
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [hasLoadedComments, setHasLoadedComments] = useState(Boolean(job.comments));

  const poster = job.poster || {};
  const isOwner =
    currentUser?.uid &&
    (currentUser.uid === poster.uid || currentUser.id === poster.id);
  const isAdmin = currentUser?.role === "ADMIN";
  const canManage = isOwner || isAdmin;

  // Toggle comments and fetch them if not loaded
  const toggleComments = async () => {
    if (!commentsExpanded && !hasLoadedComments) {
      try {
        setIsLoadingComments(true);
        const res = await axiosInstance.get(`/api/v1/jobs/${job.id}`);
        if (res.data?.data?.comments) {
          setComments(res.data.data.comments);
          setCommentsCount(res.data.data.comments.length);
          setHasLoadedComments(true);
        }
      } catch (err) {
        console.error("Error loading job comments:", err);
      } finally {
        setIsLoadingComments(false);
      }
    }
    setCommentsExpanded((prev) => !prev);
  };

  const handleCommentAdded = (newComment) => {
    setComments((prev) => [...prev, newComment]);
    setCommentsCount((prev) => prev + 1);
  };

  const handleCommentDeleted = (commentId) => {
    setComments((prev) => prev.filter((c) => c.id !== commentId));
    setCommentsCount((prev) => Math.max(0, prev - 1));
  };

  const handleDeleteJob = async () => {
    const result = await Swal.fire({
      title: "Delete this opportunity?",
      text: "Are you sure you want to remove this job post? This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#4b5563",
      confirmButtonText: "Yes, delete",
    });

    if (!result.isConfirmed) return;

    try {
      await axiosInstance.delete(`/api/v1/jobs/${job.id}`);
      Swal.fire({
        title: "Deleted!",
        text: "Job post has been deleted.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
      onDelete?.(job.id);
    } catch (err) {
      console.error("Error deleting job post:", err);
      Swal.fire({
        title: "Error",
        text: err.response?.data?.message || "Failed to delete job post.",
        icon: "error",
      });
    }
  };

  const formatJobType = (type) => {
    switch (type) {
      case "FULL_TIME":
        return { label: "Full-Time", color: "bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300 border-blue-200 dark:border-blue-900" };
      case "INTERNSHIP":
        return { label: "Internship", color: "bg-purple-100 text-purple-800 dark:bg-purple-950/70 dark:text-purple-300 border-purple-200 dark:border-purple-900" };
      case "REFERRAL":
        return { label: "Alumni Referral", color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900" };
      case "RESEARCH":
        return { label: "Research", color: "bg-indigo-100 text-indigo-800 dark:bg-indigo-950/70 dark:text-indigo-300 border-indigo-200 dark:border-indigo-900" };
      case "PART_TIME":
        return { label: "Part-Time", color: "bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border-amber-200 dark:border-amber-900" };
      case "CONTRACT":
        return { label: "Contract", color: "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700" };
      default:
        return { label: type || "Job", color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300" };
    }
  };

  const formatWorkMode = (mode) => {
    switch (mode) {
      case "REMOTE":
        return { label: "Remote", icon: Globe, color: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50" };
      case "HYBRID":
        return { label: "Hybrid", icon: Building2, color: "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/50" };
      default:
        return { label: "In-Person", icon: MapPin, color: "text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800" };
    }
  };

  const isDeadlinePassed = (dateString) => {
    if (!dateString) return false;
    return new Date(dateString) < new Date();
  };

  const formatDeadline = (dateString) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatRelativeTime = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now - date;
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffHours / 24);

      if (diffHours < 1) return "Just now";
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays === 1) return "Yesterday";
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    } catch {
      return "";
    }
  };

  const typeConfig = formatJobType(job.jobType);
  const modeConfig = formatWorkMode(job.workMode);
  const ModeIcon = modeConfig.icon;
  const deadlinePassed = isDeadlinePassed(job.deadline);
  const deadlineFormatted = formatDeadline(job.deadline);

  // Profile details of poster
  const posterSub = poster.role === "ALUMNI" ? poster.alumniProfile : poster.studentProfile;
  const posterBatch = posterSub?.batch;
  const posterDept = posterSub?.department;
  const posterCurrentJob = poster.role === "ALUMNI" && poster.alumniProfile?.currentPosition
    ? `${poster.alumniProfile.currentPosition} at ${poster.alumniProfile.currentCompany || "tech"}`
    : null;

  const isEmailApplication =
    job.applicationUrl &&
    (job.applicationUrl.includes("@") && !job.applicationUrl.startsWith("http"));
  const applicationHref = isEmailApplication
    ? `mailto:${job.applicationUrl}?subject=Application for ${encodeURIComponent(job.title)}`
    : job.applicationUrl?.startsWith("http")
    ? job.applicationUrl
    : `https://${job.applicationUrl}`;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm hover:shadow-md transition-all space-y-4">
      {/* Top Header: Poster Info & Options */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href={`/profile/${poster.uid || ""}`}
            className="w-11 h-11 rounded-full overflow-hidden relative shrink-0 border border-gray-200 dark:border-gray-700 hover:ring-2 hover:ring-blue-500 transition-all"
          >
            <Image
              src={poster.profileImage || user_placeholder}
              alt={poster.name || "User"}
              fill
              className="object-cover"
            />
          </Link>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Link
                href={`/profile/${poster.uid || ""}`}
                className="font-bold text-sm text-gray-900 dark:text-white hover:underline truncate"
              >
                {poster.name || "AlumNet Member"}
              </Link>
              {poster.role && (
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                  {poster.role}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 flex-wrap truncate mt-0.5">
              {posterCurrentJob && (
                <span className="text-gray-700 dark:text-gray-300 font-medium truncate">
                  {posterCurrentJob} •
                </span>
              )}
              {posterBatch && <span>Batch {posterBatch} •</span>}
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-gray-400" />
                {formatRelativeTime(job.createdAt)}
              </span>
            </div>
          </div>
        </div>

        {/* Poster Edit / Delete Buttons */}
        {canManage && (
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => onEdit?.(job)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              title="Edit job opportunity"
            >
              <PencilLine className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleDeleteJob}
              className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
              title="Delete job opportunity"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Main Job Title & Company */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2.5 flex-wrap">
          <h3 className="font-bold text-lg md:text-xl text-gray-900 dark:text-white leading-snug">
            {job.title}
          </h3>
          <span
            className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${typeConfig.color}`}
          >
            {typeConfig.label}
          </span>
        </div>

        <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300 flex-wrap font-medium">
          <span className="flex items-center gap-1 text-gray-900 dark:text-gray-100 font-semibold">
            <Building2 className="w-4 h-4 text-gray-400" />
            {job.company}
          </span>

          <span
            className={`inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-md font-medium ${modeConfig.color}`}
          >
            <ModeIcon className="w-3.5 h-3.5" />
            {modeConfig.label}
          </span>

          {job.location && (
            <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
              <MapPin className="w-3.5 h-3.5 text-gray-400" />
              {job.location}
            </span>
          )}

          {job.department && (
            <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
              <GraduationCap className="w-3.5 h-3.5 text-gray-400" />
              {job.department}
            </span>
          )}
        </div>
      </div>

      {/* Highlights: Salary & Deadline */}
      {(job.salaryRange || job.deadline) && (
        <div className="flex items-center gap-2 flex-wrap pt-1 text-xs">
          {job.salaryRange && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 font-semibold border border-emerald-200 dark:border-emerald-800/60">
              <DollarSign className="w-3.5 h-3.5" />
              {job.salaryRange}
            </span>
          )}

          {job.deadline && (
            <span
              className={`inline-flex items-center gap-1 px-3 py-1 rounded-xl font-semibold border ${
                deadlinePassed
                  ? "bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400 border-red-200 dark:border-red-800/60"
                  : "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200 dark:border-amber-800/60"
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              {deadlinePassed ? `Deadline closed (${deadlineFormatted})` : `Deadline: ${deadlineFormatted}`}
            </span>
          )}
        </div>
      )}

      {/* Description */}
      <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
        {descriptionExpanded || job.description.length <= 240 ? (
          job.description
        ) : (
          <>
            {job.description.slice(0, 240)}...{" "}
            <button
              type="button"
              onClick={() => setDescriptionExpanded(true)}
              className="text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-block cursor-pointer"
            >
              Read more
            </button>
          </>
        )}
        {descriptionExpanded && job.description.length > 240 && (
          <button
            type="button"
            onClick={() => setDescriptionExpanded(false)}
            className="text-blue-600 dark:text-blue-400 font-semibold hover:underline block mt-1 cursor-pointer"
          >
            Show less
          </button>
        )}
      </div>

      {/* Requirements (if available) */}
      {job.requirements && (
        <div className="p-3 rounded-xl bg-gray-50/80 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 text-xs text-gray-600 dark:text-gray-300 space-y-1">
          <p className="font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider text-[10px]">
            Key Requirements
          </p>
          <p className="whitespace-pre-line leading-relaxed">{job.requirements}</p>
        </div>
      )}

      {/* Skills Tags */}
      {Array.isArray(job.skills) && job.skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {job.skills.map((skill) => (
            <span
              key={skill}
              className="text-xs px-2.5 py-0.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium"
            >
              #{skill}
            </span>
          ))}
        </div>
      )}

      {/* Action Footer: Apply & Discussion Toggle */}
      <div className="flex items-center justify-between gap-3 pt-3 border-t border-gray-100 dark:border-gray-800 flex-wrap">
        <button
          type="button"
          onClick={toggleComments}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 py-1.5 px-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
        >
          <MessageSquare className="w-4 h-4 text-blue-500" />
          <span>{commentsCount} {commentsCount === 1 ? "Question" : "Questions"}</span>
          {commentsExpanded ? (
            <ChevronUp className="w-3.5 h-3.5" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5" />
          )}
        </button>

        {job.applicationUrl ? (
          <a
            href={applicationHref}
            target={isEmailApplication ? "_self" : "_blank"}
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-sm shadow-blue-500/20 cursor-pointer"
          >
            {isEmailApplication ? <Mail className="w-3.5 h-3.5" /> : <ExternalLink className="w-3.5 h-3.5" />}
            <span>Apply Now</span>
          </a>
        ) : (
          <span className="text-xs text-gray-400 italic">No external link (Inquire in questions)</span>
        )}
      </div>

      {/* Comments Thread (Expandable) */}
      {commentsExpanded && (
        <JobCommentsSection
          jobId={job.id}
          comments={comments}
          currentUser={currentUser}
          onCommentAdded={handleCommentAdded}
          onCommentDeleted={handleCommentDeleted}
        />
      )}
    </div>
  );
}
