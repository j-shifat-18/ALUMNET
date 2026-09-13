"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import Navbar from "@/components/layout/Navbar";
import Modal from "@/components/ui/Modal";
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
  ChevronLeft,
  ArrowRight,
  Sparkles,
  BookOpen,
  GraduationCap,
  Briefcase,
  Layers,
  X,
  Loader2,
  Pencil,
  Trash2,
} from "lucide-react";
import user_placeholder from "../../../public/placeholder-user.jpg";

const EVENT_TYPES = [
  { label: "All Types", value: "ALL" },
  { label: "Workshop", value: "workshop" },
  { label: "Seminar", value: "seminar" },
  { label: "Webinar", value: "webinar" },
  { label: "Networking", value: "networking" },
  { label: "Other", value: "other" },
];

const INITIAL_FORM_DATA = {
  title: "",
  description: "",
  type: "workshop",
  date: "",
  endDate: "",
  location: "",
  link: "",
};

export default function EventsPage() {
  const { user, dbUser } = useAuth();
  const canHostEvent = Boolean(dbUser);

  const [activeTab, setActiveTab] = useState("UPCOMING");
  const [selectedType, setSelectedType] = useState("ALL");
  const [searchInput, setSearchInput] = useState("");
  const [activeSearch, setActiveSearch] = useState("");

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [attendeesModalOpen, setAttendeesModalOpen] = useState(false);
  const [selectedEventForAttendees, setSelectedEventForAttendees] = useState(null);
  const [attendeesList, setAttendeesList] = useState([]);
  const [loadingAttendees, setLoadingAttendees] = useState(false);

  const openAttendeesModal = async (event) => {
    setSelectedEventForAttendees(event);
    setAttendeesModalOpen(true);
    setLoadingAttendees(true);
    try {
      const res = await axiosInstance.get(`/api/v1/events/${event.id}`, {
        validateStatus: (s) => s < 500,
      });
      if (res.status === 200 && res.data?.data) {
        setAttendeesList(res.data.data.attendees || []);
      } else {
        setAttendeesList([]);
      }
    } catch (err) {
      console.error("Error fetching event attendees:", err);
      setAttendeesList([]);
    } finally {
      setLoadingAttendees(false);
    }
  };

  const [currentPage, setCurrentPage] = useState(1);
  const [paginationMeta, setPaginationMeta] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 1,
  });

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const endpoint =
        activeTab === "UPCOMING"
          ? "/api/v1/events/upcoming"
          : "/api/v1/events";

      const params = {
        page: currentPage,
        limit: 12,
      };
      if (selectedType !== "ALL") params.type = selectedType;
      if (activeSearch.trim()) params.searchTerm = activeSearch.trim();

      const res = await axiosInstance.get(endpoint, {
        params,
        validateStatus: (s) => s < 500,
      });

      if (res.status === 200 && Array.isArray(res.data?.data)) {
        setEvents(res.data.data);
        if (res.data?.meta) {
          setPaginationMeta(res.data.meta);
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
  }, [activeTab, selectedType, activeSearch, currentPage]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setActiveSearch(searchInput.trim());
    setCurrentPage(1);
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setActiveSearch("");
    setCurrentPage(1);
  };

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesType =
        selectedType === "ALL" ||
        event.type?.toLowerCase() === selectedType.toLowerCase();

      const query = activeSearch.toLowerCase().trim();
      const matchesSearch =
        !query ||
        event.title?.toLowerCase().includes(query) ||
        event.description?.toLowerCase().includes(query) ||
        event.location?.toLowerCase().includes(query) ||
        event.organizer?.name?.toLowerCase().includes(query);

      return matchesType && matchesSearch;
    });
  }, [events, selectedType, activeSearch]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);


  const openCreateModal = () => {
    setEditingEventId(null);
    setFormData(INITIAL_FORM_DATA);
    setEventModalOpen(true);
  };

  const openEditModal = (event) => {
    setEditingEventId(event.id);
    const formatForInput = (d) => {
      if (!d) return "";
      const dateObj = new Date(d);
      const tzOffset = dateObj.getTimezoneOffset() * 60000;
      const localISOTime = new Date(dateObj.getTime() - tzOffset)
        .toISOString()
        .slice(0, 16);
      return localISOTime;
    };

    setFormData({
      title: event.title || "",
      description: event.description || "",
      type: event.type?.toLowerCase() || "workshop",
      date: formatForInput(event.date),
      endDate: formatForInput(event.endDate),
      location: event.location || "",
      link: event.link || "",
    });
    setEventModalOpen(true);
  };

  const handleSaveEvent = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim() || !formData.date) {
      Swal.fire({
        title: "Missing Fields",
        text: "Please provide a title, description, and event date.",
        icon: "warning",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        type: formData.type.toLowerCase(),
        date: new Date(formData.date).toISOString(),
      };

      if (formData.endDate) {
        payload.endDate = new Date(formData.endDate).toISOString();
      }

      if (formData.location?.trim()) {
        payload.location = formData.location.trim();
      }

      if (formData.link?.trim()) {
        let linkVal = formData.link.trim();
        if (!/^https?:\/\//i.test(linkVal)) {
          linkVal = `https://${linkVal}`;
        }
        payload.link = linkVal;
      }

      if (editingEventId) {
        await axiosInstance.patch(`/api/v1/events/${editingEventId}`, payload);
        Swal.fire({
          title: "Event Updated!",
          text: "Your event details have been updated.",
          icon: "success",
          timer: 1800,
          showConfirmButton: false,
        });
      } else {
        await axiosInstance.post("/api/v1/events", payload);
        Swal.fire({
          title: "Event Published! 🎉",
          text: "Your event is now live for all members to discover and register.",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        });
      }

      setEventModalOpen(false);
      fetchEvents();
    } catch (err) {
      console.error("Error saving event:", err);
      Swal.fire({
        title: "Error",
        text: err.response?.data?.message || "Failed to save event.",
        icon: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEvent = async (eventId, eventTitle) => {
    const confirm = await Swal.fire({
      title: "Delete Event?",
      text: `Are you sure you want to remove "${eventTitle}"? This will cancel all attendee registrations.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#e11d48",
      cancelButtonColor: "#4b5563",
      confirmButtonText: "Yes, Delete Event",
    });

    if (!confirm.isConfirmed) return;

    try {
      await axiosInstance.delete(`/api/v1/events/${eventId}`);
      setEvents((prev) => prev.filter((e) => e.id !== eventId));
      Swal.fire({
        title: "Event Deleted",
        text: "The event has been removed.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error("Error deleting event:", err);
      Swal.fire({
        title: "Error",
        text: err.response?.data?.message || "Failed to delete event.",
        icon: "error",
      });
    }
  };

  const getTypeBadgeStyle = (type) => {
    switch (type?.toLowerCase()) {
      case "webinar":
        return "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800/60";
      case "workshop":
        return "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60";
      case "seminar":
        return "bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800/60";
      case "networking":
        return "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800/60";
      default:
        return "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700";
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-zinc-950">
        <Navbar />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-8">
          {/* Header Banner */}
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
                  Connect with fellow alumni, participate in technical seminars, attend campus career fairs, and register for upcoming events worldwide.
                </p>
              </div>

              {canHostEvent && (
                <div className="shrink-0">
                  <button
                    type="button"
                    onClick={openCreateModal}
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
                onClick={() => {
                  setActiveTab("UPCOMING");
                  setCurrentPage(1);
                }}
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
                onClick={() => {
                  setActiveTab("ALL");
                  setCurrentPage(1);
                }}
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
            <form
              onSubmit={handleSearchSubmit}
              className="flex items-center gap-2 w-full md:max-w-md"
            >
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search events by title or keywords..."
                  className="w-full pl-10 pr-9 py-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-gray-800 rounded-2xl text-xs sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 shadow-2xs"
                />
                {searchInput && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-0.5"
                    title="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <button
                type="submit"
                className="px-4 py-2.5 rounded-2xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-xs sm:text-sm font-bold shadow-xs transition-colors shrink-0 cursor-pointer"
              >
                Search
              </button>
            </form>

            <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 mr-1 flex items-center gap-1 shrink-0">
                <Filter className="w-3.5 h-3.5" /> Category:
              </span>
              {EVENT_TYPES.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => {
                    setSelectedType(type.value);
                    setCurrentPage(1);
                  }}
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
          ) : filteredEvents.length === 0 ? (
            <div className="p-16 text-center space-y-4 bg-white dark:bg-zinc-900 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-xs">
              <div className="w-16 h-16 rounded-3xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
                <Calendar className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                  No events found
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                  {activeSearch || selectedType !== "ALL"
                    ? "Try adjusting your search query or filter category to discover more events."
                    : activeTab === "UPCOMING"
                    ? "There are no upcoming events scheduled at this moment. Check back soon!"
                    : "No events recorded in the archive."}
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event) => {
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

                const attendeesCount = event._count?.attendees || 0;

                const isOrganizer =
                  dbUser?.id === event.organizerId ||
                  dbUser?.uid === event.organizer?.uid ||
                  dbUser?.role === "ADMIN";

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

                        {isOrganizer && (
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => openEditModal(event)}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors cursor-pointer"
                              title="Edit Event"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                handleDeleteEvent(event.id, event.title)
                              }
                              className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                              title="Delete Event"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <Link href={`/events/${event.id}`} className="block group/title">
                          <h3 className="font-bold text-base text-gray-900 dark:text-white leading-snug group-hover/title:text-blue-600 dark:group-hover/title:text-blue-400 transition-colors line-clamp-2">
                            {event.title}
                          </h3>
                        </Link>
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
                        {isOrganizer ? (
                          <button
                            type="button"
                            onClick={() => openAttendeesModal(event)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-gray-900 dark:text-gray-100 text-[11px] font-semibold transition-colors cursor-pointer group/att"
                            title="Click to view participant list"
                          >
                            <Users className="w-3.5 h-3.5 text-blue-500" />
                            <span>{attendeesCount} Registered Attendees</span>
                            <ChevronRight className="w-3 h-3 text-gray-400 group-hover/att:translate-x-0.5 transition-transform" />
                          </button>
                        ) : (
                          <div className="flex items-center gap-2 text-[11px] font-semibold text-gray-500 dark:text-gray-400">
                            <Users className="w-3.5 h-3.5 text-gray-400" />
                            <span>{attendeesCount} Registered Attendees</span>
                          </div>
                        )}
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

                      <Link
                        href={`/events/${event.id}`}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-xs font-bold transition-all shadow-2xs shrink-0 cursor-pointer"
                      >
                        <span>View Details</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {paginationMeta.totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-6 border-t border-gray-200/80 dark:border-gray-800">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Showing page <span className="font-bold text-gray-900 dark:text-white">{currentPage}</span> of{" "}
                <span className="font-bold text-gray-900 dark:text-white">{paginationMeta.totalPages}</span> ({paginationMeta.total} total events)
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={currentPage <= 1 || loading}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-zinc-900 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 disabled:opacity-40 transition-all cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </button>
                <button
                  type="button"
                  disabled={currentPage >= paginationMeta.totalPages || loading}
                  onClick={() => setCurrentPage((p) => Math.min(paginationMeta.totalPages, p + 1))}
                  className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-zinc-900 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 disabled:opacity-40 transition-all cursor-pointer"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        <Modal
          isOpen={eventModalOpen}
          onClose={() => setEventModalOpen(false)}
          title={editingEventId ? "Edit Event" : "Host New Campus / Alumni Event"}
          size="lg"
        >
          <form onSubmit={handleSaveEvent} className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                Event Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="e.g. System Design Workshop for Tech Careers"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                  Event Type *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, type: e.target.value }))
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="workshop">Workshop</option>
                  <option value="seminar">Seminar</option>
                  <option value="webinar">Webinar</option>
                  <option value="networking">Networking</option>
                  <option value="other">Other / Reunion / Career Fair</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, location: e.target.value }))
                  }
                  placeholder="e.g. IUT Auditorium / Online"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                  Start Date & Time *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={formData.date}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, date: e.target.value }))
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                  End Date & Time (Optional)
                </label>
                <input
                  type="datetime-local"
                  value={formData.endDate}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, endDate: e.target.value }))
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                Virtual Meeting Link (Optional)
              </label>
              <input
                type="url"
                value={formData.link}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, link: e.target.value }))
                }
                placeholder="https://meet.google.com/... or https://zoom.us/..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                Event Description & Agenda *
              </label>
              <textarea
                required
                rows={4}
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, description: e.target.value }))
                }
                placeholder="Detail what attendees will learn, speakers, schedule, or guidelines..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
              <button
                type="button"
                onClick={() => setEventModalOpen(false)}
                className="px-4 py-2 text-sm font-medium rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !formData.title.trim() || !formData.date}
                className="inline-flex items-center gap-2 px-5 py-2 text-sm font-bold rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50 transition-colors cursor-pointer"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                <span>{editingEventId ? "Save Changes" : "Publish Event"}</span>
              </button>
            </div>
          </form>
        </Modal>

        <Modal
          isOpen={attendeesModalOpen}
          onClose={() => setAttendeesModalOpen(false)}
          title={`Registered Attendees (${attendeesList.length})`}
          size="md"
        >
          <div className="space-y-4 pt-1">
            {selectedEventForAttendees && (
              <div className="p-3.5 bg-gray-50 dark:bg-zinc-800/60 rounded-2xl border border-gray-100 dark:border-zinc-800">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Event
                </p>
                <h4 className="font-bold text-sm text-gray-900 dark:text-white mt-0.5 truncate">
                  {selectedEventForAttendees.title}
                </h4>
              </div>
            )}

            {loadingAttendees ? (
              <div className="p-8 text-center space-y-2">
                <Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" />
                <p className="text-xs font-medium text-gray-500">Loading attendee roster...</p>
              </div>
            ) : attendeesList.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-zinc-800 text-gray-400 flex items-center justify-center mx-auto">
                  <Users className="w-6 h-6" />
                </div>
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  No registered attendees yet
                </p>
              </div>
            ) : (
              <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
                {attendeesList.map((item) => {
                  const attendeeUser = item.user;
                  const regDate = item.registeredAt
                    ? new Date(item.registeredAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })
                    : "";

                  return (
                    <div
                      key={item.id || item.userId}
                      className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 hover:border-gray-200 dark:hover:border-zinc-700 transition-colors"
                    >
                      <Link
                        href={`/profile/${attendeeUser?.uid}`}
                        className="flex items-center gap-3 min-w-0 group/attendee"
                      >
                        <div className="w-9 h-9 rounded-full overflow-hidden relative shrink-0 border border-gray-200 dark:border-zinc-700">
                          <Image
                            src={
                              attendeeUser?.profileImage || user_placeholder
                            }
                            alt={attendeeUser?.name || "Attendee"}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-gray-900 dark:text-white truncate group-hover/attendee:underline">
                            {attendeeUser?.name || "Participant"}
                          </p>
                          <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60 mt-0.5">
                            {attendeeUser?.role || "MEMBER"}
                          </span>
                        </div>
                      </Link>

                      {regDate && (
                        <div className="text-right shrink-0">
                          <span className="text-[11px] text-gray-400 font-medium">
                            {regDate}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex justify-end">
              <button
                type="button"
                onClick={() => setAttendeesModalOpen(false)}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-gray-900 dark:text-white transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </ProtectedRoute>
  );
}
