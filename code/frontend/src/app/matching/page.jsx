"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import Navbar from "@/components/layout/Navbar";
import { useAuth } from "@/context/AuthProvider";
import axiosInstance from "@/lib/axios";
import placeholderUser from "../../../public/placeholder-user.jpg";
import RequestMentorshipModal from "@/components/mentorship/RequestMentorshipModal";
import {
  Sparkles,
  Briefcase,
  GraduationCap,
  Users,
  BadgeCheck,
  ArrowUpRight,
  Loader2,
  Star,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import Swal from "sweetalert2";

export default function MatchingPage() {
  const { user, dbUser } = useAuth();

  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [requestedIds, setRequestedIds] = useState(new Set());

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState(null);

  const isStudent = dbUser?.role === "STUDENT";

  const fetchMatches = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const res = await axiosInstance.get("/api/v1/matching/mentors?limit=10");
      setMentors(res.data?.data || []);
    } catch (err) {
      const msg = err.response?.data?.message;
      setError(msg || "Failed to load mentor matches.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (dbUser) fetchMatches();
  }, [dbUser]);

  // Open the modal — shape the mentor object to match what RequestMentorshipModal expects
  const openRequestModal = (mentor) => {
    if (requestedIds.has(mentor.id)) return;
    // The modal reads alumni.alumniProfile.currentPosition, .currentCompany, .department
    const alumniShaped = {
      uid: mentor.uid,
      name: mentor.name,
      profileImage: mentor.profileImage,
      alumniProfile: {
        currentPosition: mentor.currentPosition,
        currentCompany: mentor.currentCompany,
        department: mentor.department,
      },
    };
    setSelectedMentor(alumniShaped);
    setModalOpen(true);
  };

  const handleRequestSent = () => {
    if (!selectedMentor) return;
    // Find the matching mentor by uid and mark as requested
    const mentor = mentors.find((m) => m.uid === selectedMentor.uid);
    if (mentor) {
      setRequestedIds((prev) => new Set([...prev, mentor.id]));
    }
  };

  // ── Non-student view ──────────────────────────────────────────────────────
  if (!loading && dbUser && !isStudent) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 dark:bg-black/95">
          <Navbar />
          <main className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-16">
            <div className="max-w-md mx-auto text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center mx-auto">
                <Sparkles className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Mentor Matching is for Students
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                This feature helps students find the most compatible alumni
                mentors based on their skills, interests, and career goals.
              </p>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-black/95">
        <Navbar />

        <main className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-8">

          {/* ── Hero header ──────────────────────────────────────────────── */}
          <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-gray-800 p-6 sm:p-8 mb-8 shadow-sm">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-xs font-semibold border border-blue-200 dark:border-blue-800/80">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Mentor Matching</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                  Your Top Mentor Matches
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xl">
                  Ranked by how closely each alumni's skills, expertise areas, and
                  mentorship domains align with your profile. The higher the match
                  percentage, the better the fit.
                </p>
              </div>

              <button
                onClick={fetchMatches}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-zinc-800 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors disabled:opacity-50 shrink-0"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </button>
            </div>

            {/* Scoring legend */}
            <div className="mt-5 pt-4 border-t border-gray-100 dark:border-zinc-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                Skill match → +3 pts each
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-violet-500" />
                Domain match → +2 pts each
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Same department → +2 pts
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                Verified / Experienced → +1 each
              </div>
            </div>
          </div>

          {/* ── Loading ───────────────────────────────────────────────────── */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-400 dark:text-gray-600">
              <Loader2 className="w-8 h-8 animate-spin" />
              <p className="text-sm font-medium">Finding your best mentor matches…</p>
            </div>
          )}

          {/* ── Error state ───────────────────────────────────────────────── */}
          {!loading && error && (
            <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
              <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-950/40 flex items-center justify-center">
                <Sparkles className="w-7 h-7 text-rose-400" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">{error}</p>
                {error.includes("profile") && (
                  <Link
                    href="/profile-setup"
                    className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 text-sm font-semibold hover:opacity-90 transition"
                  >
                    Complete your profile
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                )}
              </div>
            </div>
          )}

          {/* ── Empty state ───────────────────────────────────────────────── */}
          {!loading && !error && mentors.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
              <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-zinc-800 flex items-center justify-center">
                <Users className="w-7 h-7 text-gray-400" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">No mentor matches found</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-sm">
                  No available alumni matched your profile yet. Try updating your
                  skills and interests in your profile.
                </p>
              </div>
              <Link
                href={`/profile/${user?.uid}`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 text-sm font-semibold hover:opacity-90 transition"
              >
                Update Profile
              </Link>
            </div>
          )}

          {/* ── Mentor cards ──────────────────────────────────────────────── */}
          {!loading && !error && mentors.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {mentors.map((mentor, index) => {
                const alreadyRequested = requestedIds.has(mentor.id);

                return (
                  <div
                    key={mentor.id}
                    className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs hover:shadow-md transition-shadow flex flex-col overflow-hidden"
                  >
                    {/* Rank + Match % banner */}
                    <div className="flex items-center justify-between px-4 pt-4 pb-2">
                      <span className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                        #{index + 1} Match
                      </span>
                      <span
                        className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                          mentor.matchPercentage >= 70
                            ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                            : mentor.matchPercentage >= 40
                            ? "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800"
                            : "bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-zinc-700"
                        }`}
                      >
                        <Star className="w-3 h-3" />
                        {mentor.matchPercentage}% match
                      </span>
                    </div>

                    {/* Profile section */}
                    <div className="px-4 pb-3 flex items-start gap-3.5">
                      <Link href={`/profile/${mentor.uid}`} className="shrink-0">
                        <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-gray-100 dark:border-zinc-700 bg-gray-100 dark:bg-zinc-800 relative">
                          <Image
                            src={mentor.profileImage || placeholderUser}
                            alt={mentor.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      </Link>

                      <div className="min-w-0 flex-1 pt-0.5">
                        <div className="flex items-center gap-1.5">
                          <Link
                            href={`/profile/${mentor.uid}`}
                            className="font-bold text-base text-gray-900 dark:text-white hover:underline truncate"
                          >
                            {mentor.name}
                          </Link>
                          {mentor.isVerified && (
                            <BadgeCheck className="w-4 h-4 text-blue-500 shrink-0" />
                          )}
                        </div>

                        {mentor.currentPosition && (
                          <p className="text-xs text-gray-600 dark:text-gray-300 truncate flex items-center gap-1 mt-0.5">
                            <Briefcase className="w-3 h-3 text-gray-400 shrink-0" />
                            {mentor.currentPosition}
                            {mentor.currentCompany && ` · ${mentor.currentCompany}`}
                          </p>
                        )}

                        <div className="flex items-center gap-3 mt-1.5 text-[11px] text-gray-400 dark:text-gray-500">
                          {mentor.department && (
                            <span className="flex items-center gap-1">
                              <GraduationCap className="w-3 h-3" />
                              {mentor.department}
                            </span>
                          )}
                          {mentor.experienceYears != null && (
                            <span>{mentor.experienceYears}y exp</span>
                          )}
                          {mentor.totalMentees > 0 && (
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {mentor.totalMentees} mentees
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Match reason chips */}
                    {(mentor.matchedSkills.length > 0 || mentor.matchedDomains.length > 0) && (
                      <div className="px-4 pb-3 space-y-2">
                        {mentor.matchedSkills.length > 0 && (
                          <div>
                            <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">
                              Shared Skills
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {mentor.matchedSkills.slice(0, 4).map((skill) => (
                                <span
                                  key={skill}
                                  className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-900/40"
                                >
                                  {skill}
                                </span>
                              ))}
                              {mentor.matchedSkills.length > 4 && (
                                <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-gray-100 dark:bg-zinc-800 text-gray-500">
                                  +{mentor.matchedSkills.length - 4}
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {mentor.matchedDomains.length > 0 && (
                          <div>
                            <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">
                              Shared Interests
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {mentor.matchedDomains.slice(0, 3).map((domain) => (
                                <span
                                  key={domain}
                                  className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 border border-violet-100 dark:border-violet-900/40"
                                >
                                  {domain}
                                </span>
                              ))}
                              {mentor.matchedDomains.length > 3 && (
                                <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-gray-100 dark:bg-zinc-800 text-gray-500">
                                  +{mentor.matchedDomains.length - 3}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Match % bar (no score label, just visual %) */}
                    <div className="px-4 pb-3">
                      <div className="h-1.5 w-full bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${
                            mentor.matchPercentage >= 70
                              ? "bg-emerald-500"
                              : mentor.matchPercentage >= 40
                              ? "bg-blue-500"
                              : "bg-gray-400 dark:bg-zinc-600"
                          }`}
                          style={{ width: `${mentor.matchPercentage}%` }}
                        />
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="mt-auto px-4 pb-4 pt-1 flex gap-2 border-t border-gray-100 dark:border-zinc-800">
                      <Link
                        href={`/profile/${mentor.uid}`}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-900 dark:text-white text-xs font-semibold transition-colors border border-gray-200 dark:border-zinc-700"
                      >
                        View Profile
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>

                      <button
                        onClick={() => openRequestModal(mentor)}
                        disabled={alreadyRequested}
                        className={`flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                          alreadyRequested
                            ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 cursor-default"
                            : "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-300"
                        }`}
                      >
                        {alreadyRequested ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Requested
                          </>
                        ) : (
                          <>
                            <GraduationCap className="w-3.5 h-3.5" />
                            Request Mentor
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── Footer note ───────────────────────────────────────────────── */}
          {!loading && !error && mentors.length > 0 && (
            <p className="text-center text-xs text-gray-400 dark:text-gray-600 mt-8">
              Showing top {mentors.length} matches · Based on your skills, interests, and department ·{" "}
              <button
                onClick={fetchMatches}
                className="underline hover:text-gray-600 dark:hover:text-gray-400 transition-colors"
              >
                Refresh matches
              </button>
            </p>
          )}

        </main>
      </div>

      {/* ── Request Mentorship Modal ────────────────────────────────────────── */}
      <RequestMentorshipModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedMentor(null);
        }}
        alumni={selectedMentor}
        onRequestSent={handleRequestSent}
      />
    </ProtectedRoute>
  );
}
