"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import user_placeholder from "../../../public/placeholder-user.jpg";
import {
  Building2,
  MapPin,
  Briefcase,
  Banknote,
  Calendar,
  Clock,
  MessageSquare,
  Pencil,
  Trash2,
  ChevronRight,
  ArrowRight,
} from "lucide-react";

export const getJobTypeBadgeStyle = (type) => {
  switch (type) {
    case "FULL_TIME":
      return "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800/60";
    case "INTERNSHIP":
      return "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60";
    case "REFERRAL":
      return "bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800/60";
    case "RESEARCH":
      return "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/60";
    case "PART_TIME":
      return "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800/60";
    case "CONTRACT":
      return "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700";
    default:
      return "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700";
  }
};

export const formatJobTypeLabel = (type) => {
  switch (type) {
    case "FULL_TIME":
      return "Full-Time";
    case "INTERNSHIP":
      return "Internship";
    case "REFERRAL":
      return "Alumni Referral";
    case "RESEARCH":
      return "Research Position";
    case "PART_TIME":
      return "Part-Time";
    case "CONTRACT":
      return "Contract";
    default:
      return type || "Opportunity";
  }
};

export const formatWorkModeLabel = (mode) => {
  switch (mode) {
    case "REMOTE":
      return "Remote";
    case "HYBRID":
      return "Hybrid";
    default:
      return "In-Person";
  }
};

export const formatRelativeTime = (dateString) => {
  if (!dateString) return "Recently";
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

export const formatDeadline = (dateString) => {
  if (!dateString) return null;
  try {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return null;
  }
};

export const isDeadlinePassed = (dateString) => {
  if (!dateString) return false;
  return new Date(dateString) < new Date();
};

export default function JobCard({
  job,
  currentUser,
  onEdit,
  onDelete,
  onViewDetails,
}) {
  const poster = job.poster || {};
  const isOwner =
    currentUser?.uid &&
    (currentUser.uid === poster.uid || currentUser.id === poster.id);
  const isAdmin = currentUser?.role === "ADMIN";
  const canManage = isOwner || isAdmin;

  const commentsCount =
    job._count?.comments !== undefined
      ? job._count.comments
      : job.comments?.length || 0;

  const deadlinePassed = isDeadlinePassed(job.deadline);
  const deadlineFormatted = formatDeadline(job.deadline);

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-200/80 dark:border-gray-800 p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group">
      <div>
        {/* Top Header: Badge & Actions */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-13 h-13 rounded-2xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 flex flex-col items-center justify-center shrink-0 shadow-xs">
              <Briefcase className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span
                className={`inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${getJobTypeBadgeStyle(
                  job.jobType
                )}`}
              >
                {formatJobTypeLabel(job.jobType)}
              </span>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1 font-medium truncate">
                <Clock className="w-3.5 h-3.5 shrink-0" />
                <span>{formatRelativeTime(job.createdAt)}</span>
              </p>
            </div>
          </div>

          {canManage && (
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => onEdit?.(job)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors cursor-pointer"
                title="Edit Opportunity"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onDelete?.(job.id, job.title)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                title="Delete Opportunity"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Title, Company & Snippet */}
        <div className="space-y-1.5 mt-4">
          <button
            type="button"
            onClick={() => onViewDetails?.(job)}
            className="block text-left group/title w-full"
          >
            <h3 className="font-bold text-base text-gray-900 dark:text-white leading-snug group-hover/title:text-blue-600 dark:group-hover/title:text-blue-400 transition-colors line-clamp-2">
              {job.title}
            </h3>
          </button>

          <div className="flex items-center gap-2 text-xs font-semibold text-gray-700 dark:text-gray-300 flex-wrap">
            <span className="flex items-center gap-1 text-gray-900 dark:text-gray-100 font-bold">
              <Building2 className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <span className="truncate">{job.company}</span>
            </span>
            {job.department && (
              <>
                <span className="text-gray-300 dark:text-gray-700">•</span>
                <span className="text-gray-500 dark:text-gray-400 truncate">
                  {job.department}
                </span>
              </>
            )}
          </div>

          {job.description && (
            <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-3 leading-relaxed">
              {job.description}
            </p>
          )}
        </div>

        {/* Metadata Details */}
        <div className="pt-3 border-t border-gray-100 dark:border-zinc-800/80 space-y-2 text-xs text-gray-600 dark:text-gray-400 mt-4">
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <span className="truncate">
              {job.location
                ? `${job.location} • ${formatWorkModeLabel(job.workMode)}`
                : formatWorkModeLabel(job.workMode)}
            </span>
          </div>

          {job.salaryRange && (
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold">
              <Banknote className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{job.salaryRange}</span>
            </div>
          )}

          {job.deadline && (
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <span
                className={
                  deadlinePassed ? "text-rose-500 font-semibold" : ""
                }
              >
                {deadlinePassed
                  ? `Deadline Closed (${deadlineFormatted})`
                  : `Deadline: ${deadlineFormatted}`}
              </span>
            </div>
          )}

          {/* Discussion count pill */}
          <button
            type="button"
            onClick={() => onViewDetails?.(job)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-gray-900 dark:text-gray-100 text-[11px] font-semibold transition-colors cursor-pointer group/att"
            title="View discussion and questions"
          >
            <MessageSquare className="w-3.5 h-3.5 text-blue-500" />
            <span>{commentsCount} Questions & Discussion</span>
            <ChevronRight className="w-3 h-3 text-gray-400 group-hover/att:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>

      {/* Card Footer: Poster & CTA */}
      <div className="mt-5 pt-4 border-t border-gray-100 dark:border-zinc-800/80 flex items-center justify-between gap-3">
        {poster?.uid ? (
          <Link
            href={`/profile/${poster.uid}`}
            className="flex items-center gap-2 min-w-0 group/poster"
          >
            <div className="w-7 h-7 rounded-full overflow-hidden relative shrink-0 border border-gray-200 dark:border-zinc-700">
              <Image
                src={poster.profileImage || user_placeholder}
                alt={poster.name || "Poster"}
                fill
                className="object-cover"
              />
            </div>
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 truncate group-hover/poster:underline">
              {poster.name || "Alumni"}
            </span>
          </Link>
        ) : (
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-full overflow-hidden relative shrink-0 border border-gray-200 dark:border-zinc-700">
              <Image
                src={user_placeholder}
                alt="Member"
                fill
                className="object-cover"
              />
            </div>
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 truncate">
              {poster.name || "Alumni"}
            </span>
          </div>
        )}

        <button
          type="button"
          onClick={() => onViewDetails?.(job)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-xs font-bold transition-all shadow-2xs shrink-0 cursor-pointer"
        >
          <span>View Details</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
