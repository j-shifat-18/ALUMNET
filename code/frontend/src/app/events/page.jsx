"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import Navbar from "@/components/layout/Navbar";
import { useAuth } from "@/context/AuthProvider";
import axiosInstance from "@/lib/axios";
import Swal from "sweetalert2";
import {
  Calendar,
  Clock,
  MapPin,
  Globe,
  Users,
  Search,
  Filter,
  Plus,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Sparkles,
  BookOpen,
  GraduationCap,
  Briefcase,
  Layers,
  X,
  Loader2,
} from "lucide-react";
import user_placeholder from "../../../public/placeholder-user.jpg";

const EVENT_TYPES = [
  { label: "All Types", value: "ALL" },
  { label: "Webinar", value: "WEBINAR" },
  { label: "Workshop", value: "WORKSHOP" },
  { label: "Reunion", value: "REUNION" },
  { label: "Seminar", value: "SEMINAR" },
  { label: "Career Fair", value: "CAREER_FAIR" },
  { label: "Networking", value: "NETWORKING" },
];

export default function EventsPage() {
  const { user, dbUser } = useAuth();
  const canHostEvent = dbUser?.role === "ALUMNI" || dbUser?.role === "ADMIN";

  const [activeTab, setActiveTab] = useState("UPCOMING");
  const [selectedType, setSelectedType] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [registeringMap, setRegisteringMap] = useState({});
  const [userRegisteredMap, setUserRegisteredMap] = useState({});

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const endpoint =
        activeTab === "UPCOMING"
          ? "/api/v1/events/upcoming"
          : "/api/v1/events";

      const params = {};
      if (selectedType !== "ALL") params.type = selectedType;
      if (searchQuery.trim()) params.searchTerm = searchQuery.trim();

      const res = await axiosInstance.get(endpoint, {
        params,
        validateStatus: (s) => s < 500,
      });

      if (res.status === 200 && Array.isArray(res.data?.data)) {
        setEvents(res.data.data);

        if (user) {
          const statusPromises = res.data.data.map(async (ev) => {
            try {
              const stRes = await axiosInstance.get(
                `/api/v1/events/${ev.id}/register/status`,
                { validateStatus: (s) => s < 500 }
              );
              return {
                id: ev.id,
                isRegistered: !!stRes.data?.data?.isRegistered,
              };
            } catch {
              return { id: ev.id, isRegistered: false };
            }
          });

          const statuses = await Promise.all(statusPromises);
          const map = {};
          statuses.forEach((s) => {
            map[s.id] = s.isRegistered;
          });
          setUserRegisteredMap(map);
        }
      } else {
        setEvents([]);
      }
    } catch (err) {
      console.error("Error fetching events:", err);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab, selectedType, searchQuery, user]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchEvents();
    }, 200);
    return () => clearTimeout(timer);
  }, [fetchEvents]);

  const handleToggleRegister = async (eventId, eventTitle) => {
    const isRegistered = !!userRegisteredMap[eventId];

    if (isRegistered) {
      const confirm = await Swal.fire({
        text: `Are you sure you want to cancel your registration for "${eventTitle}"?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#e11d48",
        cancelButtonColor: "#4b5563",
        confirmButtonText: "Yes, Cancel RSVP",
      });
      if (!confirm.isConfirmed) return;
    }

    setRegisteringMap((prev) => ({ ...prev, [eventId]: true }));
    try {
      if (isRegistered) {
        await axiosInstance.delete(`/api/v1/events/${eventId}/register`);
        setUserRegisteredMap((prev) => ({ ...prev, [eventId]: false }));
        setEvents((prev) =>
          prev.map((e) =>
            e.id === eventId
              ? {
                  ...e,
                  _count: {
                    attendees: Math.max(0, (e._count?.attendees || 1) - 1),
                  },
                }
              : e
          )
        );
        Swal.fire({
          title: "RSVP Cancelled",
          text: "Your registration has been removed.",
          icon: "info",
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        await axiosInstance.post(`/api/v1/events/${eventId}/register`);
        setUserRegisteredMap((prev) => ({ ...prev, [eventId]: true }));
        setEvents((prev) =>
          prev.map((e) =>
            e.id === eventId
              ? {
                  ...e,
                  _count: {
                    attendees: (e._count?.attendees || 0) + 1,
                  },
                }
              : e
          )
        );
        Swal.fire({
          title: "Registration Confirmed!",
          text: `You have successfully registered for "${eventTitle}".`,
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        });
      }
    } catch (err) {
      console.error("Error updating event registration:", err);
      Swal.fire({
        title: "Registration Error",
        text: err.response?.data?.message || "Could not update registration.",
        icon: "error",
      });
    } finally {
      setRegisteringMap((prev) => ({ ...prev, [eventId]: false }));
    }
  };

  const getTypeBadgeStyle = (type) => {
    switch (type) {
      case "WEBINAR":
        return "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800/60";
      case "WORKSHOP":
        return "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60";
      case "REUNION":
        return "bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800/60";
      case "CAREER_FAIR":
        return "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800/60";
      case "SEMINAR":
        return "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/60";
      default:
        return "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700";
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-zinc-950">
        <Navbar />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-8">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-200/80 dark:border-gray-800 p-6 sm:p-8 shadow-xs mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 text-xs font-bold border border-blue-200 dark:border-blue-900/40">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>IUT Campus & Alumni Events</span>
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                  Discover Workshops, Webinars & Reunions
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  Connect with fellow alumni, participate in technical seminars, attend campus career fairs, and RSVP to upcoming events worldwide.
                </p>
              </div>

              {canHostEvent && (
                <div className="shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      Swal.fire({
                        title: "Create Event",
                        text: "Event creation modal will open here in the next step.",
                        icon: "info",
                      });
                    }}
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Host New Event</span>
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 pt-6 mt-6 border-t border-gray-100 dark:border-zinc-800/80">
              <button
                type="button"
                onClick={() => setActiveTab("UPCOMING")}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeTab === "UPCOMING"
                    ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800"
                }`}
              >
                Upcoming Events
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("ALL")}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeTab === "ALL"
                    ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800"
                }`}
              >
                All Events
              </button>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
            <div className="relative w-full md:max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search events by title or keywords..."
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-gray-800 rounded-2xl text-xs sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 shadow-2xs"
              />
            </div>

            <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 mr-1 flex items-center gap-1 shrink-0">
                <Filter className="w-3.5 h-3.5" /> Category:
              </span>
              {EVENT_TYPES.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setSelectedType(type.value)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                    selectedType === type.value
                      ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs"
                      : "bg-white dark:bg-zinc-900 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800 border border-gray-200/80 dark:border-gray-800"
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="p-16 text-center text-gray-500 dark:text-gray-400 space-y-3 bg-white dark:bg-zinc-900 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-xs">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-400" />
              <p className="text-sm font-semibold">Loading campus events...</p>
            </div>
          ) : events.length === 0 ? (
            <div className="p-16 text-center space-y-4 bg-white dark:bg-zinc-900 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-xs">
              <div className="w-16 h-16 rounded-3xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
                <Calendar className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                  No events found
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                  {searchQuery || selectedType !== "ALL"
                    ? "Try adjusting your search query or filter category to discover more events."
                    : activeTab === "UPCOMING"
                    ? "There are no upcoming events scheduled at this moment. Check back soon!"
                    : "No events recorded in the archive."}
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => {
                const eventDate = event.date ? new Date(event.date) : null;
                const dateDay = eventDate
                  ? eventDate.toLocaleDateString("en-US", { day: "numeric" })
                  : "--";
                const dateMonth = eventDate
                  ? eventDate.toLocaleDateString("en-US", { month: "short" })
                  : "";
                const timeString = eventDate
                  ? eventDate.toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: true,
                    })
                  : "";

                const isRegistered = !!userRegisteredMap[event.id];
                const isRegistering = !!registeringMap[event.id];
                const attendeesCount = event._count?.attendees || 0;

                return (
                  <div
                    key={event.id}
                    className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-200/80 dark:border-gray-800 p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                  >
                    <div className="space-y-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-13 h-13 rounded-2xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 flex flex-col items-center justify-center shrink-0 shadow-xs">
                            <span className="text-[10px] font-bold uppercase tracking-wider leading-none opacity-80">
                              {dateMonth}
                            </span>
                            <span className="text-base font-extrabold leading-none mt-0.5">
                              {dateDay}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <span
                              className={`inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${getTypeBadgeStyle(
                                event.type
                              )}`}
                            >
                              {event.type?.replace("_", " ") || "EVENT"}
                            </span>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1 font-medium">
                              <Clock className="w-3.5 h-3.5" />
                              <span>{timeString || "Time TBA"}</span>
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <h3 className="font-bold text-base text-gray-900 dark:text-white leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                          {event.title}
                        </h3>
                        {event.description && (
                          <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-3 leading-relaxed">
                            {event.description}
                          </p>
                        )}
                      </div>

                      <div className="pt-3 border-t border-gray-100 dark:border-zinc-800/80 space-y-2 text-xs text-gray-600 dark:text-gray-400">
                        {event.location && (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                            <span className="truncate">{event.location}</span>
                          </div>
                        )}
                        {event.link && (
                          <div className="flex items-center gap-2">
                            <Globe className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                            <a
                              href={event.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 dark:text-blue-400 hover:underline truncate"
                            >
                              Virtual Meeting Link
                            </a>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-[11px] font-semibold text-gray-500 dark:text-gray-400">
                          <Users className="w-3.5 h-3.5 text-gray-400" />
                          <span>{attendeesCount} Registered Attendees</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 pt-4 border-t border-gray-100 dark:border-zinc-800/80 flex items-center justify-between gap-3">
                      {event.organizer && (
                        <Link
                          href={`/profile/${event.organizer.uid}`}
                          className="flex items-center gap-2 min-w-0 group/org"
                        >
                          <div className="w-7 h-7 rounded-full overflow-hidden relative shrink-0 border border-gray-200 dark:border-zinc-700">
                            <Image
                              src={
                                event.organizer.profileImage || user_placeholder
                              }
                              alt={event.organizer.name || "Organizer"}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 truncate group-hover/org:underline">
                            {event.organizer.name}
                          </span>
                        </Link>
                      )}

                      <button
                        type="button"
                        disabled={isRegistering}
                        onClick={() =>
                          handleToggleRegister(event.id, event.title)
                        }
                        className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer ${
                          isRegistered
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200"
                            : "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200"
                        }`}
                      >
                        {isRegistering ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : isRegistered ? (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        ) : (
                          <Plus className="w-3.5 h-3.5" />
                        )}
                        <span>{isRegistered ? "RSVP'd" : "RSVP"}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
