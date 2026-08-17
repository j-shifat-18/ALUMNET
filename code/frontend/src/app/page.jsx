"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import LoadingScreen from "@/components/layout/LoadingScreen";
import Navbar from "@/components/layout/Navbar";
import PostCard from "@/components/posts/PostCard";
import CreatePostModal from "@/components/posts/CreatePostModal";
import Divider from "@/components/ui/Divider";
import { useAuth } from "@/context/AuthProvider";
import axiosInstance from "@/lib/axios";
import { Check, ImagePlus, Loader2, UserPlus } from "lucide-react";
import placeholderUser from "../../public/placeholder-user.jpg";

export default function Home() {
  const { user, dbUser } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [createPostModalOpen, setCreatePostModalOpen] = useState(false);

  const [recentFollowing, setRecentFollowing] = useState([]);
  const [loadingFollowing, setLoadingFollowing] = useState(true);

  const [recentFollowers, setRecentFollowers] = useState([]);
  const [loadingFollowers, setLoadingFollowers] = useState(true);
  const [followingUidsSet, setFollowingUidsSet] = useState(new Set());
  const [followingInProgress, setFollowingInProgress] = useState({});

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

  const fetchRecentFollowing = () => {
    if (!user?.uid) return;
    setLoadingFollowing(true);
    axiosInstance
      .get(`/api/v1/users/${user.uid}/following`)
      .then((res) => {
        if (res.data?.data) {
          const list = res.data.data;
          setRecentFollowing(list.slice(0, 5));
          setFollowingUidsSet(new Set(list.map((u) => u.uid)));
        }
      })
      .catch((err) => {
        console.error("Error fetching recently followed users:", err);
      })
      .finally(() => {
        setLoadingFollowing(false);
      });
  };

  const fetchRecentFollowers = () => {
    if (!user?.uid) return;
    setLoadingFollowers(true);
    axiosInstance
      .get(`/api/v1/users/${user.uid}/followers`)
      .then((res) => {
        if (res.data?.data) {
          setRecentFollowers(res.data.data.slice(0, 5));
        }
      })
      .catch((err) => {
        console.error("Error fetching recent followers:", err);
      })
      .finally(() => {
        setLoadingFollowers(false);
      });
  };

  const handleFollowBack = async (e, targetUid) => {
    e.preventDefault();
    e.stopPropagation();

    if (followingInProgress[targetUid]) return;

    setFollowingInProgress((prev) => ({ ...prev, [targetUid]: true }));

    try {
      const res = await axiosInstance.post(
        `/api/v1/users/${targetUid}/follow`,
        {},
        { validateStatus: (status) => status < 500 }
      );

      if (res.status === 200 || res.status === 201 || res.status === 409) {
        setFollowingUidsSet((prev) => new Set([...prev, targetUid]));
        fetchRecentFollowing();
      }
    } catch (err) {
      console.error("Error following user back:", err);
    } finally {
      setFollowingInProgress((prev) => ({ ...prev, [targetUid]: false }));
    }
  };

  useEffect(() => {
    if (!user) return;

    fetchPosts();
    fetchRecentFollowing();
    fetchRecentFollowers();
  }, [user]);

  useEffect(() => {
    const handleRefreshFeed = () => {
      fetchPosts();
      fetchRecentFollowing();
      fetchRecentFollowers();
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
              {/* Left Sidebar - Profile Card */}
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

              {/* Main Feed Column */}
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

              {/* Right Sidebar - Recently Followed & Recent Followers */}
              <div className="hidden lg:block lg:col-span-3">
                <div className="sticky top-24 space-y-4">
                  {/* Section 1: Recently Followed */}
                  <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-4 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-800">
                      <h3 className="font-bold text-base text-gray-900 dark:text-white">
                        Recently Followed
                      </h3>
                      <Link
                        href="/network"
                        className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        View All
                      </Link>
                    </div>

                    {loadingFollowing ? (
                      <div className="flex items-center justify-center py-6 text-gray-400 text-sm">
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        <span>Loading...</span>
                      </div>
                    ) : recentFollowing.length === 0 ? (
                      <div className="text-center py-6 text-xs text-gray-500 dark:text-gray-400 space-y-2">
                        <p>You haven't followed any accounts yet.</p>
                        <Link
                          href="/network"
                          className="inline-block text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          Explore Network &rarr;
                        </Link>
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-100 dark:divide-gray-800/60">
                        {recentFollowing.map((account) => (
                          <Link
                            key={account.id || account.uid}
                            href={`/profile/${account.uid}`}
                            className="flex items-center justify-between py-2.5 px-1 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors group"
                          >
                            <div className="flex items-center gap-2.5 min-w-0 pr-2">
                              <div className="relative w-9 h-9 rounded-full overflow-hidden shrink-0 border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800">
                                <Image
                                  src={account.profileImage || placeholderUser}
                                  alt={account.name || "User"}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-tight">
                                  {account.name || "User"}
                                </p>
                                {account.username && (
                                  <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                                    @{account.username}
                                  </p>
                                )}
                              </div>
                            </div>
                            <span
                              className={`shrink-0 px-1.5 py-0.5 text-[9px] font-bold rounded tracking-wider uppercase ${
                                account.role === "ALUMNI"
                                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60"
                                  : account.role === "STUDENT"
                                  ? "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60"
                                  : "bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60"
                              }`}
                            >
                              {account.role || "USER"}
                            </span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Section 2: Recent Followers */}
                  <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-4 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-800">
                      <h3 className="font-bold text-base text-gray-900 dark:text-white">
                        Recent Followers
                      </h3>
                      <Link
                        href="/network"
                        className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        View All
                      </Link>
                    </div>

                    {loadingFollowers ? (
                      <div className="flex items-center justify-center py-6 text-gray-400 text-sm">
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        <span>Loading...</span>
                      </div>
                    ) : recentFollowers.length === 0 ? (
                      <div className="text-center py-6 text-xs text-gray-500 dark:text-gray-400">
                        <p>No followers yet.</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-100 dark:divide-gray-800/60">
                        {recentFollowers.map((account) => {
                          const isAlreadyFollowing = followingUidsSet.has(account.uid);
                          const isBusy = Boolean(followingInProgress[account.uid]);

                          return (
                            <div
                              key={account.id || account.uid}
                              className="flex items-center justify-between py-2.5 px-1 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors group"
                            >
                              <Link
                                href={`/profile/${account.uid}`}
                                className="flex items-center gap-2.5 min-w-0 pr-2 flex-1"
                              >
                                <div className="relative w-9 h-9 rounded-full overflow-hidden shrink-0 border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800">
                                  <Image
                                    src={account.profileImage || placeholderUser}
                                    alt={account.name || "User"}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-tight">
                                    {account.name || "User"}
                                  </p>
                                  <div className="flex items-center gap-1.5 mt-0.5">
                                    <span
                                      className={`px-1.5 py-0.2 text-[9px] font-bold rounded tracking-wider uppercase ${
                                        account.role === "ALUMNI"
                                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60"
                                          : account.role === "STUDENT"
                                          ? "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60"
                                          : "bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60"
                                      }`}
                                    >
                                      {account.role || "USER"}
                                    </span>
                                  </div>
                                </div>
                              </Link>

                              <div className="shrink-0 ml-2">
                                {isAlreadyFollowing ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
                                    <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                                    Followed
                                  </span>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={(e) => handleFollowBack(e, account.uid)}
                                    disabled={isBusy}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors shadow-xs cursor-pointer disabled:opacity-50"
                                  >
                                    {isBusy ? (
                                      <Loader2 className="w-3 h-3 animate-spin" />
                                    ) : (
                                      <UserPlus className="w-3 h-3" />
                                    )}
                                    Follow Back
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
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
