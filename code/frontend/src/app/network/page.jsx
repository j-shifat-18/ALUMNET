"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import ProtectedRoute from "@/components/shared/ProtectedRoute";
import Navbar from "@/components/shared/Navbar/Navbar";
import { useAuth } from "@/context/AuthProvider";
import axiosInstance from "@/lib/axios";
import placeholderUser from "../../../public/placeholder-user.jpg";
import coverPlaceholder from "../../../public/cover_placeholder.jpg";
import {
  Users,
  Search,
  UserPlus,
  UserCheck,
  MapPin,
  Briefcase,
  Loader2,
  ExternalLink,
} from "lucide-react";

export default function NetworkPage() {
  const { user } = useAuth();

  // ── Explore tab state ──────────────────────────────────────────────────────
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState("");
  const [activeSearchQuery, setActiveSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [followingMap, setFollowingMap] = useState({});
  const [togglingMap, setTogglingMap] = useState({});

  // ── Connections tab state ──────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState("EXPLORE");
  const [connectionSubTab, setConnectionSubTab] = useState("FOLLOWING");
  const [followingList, setFollowingList] = useState([]);
  const [followersList, setFollowersList] = useState([]);
  const [loadingConnections, setLoadingConnections] = useState(false);

  // ── Connections tab: single API call ──────────────────────────────────────
  useEffect(() => {
    if (activeTab !== "CONNECTIONS" || !user?.uid) return;

    let isMounted = true;
    setLoadingConnections(true);

    axiosInstance
      .get("/api/v1/connections")
      .then((res) => {
        if (!isMounted) return;
        const data = res.data?.data;
        if (data) {
          setFollowingList(data.following || []);
          setFollowersList(data.followers || []);

          // pre-populate followingMap so follow buttons render correctly
          const fMap = {};
          (data.following || []).forEach((u) => {
            if (u.uid) fMap[u.uid] = true;
          });
          setFollowingMap((prev) => ({ ...prev, ...fMap }));
        }
      })
      .catch((err) => {
        if (isMounted) console.error("Error fetching connections:", err);
      })
      .finally(() => {
        if (isMounted) setLoadingConnections(false);
      });

    return () => {
      isMounted = false;
    };
  }, [activeTab, user]);

  // ── Explore tab: suggestions + search ─────────────────────────────────────
  useEffect(() => {
    if (!user) return;

    setLoading(true);
    const q = activeSearchQuery.trim();

    if (!q && roleFilter === "ALL") {
      // No search query and no filter — use the suggestions endpoint
      axiosInstance
        .get("/api/v1/connections/suggestions", { params: { limit: 50 } })
        .then((res) => {
          const list = res.data?.data || [];
          setUsersList(list);

          // suggestions endpoint excludes already-followed, so all are not following
          const fMap = {};
          list.forEach((u) => {
            if (u.uid) fMap[u.uid] = false;
          });
          setFollowingMap((prev) => ({ ...prev, ...fMap }));
        })
        .catch((err) => {
          console.error("Error fetching suggestions:", err);
          setUsersList([]);
        })
        .finally(() => setLoading(false));
    } else {
      // Search or role filter active — use search endpoint
      const params = { limit: 100 };
      if (roleFilter !== "ALL") params.role = roleFilter;

      const requests = q
        ? [
            axiosInstance.get("/api/v1/search/users", { params: { ...params, name: q } }),
            axiosInstance.get("/api/v1/search/users", { params: { ...params, department: q } }),
          ]
        : [axiosInstance.get("/api/v1/search/users", { params })];

      Promise.all(requests)
        .then((responses) => {
          let combinedRaw = [];
          responses.forEach((res) => {
            const list = res.data?.data?.data || res.data?.data || [];
            combinedRaw = combinedRaw.concat(list);
          });

          const uniqueMap = new Map();
          combinedRaw.forEach((u) => {
            if (u.uid && u.uid !== user.uid) {
              uniqueMap.set(u.uid, u);
            }
          });

          const otherUsers = Array.from(uniqueMap.values());
          setUsersList(otherUsers);

          // Batch check follow status for search results
          otherUsers.forEach((otherUser) => {
            if (!otherUser.uid) return;
            axiosInstance
              .get(`/api/v1/users/${otherUser.uid}/follow/status`, {
                validateStatus: (s) => s < 500,
              })
              .then((statusRes) => {
                if (statusRes.status === 200 && statusRes.data?.data) {
                  setFollowingMap((prev) => ({
                    ...prev,
                    [otherUser.uid]: statusRes.data.data.isFollowing,
                  }));
                }
              })
              .catch(() => {});
          });
        })
        .catch((err) => {
          console.error("Error searching users:", err);
          setUsersList([]);
        })
        .finally(() => setLoading(false));
    }
  }, [user, activeSearchQuery, roleFilter]);

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    setActiveSearchQuery(searchInput);
    setLoading(true);
  };

  // ── Follow / Unfollow toggle ───────────────────────────────────────────────
  const handleToggleFollow = async (targetUid) => {
    if (togglingMap[targetUid]) return;

    const isCurrentlyFollowing = !!followingMap[targetUid];
    setFollowingMap((prev) => ({ ...prev, [targetUid]: !isCurrentlyFollowing }));
    setTogglingMap((prev) => ({ ...prev, [targetUid]: true }));

    try {
      if (isCurrentlyFollowing) {
        await axiosInstance.delete(`/api/v1/users/${targetUid}/follow`);
      } else {
        await axiosInstance.post(`/api/v1/users/${targetUid}/follow`);
      }
    } catch (err) {
      console.error("Error toggling follow:", err);
      setFollowingMap((prev) => ({ ...prev, [targetUid]: isCurrentlyFollowing }));
    } finally {
      setTogglingMap((prev) => ({ ...prev, [targetUid]: false }));
    }
  };

  // ── Member card (shared between explore & connections) ────────────────────
  const renderMemberCard = (item) => {
    const profile = item.role === "STUDENT" ? item.studentProfile : item.alumniProfile;
    const isFollowing = !!followingMap[item.uid];
    const isToggling = !!togglingMap[item.uid];
    const coverImage = item.coverImage || coverPlaceholder;

    // currentPosition / currentCompany may come either from nested profile or
    // directly on item (connections/suggestions endpoint flattens them)
    const currentPosition = item.currentPosition || profile?.currentPosition;
    const currentCompany = item.currentCompany || profile?.currentCompany;
    const department = item.department || profile?.department;
    const batch = profile?.batch;

    return (
      <div
        key={item.uid || item.id}
        className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
      >
        <div>
          <div className="relative h-24 bg-gray-200 dark:bg-gray-800 overflow-hidden">
            <Image src={coverImage} alt={item.name || "Cover"} fill className="object-cover" />
          </div>

          <div className="p-4 pt-0 relative">
            <div className="relative -mt-10 mb-3 flex justify-between items-end">
              <Link
                href={`/profile/${item.uid}`}
                className="w-16 h-16 rounded-full border-4 border-white dark:border-gray-900 overflow-hidden relative shadow-md bg-white dark:bg-gray-800 shrink-0 transition-opacity"
              >
                <Image
                  src={item.profileImage || placeholderUser}
                  alt={item.name || "Member"}
                  fill
                  className="object-cover"
                />
              </Link>

              {item.role && (
                <span
                  className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold tracking-wider uppercase border ${
                    item.role.toUpperCase() === "ALUMNI"
                      ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                      : "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800"
                  }`}
                >
                  {item.role}
                </span>
              )}
            </div>

            <div className="space-y-1.5 text-left">
              <Link
                href={`/profile/${item.uid}`}
                className="font-bold text-base text-gray-900 dark:text-white leading-snug block truncate hover:underline"
              >
                {item.name || "User"}
              </Link>

              {(department || batch) && (
                <p className="text-xs text-blue-600 dark:text-blue-400 font-medium flex flex-col gap-1 truncate">
                  {department && (
                    <span className="truncate">{department}</span>
                  )}
                  {batch && <span className="truncate">Batch: {batch}</span>}
                </p>
              )}

              {(currentPosition || currentCompany) && (
                <p className="text-xs text-gray-700 dark:text-gray-300 font-medium flex items-center gap-1 truncate">
                  <Briefcase className="w-3.5 h-3.5 shrink-0 text-gray-400" />
                  <span className="truncate">
                    {currentPosition}
                    {currentPosition && currentCompany ? " at " : ""}
                    {currentCompany}
                  </span>
                </p>
              )}

              {item.location && (
                <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 truncate">
                  <MapPin className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{item.location}</span>
                </p>
              )}

              {item.bio && (
                <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2 pt-0.5 leading-relaxed">
                  {item.bio}
                </p>
              )}

              {item.followsYouBack && (
                <span className="inline-block text-[10px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 font-medium">
                  Follows you
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="p-4 pt-2 border-t border-gray-100 dark:border-gray-800 flex items-center gap-2">
          {item.uid !== user?.uid && (
            <button
              type="button"
              onClick={() => handleToggleFollow(item.uid)}
              disabled={isToggling}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors hover:cursor-pointer disabled:opacity-50 ${
                isFollowing
                  ? "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700"
                  : "bg-gray-900 text-white dark:bg-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-200"
              }`}
            >
              {isToggling ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : isFollowing ? (
                <>
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Following</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Follow</span>
                </>
              )}
            </button>
          )}

          <Link
            href={`/profile/${item.uid}`}
            className="py-2 px-3 rounded-xl text-xs font-semibold border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center justify-center gap-1 flex-1 text-center"
            title="View Profile"
          >
            <span>View Profile</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    );
  };

  // ── JSX ───────────────────────────────────────────────────────────────────
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-black/95">
        <Navbar />

        <main className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <aside className="col-span-12 lg:col-span-3 sticky top-20 z-10 space-y-4">
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-2 shadow-xs space-y-1">
                <button
                  type="button"
                  onClick={() => setActiveTab("EXPLORE")}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors hover:cursor-pointer ${
                    activeTab === "EXPLORE"
                      ? "bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Users className="w-4 h-4" />
                    <span>People you may know</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("CONNECTIONS");
                    setLoadingConnections(true);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors hover:cursor-pointer ${
                    activeTab === "CONNECTIONS"
                      ? "bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <UserCheck className="w-4 h-4" />
                    <span>Following & Followers</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-medium">
                    {followingList.length + followersList.length}
                  </span>
                </button>
              </div>
            </aside>

            <div className="col-span-12 lg:col-span-9 space-y-6">
              {activeTab === "EXPLORE" ? (
                <>
                  <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800 shadow-xs">
                    <form
                      onSubmit={handleSearchSubmit}
                      className="flex items-center gap-2 w-full sm:w-auto flex-1 max-w-md"
                    >
                      <div className="relative flex-1">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          value={searchInput}
                          onChange={(e) => setSearchInput(e.target.value)}
                          placeholder="Search"
                          className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-900 dark:focus:ring-gray-100"
                        />
                      </div>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl text-xs font-semibold hover:opacity-90 transition-opacity hover:cursor-pointer shrink-0"
                      >
                        Search
                      </button>
                    </form>

                    <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                      {["ALL", "ALUMNI", "STUDENT"].map((role) => (
                        <button
                          key={role}
                          type="button"
                          onClick={() => {
                            setRoleFilter(role);
                            setLoading(true);
                          }}
                          className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-colors hover:cursor-pointer whitespace-nowrap ${
                            roleFilter === role
                              ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
                              : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                          }`}
                        >
                          {role === "ALL"
                            ? "All People"
                            : role.charAt(0) + role.slice(1).toLowerCase() + "s"}
                        </button>
                      ))}
                    </div>
                  </div>

                  {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                      <Loader2 className="w-8 h-8 animate-spin text-gray-500 mb-3" />
                      <p className="text-sm text-gray-500">Finding People...</p>
                    </div>
                  ) : usersList.length === 0 ? (
                    <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-8 space-y-3">
                      <Users className="w-12 h-12 text-gray-400 mx-auto" />
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        No people found
                      </h3>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                      {usersList.map((item) => renderMemberCard(item))}
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-200 dark:border-gray-800 shadow-xs flex items-center justify-start gap-2">
                    <button
                      type="button"
                      onClick={() => setConnectionSubTab("FOLLOWING")}
                      className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-colors hover:cursor-pointer ${
                        connectionSubTab === "FOLLOWING"
                          ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                      }`}
                    >
                      Following ({followingList.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setConnectionSubTab("FOLLOWERS")}
                      className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-colors hover:cursor-pointer ${
                        connectionSubTab === "FOLLOWERS"
                          ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                      }`}
                    >
                      Followers ({followersList.length})
                    </button>
                  </div>

                  {loadingConnections ? (
                    <div className="flex flex-col items-center justify-center py-20">
                      <Loader2 className="w-8 h-8 animate-spin text-gray-500 mb-3" />
                      <p className="text-sm text-gray-500">Loading your connections...</p>
                    </div>
                  ) : connectionSubTab === "FOLLOWING" ? (
                    followingList.length === 0 ? (
                      <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-8 space-y-3">
                        <UserCheck className="w-12 h-12 text-gray-400 mx-auto" />
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                          You are not following anyone yet
                        </h3>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                        {followingList.map((item) => renderMemberCard(item))}
                      </div>
                    )
                  ) : followersList.length === 0 ? (
                    <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-8 space-y-3">
                      <UserPlus className="w-12 h-12 text-gray-400 mx-auto" />
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        You have no followers yet
                      </h3>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                      {followersList.map((item) => renderMemberCard(item))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
