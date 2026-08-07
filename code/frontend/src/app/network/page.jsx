"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import ProtectedRoute from "@/components/shared/ProtectedRoute";
import Navbar from "@/components/shared/Navbar/Navbar";
import { useAuth } from "@/context/AuthProvider";
import axiosInstance from "@/lib/axios";
import placeholderUser from "../../../public/placeholder-user.jpg";
import {
  Users,
  Search,
  UserPlus,
  UserCheck,
  MapPin,
  GraduationCap,
  Loader2,
  ExternalLink,
} from "lucide-react";

export default function NetworkPage() {
  const { user } = useAuth();
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [followingMap, setFollowingMap] = useState({});
  const [togglingMap, setTogglingMap] = useState({});

  useEffect(() => {
    if (!user) return;

    axiosInstance
      .get("/api/v1/users?limit=100")
      .then((res) => {
        const rawUsers = res.data?.data?.data || res.data?.data || [];

        const otherUsers = rawUsers.filter(
          (u) => u.uid !== user.uid && u.email !== user.email
        );
        setUsersList(otherUsers);

        otherUsers.forEach((otherUser) => {
          if (otherUser.uid) {
            axiosInstance
              .get(`/api/v1/users/${otherUser.uid}/follow/status`, {
                validateStatus: (status) => status < 500,
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
          }
        });
      })
      .catch((err) => {
        console.error("Error fetching network users:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [user]);

  const handleToggleFollow = async (targetUid) => {
    if (togglingMap[targetUid]) return;

    const isCurrentlyFollowing = !!followingMap[targetUid];
    setFollowingMap((prev) => ({
      ...prev,
      [targetUid]: !isCurrentlyFollowing,
    }));
    setTogglingMap((prev) => ({ ...prev, [targetUid]: true }));

    try {
      if (isCurrentlyFollowing) {
        await axiosInstance.delete(`/api/v1/users/${targetUid}/follow`);
      } else {
        await axiosInstance.post(`/api/v1/users/${targetUid}/follow`);
      }
    } catch (err) {
      console.error("Error toggling follow:", err);
      setFollowingMap((prev) => ({
        ...prev,
        [targetUid]: isCurrentlyFollowing,
      }));
    } finally {
      setTogglingMap((prev) => ({ ...prev, [targetUid]: false }));
    }
  };

  const filteredUsers = usersList.filter((item) => {
    const profile =
      item.role === "STUDENT" ? item.studentProfile : item.alumniProfile;

    const nameMatch = item.name
      ?.toLowerCase()
      .includes(searchQuery.toLowerCase());
    const emailMatch = item.email
      ?.toLowerCase()
      .includes(searchQuery.toLowerCase());
    const deptMatch = profile?.department
      ?.toLowerCase()
      .includes(searchQuery.toLowerCase());
    const locationMatch = item.location
      ?.toLowerCase()
      .includes(searchQuery.toLowerCase());

    const matchesSearch =
      !searchQuery || nameMatch || emailMatch || deptMatch || locationMatch;
    const matchesRole =
      roleFilter === "ALL" || item.role?.toUpperCase() === roleFilter;

    return matchesSearch && matchesRole;
  });

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-black/95">
        <Navbar />

        <main className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-6 space-y-6">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <Users className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                People you may know ({usersList.length})
              </h1>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800 shadow-xs">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, program..."
                className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
              {["ALL", "ALUMNI", "STUDENT"].map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setRoleFilter(role)}
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
              <p className="text-sm text-gray-500">Discovering members...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-8 space-y-3">
              <Users className="w-12 h-12 text-gray-400 mx-auto" />
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                No members found
              </h3>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredUsers.map((item) => {
                const profile =
                  item.role === "STUDENT"
                    ? item.studentProfile
                    : item.alumniProfile;
                const isFollowing = !!followingMap[item.uid];
                const isToggling = !!togglingMap[item.uid];

                return (
                  <div
                    key={item.uid || item.id}
                    className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative h-20 bg-linear-to-r from-zinc-800 to-zinc-900 overflow-hidden">
                        {item.coverImage && (
                          <Image
                            src={item.coverImage}
                            alt="Cover"
                            fill
                            unoptimized
                            className="object-cover opacity-80"
                          />
                        )}
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
                            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-bold tracking-wider uppercase border border-gray-200 dark:border-gray-700">
                              {item.role}
                            </span>
                          )}
                        </div>

                        <div className="space-y-1 text-left">
                          <Link
                            href={`/profile/${item.uid}`}
                            className="font-bold text-base text-gray-900 dark:text-white leading-snug block truncate"
                          >
                            {item.name || "User"}
                          </Link>

                          {profile?.program && (
                            <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-1 truncate">
                              <GraduationCap className="w-3.5 h-3.5 shrink-0" />
                              <span className="truncate">
                                {profile.program}{" "}
                                {profile.batch ? `(${profile.batch})` : ""}
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
                            <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2 pt-1 leading-relaxed">
                              {item.bio}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="p-4 pt-2 border-t border-gray-100 dark:border-gray-800 flex items-center gap-2">
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

                      <Link
                        href={`/profile/${item.uid}`}
                        className="py-2 px-3 rounded-xl text-xs font-semibold border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center justify-center gap-1"
                        title="View Profile"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
