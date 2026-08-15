"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import ProtectedRoute from "@/components/shared/ProtectedRoute";
import LoadingScreen from "@/components/shared/LoadingScreen/LoadingScreen";
import Navbar from "@/components/shared/Navbar/Navbar";
import PostCard from "@/components/ui/PostCard/PostCard";
import CreatePostModal from "@/components/ui/CreatePostModal/CreatePostModal";
import Divider from "@/components/ui/divider";
import { useAuth } from "@/context/AuthProvider";
import axiosInstance from "@/lib/axios";
import { ImagePlus, Loader2, MapPin } from "lucide-react";
import placeholderUser from "../../public/placeholder-user.jpg";

const homeProfileCache = new Map();

export default function Home() {
  const { user, dbUser } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [createPostModalOpen, setCreatePostModalOpen] = useState(false);

  const fetchPosts = () => {
    setLoadingPosts(true);
    axiosInstance
      .get("/api/v1/posts")
      .then((response) => {
        if (response.data?.data) {
          setPosts(response.data.data);
        }
      })
      .catch((err) => {
        console.error("Error fetching feed posts:", err);
      })
      .finally(() => {
        setLoadingPosts(false);
      });
  };

  useEffect(() => {
    if (!user) return;

    axiosInstance
      .get("/api/v1/posts")
      .then((response) => {
        if (response.data?.data) {
          setPosts(response.data.data);
        }
      })
      .catch((err) => {
        console.error("Error fetching feed posts:", err);
      })
      .finally(() => {
        setLoadingPosts(false);
      });
  }, [user]);

  useEffect(() => {
    const handleRefreshFeed = () => {
      fetchPosts();
    };

    window.addEventListener("refresh-feed", handleRefreshFeed);
    return () => {
      window.removeEventListener("refresh-feed", handleRefreshFeed);
    };
  }, []);

  const activeDbUser = dbUser;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-black/95">
        <Navbar />
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-6">
          {activeDbUser?.role === "USER" ? (
            <div className="max-w-3xl mx-auto flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-8 text-center space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Welcome to ALUMNET!
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Please complete your profile.
              </p>
              <Link
                href="/profile-setup"
                className="px-6 py-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-bold rounded-xl hover:opacity-90 transition-opacity"
              >
                Complete Your Profile to Continue
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="hidden lg:block lg:col-span-3">
                <Link
                  href={`/profile/${user?.uid}`}
                  className="block sticky top-24 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm space-y-3 p-4 hover:border-gray-300 dark:hover:border-gray-700 hover:shadow-md transition-all hover:cursor-pointer group"
                >
                  <div className="relative h-20 -mx-4 -mt-4 bg-linear-to-r from-zinc-800 to-zinc-900 overflow-hidden">
                    {activeDbUser?.coverImage && (
                      <Image
                        src={activeDbUser.coverImage}
                        alt="Cover"
                        fill
                        priority
                        unoptimized
                        className="object-cover opacity-80 transition-transform duration-300"
                      />
                    )}
                  </div>

                  <div className="relative -mt-10 flex justify-start pl-1">
                    <div className="w-18 h-18 rounded-full border-4 border-white dark:border-gray-900 overflow-hidden shadow-md relative bg-white dark:bg-gray-800 shrink-0">
                      <Image
                        src={
                          activeDbUser?.profileImage ||
                          user?.photoURL ||
                          placeholderUser
                        }
                        alt="User Avatar"
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>

                  <div className="text-left space-y-0.5 pt-1">
                    <h3 className="font-bold text-base text-gray-900 dark:text-white leading-tight truncate">
                      {activeDbUser?.name || user?.displayName || "User"}
                    </h3>
                    {activeDbUser?.role && (
                      <span className="inline-block text-[10px] text-gray-500 dark:text-gray-400 font-semibold tracking-wide uppercase">
                        {activeDbUser.role}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                    {activeDbUser?.bio && (
                      <p className="text-xs text-black dark:text-gray-400 line-clamp-3 leading-relaxed text-left">
                        {activeDbUser.bio}
                      </p>
                    )}

                    {activeDbUser?.location && (
                      <div className="flex items-center justify-start gap-1.5 text-xs text-gray-500 dark:text-gray-400 pt-0.5">
                        <span className="truncate">{activeDbUser.location}</span>
                      </div>
                    )}
                  </div>
                </Link>
              </div>

              <div className="lg:col-span-6 space-y-6">
                <div className="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800 shadow-sm">
                  <button
                    type="button"
                    onClick={() => setCreatePostModalOpen(true)}
                    className="w-full border border-gray-300 dark:border-gray-700 rounded-xl text-left p-4 hover:bg-gray-100 dark:hover:bg-gray-800 hover:cursor-pointer font-medium text-gray-500 dark:text-gray-400 transition-colors"
                  >
                    Post something...
                  </button>
                  <div className="mt-4 flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => setCreatePostModalOpen(true)}
                      className="flex items-center gap-2 font-semibold p-2.5 hover:cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors text-gray-700 dark:text-gray-300 text-sm"
                    >
                      <ImagePlus className="text-green-500 w-5 h-5" /> Add
                      Photo
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <Divider />

                  {loadingPosts ? (
                    <div className="flex items-center justify-center py-12 text-gray-500">
                      <Loader2 className="w-6 h-6 animate-spin mr-2" />
                      <span>Loading feed...</span>
                    </div>
                  ) : posts.length === 0 ? (
                    <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 text-gray-500">
                      <p className="text-base font-medium">
                        No posts available in the feed yet.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      {posts.map((post) => (
                        <PostCard
                          key={post.id}
                          post={post}
                          currentUser={user}
                          onDelete={(deletedId) =>
                            setPosts((prev) =>
                              prev.filter((p) => p.id !== deletedId)
                            )
                          }
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Sidebar - Empty as requested */}
              <div className="hidden lg:block lg:col-span-3"></div>
            </div>
          )}
        </main>

        <CreatePostModal
          isOpen={createPostModalOpen}
          onClose={() => setCreatePostModalOpen(false)}
          dbUser={dbUser}
          onPostCreated={() => {
            fetchPosts();
          }}
        />
      </div>
    </ProtectedRoute>
  );
}
