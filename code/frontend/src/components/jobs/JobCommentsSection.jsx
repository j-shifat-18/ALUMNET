"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import user_placeholder from "../../../public/placeholder-user.jpg";
import axiosInstance from "@/lib/axios";
import { Send, Trash2, Loader2, MessageSquare } from "lucide-react";
import Swal from "sweetalert2";

export default function JobCommentsSection({
  jobId,
  comments = [],
  currentUser,
  onCommentAdded,
  onCommentDeleted,
}) {
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      const res = await axiosInstance.post(`/api/v1/jobs/${jobId}/comments`, {
        content: newComment.trim(),
      });

      if (res.data?.data) {
        onCommentAdded?.(res.data.data);
        setNewComment("");
      }
    } catch (err) {
      console.error("Error adding comment to job:", err);
      Swal.fire({
        title: "Error",
        text: err.response?.data?.message || "Failed to post question. Please try again.",
        icon: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (commentId) => {
    const result = await Swal.fire({
      title: "Delete comment?",
      text: "Are you sure you want to remove this comment?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#4b5563",
      confirmButtonText: "Yes, delete",
    });

    if (!result.isConfirmed) return;

    try {
      setDeletingId(commentId);
      await axiosInstance.delete(`/api/v1/jobs/comments/${commentId}`);
      onCommentDeleted?.(commentId);
    } catch (err) {
      console.error("Error deleting comment:", err);
      Swal.fire({
        title: "Error",
        text: err.response?.data?.message || "Failed to delete comment.",
        icon: "error",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now - date;
      const diffSecs = Math.floor(diffMs / 1000);
      const diffMins = Math.floor(diffSecs / 60);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffSecs < 60) return "Just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    } catch {
      return "";
    }
  };

  return (
    <div className="pt-4 border-t border-gray-100 dark:border-gray-800 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400">
        <MessageSquare className="w-4 h-4 text-blue-500" />
        <span>Questions & Discussion ({comments.length})</span>
      </div>

      {/* Comment Input */}
      {currentUser ? (
        <form onSubmit={handleSubmit} className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full overflow-hidden relative shrink-0 border border-gray-200 dark:border-gray-700 mt-1">
            <Image
              src={currentUser?.profileImage || user_placeholder}
              alt={currentUser?.name || "User"}
              fill
              className="object-cover"
            />
          </div>

          <div className="flex-1 flex gap-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Ask a question or inquire about referrals..."
              className="flex-1 px-3.5 py-2 text-sm bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
            <button
              type="submit"
              disabled={isSubmitting || !newComment.trim()}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all shrink-0 flex items-center justify-center cursor-pointer shadow-sm"
              title="Post question"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
        </form>
      ) : (
        <p className="text-xs text-gray-400 py-2">
          Please{" "}
          <Link href="/login" className="text-blue-500 underline">
            sign in
          </Link>{" "}
          to ask questions or leave a comment.
        </p>
      )}

      {/* Comments List */}
      <div className="space-y-3">
        {comments.length === 0 ? (
          <p className="text-xs text-gray-400 dark:text-gray-500 italic py-1">
            No questions or comments yet. Be the first to ask!
          </p>
        ) : (
          comments.map((comment) => {
            const author = comment.user || {};
            const isAuthor =
              currentUser?.uid &&
              (currentUser.uid === author.uid || currentUser.id === author.id);
            const isAdmin = currentUser?.role === "ADMIN";
            const canDelete = isAuthor || isAdmin;

            return (
              <div
                key={comment.id}
                className="flex items-start gap-3 p-3 rounded-xl bg-gray-50/70 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800/80 group transition-all"
              >
                <Link
                  href={`/profile/${author.uid || ""}`}
                  className="w-7 h-7 rounded-full overflow-hidden relative shrink-0 border border-gray-200 dark:border-gray-700 mt-0.5"
                >
                  <Image
                    src={author.profileImage || user_placeholder}
                    alt={author.name || "User"}
                    fill
                    className="object-cover"
                  />
                </Link>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link
                        href={`/profile/${author.uid || ""}`}
                        className="text-xs font-bold text-gray-900 dark:text-white hover:underline truncate"
                      >
                        {author.name || "Alumni"}
                      </Link>
                      {author.role && (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                          {author.role}
                        </span>
                      )}
                      <span className="text-[11px] text-gray-400">
                        • {formatTime(comment.createdAt)}
                      </span>
                    </div>

                    {canDelete && (
                      <button
                        type="button"
                        onClick={() => handleDelete(comment.id)}
                        disabled={deletingId === comment.id}
                        className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 rounded transition-all cursor-pointer"
                        title="Delete comment"
                      >
                        {deletingId === comment.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}
                  </div>

                  <p className="text-xs text-gray-700 dark:text-gray-300 mt-1 whitespace-pre-line leading-relaxed">
                    {comment.content}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
