"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, MessageSquare, Send, Trash2, Loader2, MoreVertical, Pencil, ThumbsUp } from "lucide-react";
import placeholderUser from "../../../../public/placeholder-user.jpg";
import axiosInstance from "@/lib/axios";
import Swal from "sweetalert2";

export default function PostCard({ post, currentUser, onDelete }) {
  const [isLiked, setIsLiked] = useState(post?.isLiked || false);
  const [likesCount, setLikesCount] = useState(post?.likesCount || post?._count?.likes || 0);
  const [commentsCount, setCommentsCount] = useState(post?.commentsCount || post?._count?.comments || 0);
  
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState(post?.comments || []);
  const [newComment, setNewComment] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const [isLiking, setIsLiking] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState(null);

  useEffect(() => {
    if (!currentUser || !post?.id) return;
    axiosInstance
      .get(`/api/v1/posts/${post.id}/likes/status`)
      .then((res) => {
        if (res.data?.data) {
          setIsLiked(res.data.data.liked);
          setLikesCount(res.data.data.likesCount);
        }
      })
      .catch(() => {

      });
  }, [currentUser, post?.id]);

  const authorId = post.author?.uid || post.author?.id;

  const getTruncatedContent = (text, maxLength = 260) => {
    if (!text) return "";
    const lines = text.split("\n");
    if (lines.length > 3) {
      return lines.slice(0, 3).join("\n");
    }
    if (text.length > maxLength) {
      const sliced = text.slice(0, maxLength);
      const lastSpace = sliced.lastIndexOf(" ");
      return (lastSpace > 180 ? sliced.slice(0, lastSpace) : sliced).trimEnd();
    }
    return text;
  };

  const isOwner = currentUser && (
    currentUser.uid === post.author?.uid || 
    currentUser.email === post.author?.email
  );

  const handleDeletePost = async () => {
    const result = await Swal.fire({
      title: "Are you sure?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#4b5563",
      confirmButtonText: "Yes, delete it!",
    });

    if (!result.isConfirmed) return;

    setIsDeleting(true);
    try {
      await axiosInstance.delete(`/api/v1/posts/${post.id}`);
      Swal.fire({
        title: "Deleted!",
        text: "Your post has been deleted.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
      if (onDelete) {
        onDelete(post.id);
      }
    } catch (err) {
      console.error("Error deleting post:", err);
      Swal.fire({
        title: "Error!",
        text: err.response?.data?.message || "Failed to delete post.",
        icon: "error",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleLike = async () => {
    if (isLiking || !currentUser) return;

    const prevLiked = isLiked;
    const prevCount = likesCount;

    setIsLiked(!prevLiked);
    setLikesCount(prevLiked ? Math.max(0, prevCount - 1) : prevCount + 1);
    setIsLiking(true);

    try {
      const res = await axiosInstance.post(`/api/v1/posts/${post.id}/likes/toggle`);
      if (res.data?.data) {
        setIsLiked(res.data.data.liked);
      }
    } catch (err) {
      console.error("Error toggling like:", err);
      setIsLiked(prevLiked);
      setLikesCount(prevCount);
    } finally {
      setIsLiking(false);
    }
  };

  const fetchComments = async () => {
    setLoadingComments(true);
    try {
      const res = await axiosInstance.get(`/api/v1/posts/${post.id}/comments`);
      if (res.data?.data) {
        setComments(res.data.data);
        setCommentsCount(res.data.data.length);
      }
    } catch (err) {
      console.error("Error fetching comments:", err);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleToggleComments = () => {
    const nextShowState = !showComments;
    setShowComments(nextShowState);
    if (nextShowState) {
      fetchComments();
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmittingComment) return;

    setIsSubmittingComment(true);
    try {
      const res = await axiosInstance.post(`/api/v1/posts/${post.id}/comments`, {
        content: newComment.trim(),
      });
      if (res.data?.data) {
        setComments((prev) => [...prev, res.data.data]);
        setCommentsCount((prev) => prev + 1);
        setNewComment("");
      }
    } catch (err) {
      console.error("Error adding comment:", err);
      Swal.fire({
        title: "Error!",
        text: err.response?.data?.message || "Failed to post comment.",
        icon: "error",
      });
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      setDeletingCommentId(commentId);
      await axiosInstance.delete(`/api/v1/comments/${commentId}`);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      setCommentsCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Error deleting comment:", err);
      Swal.fire({
        title: "Error!",
        text: err.response?.data?.message || "Failed to delete comment.",
        icon: "error",
      });
    } finally {
      setDeletingCommentId(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800 shadow-sm space-y-4 overflow-hidden min-w-0">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {authorId ? (
            <Link
              href={`/profile/${authorId}`}
              className="w-10 h-10 rounded-full overflow-hidden relative border border-gray-200 dark:border-gray-700 shrink-0 cursor-pointer"
            >
              <Image
                src={post.author?.profileImage || placeholderUser}
                alt={post.author?.name || "Author"}
                fill
                className="object-cover"
              />
            </Link>
          ) : (
            <div className="w-10 h-10 rounded-full overflow-hidden relative border border-gray-200 dark:border-gray-700 shrink-0">
              <Image
                src={post.author?.profileImage || placeholderUser}
                alt={post.author?.name || "Author"}
                fill
                className="object-cover"
              />
            </div>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              {authorId ? (
                <Link
                  href={`/profile/${authorId}`}
                  className="font-semibold text-gray-900 dark:text-white leading-tight truncate cursor-pointer"
                >
                  {post.author?.name || "User"}
                </Link>
              ) : (
                <h4 className="font-semibold text-gray-900 dark:text-white leading-tight truncate">
                  {post.author?.name || "User"}
                </h4>
              )}
              {post.author?.role && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 uppercase tracking-wider font-medium">
                  {post.author.role}
                </span>
              )}
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400 block mt-0.5">
              {formatDate(post.createdAt)}
            </span>
          </div>
        </div>

        {isOwner && (
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => setShowDropdown((prev) => !prev)}
              disabled={isDeleting}
              className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors hover:cursor-pointer"
              title="Options"
            >
              {isDeleting ? (
                <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
              ) : (
                <MoreVertical className="w-5 h-5" />
              )}
            </button>

            {showDropdown && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowDropdown(false)}
                />

                <div className="absolute right-0 mt-1 w-36 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-20 py-1 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => {
                      setShowDropdown(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/60 flex items-center gap-2 transition-colors hover:cursor-pointer"
                  >
                    <Pencil className="w-4 h-4 text-gray-500" />
                    <span>Edit</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowDropdown(false);
                      handleDeletePost();
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 flex items-center gap-2 transition-colors hover:cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap break-break-words break-all wrap-anywhere text-base leading-relaxed">
        {!isExpanded && (post?.content?.length > 200 || post?.content?.split("\n").length > 3) ? (
          <>
            {getTruncatedContent(post.content)}
            <button
              type="button"
              onClick={() => setIsExpanded(true)}
              className="inline-block ml-1 font-semibold hover:underline hover:cursor-pointer focus:outline-none"
            >
              ...see more
            </button>
          </>
        ) : (
          <>
            {post.content}
            {(post?.content?.length > 260 || post?.content?.split("\n").length > 3) && (
              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                className="inline-block ml-2 font-semibold hover:underline hover:cursor-pointer focus:outline-none"
              >
                See less
              </button>
            )}
          </>
        )}
      </p>

      {post.imageUrl && (
        <div className="relative rounded-lg overflow-hidden border border-gray-100 dark:border-gray-800 bg-black/5 max-h-96">
          <Image
            src={post.imageUrl}
            alt="Post Attachment"
            width={800}
            height={500}
            unoptimized
            className="w-full h-auto max-h-96 object-contain rounded-lg"
          />
        </div>
      )}

      <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <button
            type="button"
            onClick={handleToggleLike}
            className={`flex items-center gap-2 text-sm font-medium transition-colors hover:cursor-pointer ${
              isLiked
                ? "text-blue-500 hover:text-blue-600"
                : "text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400"
            }`}
          >
            <ThumbsUp
              className={`w-5 h-5 transition-transform active:scale-125 ${
                isLiked ? "fill-blue-500 text-blue-500" : ""
              }`}
            />
            <span>{likesCount} {likesCount === 1 ? "Like" : "Likes"}</span>
          </button>

          <button
            type="button"
            onClick={handleToggleComments}
            className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors hover:cursor-pointer"
          >
            <MessageSquare className="w-5 h-5" />
            <span>{commentsCount} {commentsCount === 1 ? "Comment" : "Comments"}</span>
          </button>
        </div>
      </div>

      {showComments && (
        <div className="pt-4 border-t border-gray-100 dark:border-gray-800 space-y-4">
          <form onSubmit={handleAddComment} className="flex gap-2 items-center">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              disabled={isSubmittingComment}
              className="flex-1 px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-900 dark:focus:ring-gray-100"
            />
            <button
              type="submit"
              disabled={!newComment.trim() || isSubmittingComment}
              className="p-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity hover:cursor-pointer flex items-center justify-center min-w-9"
            >
              {isSubmittingComment ? (
                <Loader2 className="w-4 h-4 animate-spin text-white dark:text-gray-900" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </form>

          {loadingComments ? (
            <div className="flex items-center justify-center py-4 text-xs text-gray-500">
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              <span>Loading comments...</span>
            </div>
          ) : comments.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-2">
              No comments yet. Be the first to comment!
            </p>
          ) : (
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {comments.map((comment) => {
                const commentUserUid = comment.user?.uid || comment.user?.id;
                const canDeleteComment =
                  currentUser &&
                  (currentUser.uid === comment.user?.uid ||
                    currentUser.email === comment.user?.email ||
                    isOwner);

                return (
                  <div key={comment.id} className="flex items-start gap-2.5 text-xs">
                    {commentUserUid ? (
                      <Link
                        href={`/profile/${commentUserUid}`}
                        className="w-7 h-7 rounded-full overflow-hidden relative shrink-0 border border-gray-200 dark:border-gray-700 mt-0.5"
                      >
                        <Image
                          src={comment.user?.profileImage || placeholderUser}
                          alt={comment.user?.name || "User"}
                          fill
                          className="object-cover"
                        />
                      </Link>
                    ) : (
                      <div className="w-7 h-7 rounded-full overflow-hidden relative shrink-0 border border-gray-200 dark:border-gray-700 mt-0.5">
                        <Image
                          src={comment.user?.profileImage || placeholderUser}
                          alt={comment.user?.name || "User"}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 bg-gray-50 dark:bg-gray-800 p-2.5 rounded-lg border border-gray-100 dark:border-gray-700/50 relative group">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {commentUserUid ? (
                            <Link
                              href={`/profile/${commentUserUid}`}
                              className="font-semibold text-gray-900 dark:text-white"
                            >
                              {comment.user?.name || "User"}
                            </Link>
                          ) : (
                            <span className="font-semibold text-gray-900 dark:text-white">
                              {comment.user?.name || "User"}
                            </span>
                          )}
                          {comment.user?.role && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-medium uppercase">
                              {comment.user.role}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-gray-400">
                            {formatDate(comment.createdAt)}
                          </span>
                          {canDeleteComment && (
                            <button
                              type="button"
                              onClick={() => handleDeleteComment(comment.id)}
                              disabled={deletingCommentId === comment.id}
                              className="text-gray-400 hover:text-red-500 transition-colors p-0.5 hover:cursor-pointer"
                              title="Delete comment"
                            >
                              {deletingCommentId === comment.id ? (
                                <Loader2 className="w-3 h-3 animate-spin text-red-500" />
                              ) : (
                                <Trash2 className="w-3.5 h-3.5" />
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 text-xs wrap-break-words break-all">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
