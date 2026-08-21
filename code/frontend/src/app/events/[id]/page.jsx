"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
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
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  Pencil,
  Trash2,
  X,
  Plus,
  Loader2,
  Share2,
  ShieldCheck,
  Building,
} from "lucide-react";
import user_placeholder from "../../../../public/placeholder-user.jpg";

export default function EventDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, dbUser } = useAuth();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    title: "",
    description: "",
    type: "workshop",
    date: "",
    endDate: "",
    location: "",
    link: "",
  });
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);

  const fetchEventDetails = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/api/v1/events/${id}`, {
        validateStatus: (s) => s < 500,
      });

      if (res.status === 200 && res.data?.data) {
        setEvent(res.data.data);
      } else {
        setEvent(null);
      }

      if (user) {
        try {
          const stRes = await axiosInstance.get(
            `/api/v1/events/${id}/register/status`,
            { validateStatus: (s) => s < 500 }
          );
          const isReg = Boolean(
            stRes.data?.data?.registered || stRes.data?.data?.isRegistered
          );
          setIsRegistered(isReg);
        } catch {
          setIsRegistered(false);
        }
      }
    } catch (err) {
      console.error("Error fetching event details:", err);
      setEvent(null);
    } finally {
      setLoading(false);
    }
  }, [id, user]);

  useEffect(() => {
    fetchEventDetails();
  }, [fetchEventDetails]);

  const handleToggleRegister = async () => {
    if (!event) return;

    if (isRegistered) {
      const confirm = await Swal.fire({
        text: `Are you sure you want to cancel your registration for "${event.title}"?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#e11d48",
        cancelButtonColor: "#4b5563",
        confirmButtonText: "Yes, Cancel Registration",
      });
      if (!confirm.isConfirmed) return;
    }

    setIsRegistering(true);
    try {
      if (isRegistered) {
        await axiosInstance.delete(`/api/v1/events/${event.id}/register`);
        setIsRegistered(false);
        setEvent((prev) =>
          prev
            ? {
                ...prev,
                _count: {
                  attendees: Math.max(0, (prev._count?.attendees || 1) - 1),
                },
                attendees: (prev.attendees || []).filter(
                  (a) => a.user?.uid !== user?.uid && a.userId !== dbUser?.id
                ),
              }
            : prev
        );
        Swal.fire({
          title: "Registration Cancelled",
          text: "Your registration has been removed.",
          icon: "info",
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        await axiosInstance.post(`/api/v1/events/${event.id}/register`);
        setIsRegistered(true);
        setEvent((prev) =>
          prev
            ? {
                ...prev,
                _count: {
                  attendees: (prev._count?.attendees || 0) + 1,
                },
              }
            : prev
        );
        fetchEventDetails();
        Swal.fire({
          title: "Registration Confirmed!",
          text: `You have successfully registered for "${event.title}".`,
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        });
      }
    } catch (err) {
      console.error("Error updating registration:", err);
      if (err.response?.status === 409) {
        setIsRegistered(true);
        Swal.fire({
          title: "Already Registered",
          text: "You are already registered for this event.",
          icon: "info",
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        Swal.fire({
          title: "Registration Error",
          text: err.response?.data?.message || "Could not update registration.",
          icon: "error",
        });
      }
    } finally {
      setIsRegistering(false);
    }
  };

  const openEditModal = () => {
    if (!event) return;
    const formatForInput = (d) => {
      if (!d) return "";
      const dateObj = new Date(d);
      const tzOffset = dateObj.getTimezoneOffset() * 60000;
      return new Date(dateObj.getTime() - tzOffset).toISOString().slice(0, 16);
    };

    setEditFormData({
      title: event.title || "",
      description: event.description || "",
      type: event.type?.toLowerCase() || "workshop",
      date: formatForInput(event.date),
      endDate: formatForInput(event.endDate),
      location: event.location || "",
      link: event.link || "",
    });
    setEditModalOpen(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editFormData.title.trim() || !editFormData.description.trim() || !editFormData.date) {
      Swal.fire({
        title: "Missing Fields",
        text: "Please provide title, description, and date.",
        icon: "warning",
      });
      return;
    }

    setIsSubmittingEdit(true);
    try {
      const payload = {
        title: editFormData.title.trim(),
        description: editFormData.description.trim(),
        type: editFormData.type.toLowerCase(),
        date: new Date(editFormData.date).toISOString(),
      };

      if (editFormData.endDate) {
        payload.endDate = new Date(editFormData.endDate).toISOString();
      }

      if (editFormData.location?.trim()) {
        payload.location = editFormData.location.trim();
      }

      if (editFormData.link?.trim()) {
        let linkVal = editFormData.link.trim();
        if (!/^https?:\/\//i.test(linkVal)) linkVal = `https://${linkVal}`;
        payload.link = linkVal;
      }

      await axiosInstance.patch(`/api/v1/events/${event.id}`, payload);
      Swal.fire({
        title: "Event Updated!",
        text: "Event details have been updated successfully.",
        icon: "success",
        timer: 1800,
        showConfirmButton: false,
      });
      setEditModalOpen(false);
      fetchEventDetails();
    } catch (err) {
      console.error("Error updating event:", err);
      Swal.fire({
        title: "Error",
        text: err.response?.data?.message || "Failed to update event.",
        icon: "error",
      });
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  const handleDeleteEvent = async () => {
    if (!event) return;
    const confirm = await Swal.fire({
      title: "Delete Event?",
      text: `Are you sure you want to delete "${event.title}"? This cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#e11d48",
      cancelButtonColor: "#4b5563",
      confirmButtonText: "Yes, Delete Event",
    });

    if (!confirm.isConfirmed) return;

    try {
      await axiosInstance.delete(`/api/v1/events/${event.id}`);
      Swal.fire({
        title: "Event Deleted",
        text: "The event has been deleted.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
      router.push("/events");
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

  const isOrganizer =
    Boolean(dbUser) &&
    (dbUser.id === event?.organizerId ||
      dbUser.uid === event?.organizer?.uid ||
      dbUser.role === "ADMIN");

  const attendeesList = event?.attendees || [];
  const attendeesCount = event?._count?.attendees || attendeesList.length;

  const eventStartDate = event?.date ? new Date(event.date) : null;
  const eventEndDate = event?.endDate ? new Date(event.endDate) : null;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-zinc-950">
        <Navbar />

        <main className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-8 space-y-8">
          <div className="flex items-center justify-between">
            <Link
              href="/events"
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to All Events</span>
            </Link>

            {isOrganizer && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={openEditModal}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span>Edit Event</span>
                </button>
                <button
                  type="button"
                  onClick={handleDeleteEvent}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 text-xs font-semibold text-rose-600 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>

          {loading ? (
            <div className="p-16 text-center text-gray-500 dark:text-gray-400 space-y-3 bg-white dark:bg-zinc-900 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-xs">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-400" />
              <p className="text-sm font-semibold">Loading event details...</p>
            </div>
          ) : !event ? (
            <div className="p-16 text-center space-y-4 bg-white dark:bg-zinc-900 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-xs">
              <div className="w-16 h-16 rounded-3xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
                <X className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                Event Not Found
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                The event you are looking for does not exist or may have been deleted.
              </p>
              <Link
                href="/events"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 text-xs font-bold shadow-xs hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
              >
                Return to Events List
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-200/80 dark:border-gray-800 p-6 sm:p-8 shadow-xs space-y-6">
                  <div className="flex flex-wrap items-center gap-3">
                    <span
                      className={`inline-block text-xs font-bold px-3 py-1 rounded-full border ${getTypeBadgeStyle(
                        event.type
                      )}`}
                    >
                      {event.type?.replace("_", " ").toUpperCase() || "EVENT"}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 px-3 py-1 rounded-full bg-gray-100 dark:bg-zinc-800">
                      <Users className="w-3.5 h-3.5" />
                      <span>{attendeesCount} Registered Attendees</span>
                    </span>
                  </div>

                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-tight">
                    {event.title}
                  </h1>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-100 dark:border-zinc-800/80">
                    <div className="flex items-start gap-3 p-4 rounded-2xl bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-800">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                          Date & Time
                        </p>
                        <p className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white mt-0.5">
                          {eventStartDate
                            ? eventStartDate.toLocaleDateString("en-US", {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })
                            : "Date TBA"}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                          {eventStartDate
                            ? eventStartDate.toLocaleTimeString("en-US", {
                                hour: "numeric",
                                minute: "2-digit",
                                hour12: true,
                              })
                            : ""}
                          {eventEndDate &&
                            ` - ${eventEndDate.toLocaleTimeString("en-US", {
                              hour: "numeric",
                              minute: "2-digit",
                              hour12: true,
                            })}`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 rounded-2xl bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-800">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                          Location
                        </p>
                        <p className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white mt-0.5 truncate">
                          {event.location || "Online Virtual Event"}
                        </p>
                        {event.link ? (
                          <a
                            href={event.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline mt-0.5 truncate"
                          >
                            <Globe className="w-3 h-3" />
                            <span>Meeting Link</span>
                            <ExternalLink className="w-3 h-3 ml-0.5" />
                          </a>
                        ) : (
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Physical venue
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-100 dark:border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {isRegistered ? (
                        <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>You are confirmed to attend this event.</span>
                        </span>
                      ) : (
                        <span>
                          Seats are open to all verified students and alumni.
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      disabled={isRegistering}
                      onClick={handleToggleRegister}
                      className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all cursor-pointer ${
                        isRegistered
                          ? "bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-200 dark:border-rose-900 hover:bg-rose-100"
                          : "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200"
                      }`}
                    >
                      {isRegistering ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : isRegistered ? (
                        <X className="w-4 h-4" />
                      ) : (
                        <Plus className="w-4 h-4" />
                      )}
                      <span>
                        {isRegistered ? "Cancel Registration" : "Register for Event"}
                      </span>
                    </button>
                  </div>
                </div>

                <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-200/80 dark:border-gray-800 p-6 sm:p-8 shadow-xs space-y-4">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    About This Event
                  </h2>
                  <div className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                    {event.description}
                  </div>
                </div>

                <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-200/80 dark:border-gray-800 p-6 sm:p-8 shadow-xs space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                        Registered Participants
                      </h2>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        Fellow community members attending this event ({attendeesList.length})
                      </p>
                    </div>
                  </div>

                  {attendeesList.length === 0 ? (
                    <div className="p-8 text-center space-y-2 bg-gray-50 dark:bg-zinc-800/40 rounded-2xl border border-gray-100 dark:border-zinc-800">
                      <Users className="w-8 h-8 mx-auto text-gray-400" />
                      <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                        No attendees registered yet
                      </p>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400">
                        Be the first to register for this event!
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {attendeesList.map((attendeeItem) => {
                        const attUser = attendeeItem.user;
                        const regDate = attendeeItem.registeredAt
                          ? new Date(attendeeItem.registeredAt).toLocaleDateString(
                              "en-US",
                              { month: "short", day: "numeric" }
                            )
                          : "";

                        return (
                          <div
                            key={attendeeItem.id || attendeeItem.userId}
                            className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-gray-50 dark:bg-zinc-800/60 border border-gray-100 dark:border-zinc-800 hover:border-gray-200 dark:hover:border-zinc-700 transition-colors"
                          >
                            <Link
                              href={`/profile/${attUser?.uid}`}
                              className="flex items-center gap-3 min-w-0 group/att"
                            >
                              <div className="w-9 h-9 rounded-full overflow-hidden relative shrink-0 border border-gray-200 dark:border-zinc-700">
                                <Image
                                  src={
                                    attUser?.profileImage || user_placeholder
                                  }
                                  alt={attUser?.name || "Participant"}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-gray-900 dark:text-white truncate group-hover/att:underline">
                                  {attUser?.name || "Participant"}
                                </p>
                                <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60 mt-0.5">
                                  {attUser?.role || "MEMBER"}
                                </span>
                              </div>
                            </Link>

                            {regDate && (
                              <span className="text-[10px] text-gray-400 shrink-0 font-medium">
                                {regDate}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-6">
                {event.organizer && (
                  <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-200/80 dark:border-gray-800 p-6 shadow-xs space-y-4">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                      Event Organizer
                    </p>

                    <div className="flex items-center gap-4">
                      <Link
                        href={`/profile/${event.organizer.uid}`}
                        className="w-14 h-14 rounded-full overflow-hidden relative shrink-0 border-2 border-gray-200 dark:border-zinc-700 hover:opacity-90 transition-opacity"
                      >
                        <Image
                          src={
                            event.organizer.profileImage || user_placeholder
                          }
                          alt={event.organizer.name || "Organizer"}
                          fill
                          className="object-cover"
                        />
                      </Link>

                      <div className="min-w-0 space-y-0.5">
                        <Link
                          href={`/profile/${event.organizer.uid}`}
                          className="font-bold text-sm text-gray-900 dark:text-white hover:underline block truncate"
                        >
                          {event.organizer.name}
                        </Link>
                        <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 dark:bg-zinc-800 dark:text-zinc-300 border border-gray-200 dark:border-zinc-700">
                          {event.organizer.role || "ORGANIZER"}
                        </span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-gray-100 dark:border-zinc-800/80">
                      <Link
                        href={`/profile/${event.organizer.uid}`}
                        className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-xs font-semibold text-gray-900 dark:text-white transition-colors cursor-pointer"
                      >
                        <span>View Organizer Profile</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                )}

                <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-200/80 dark:border-gray-800 p-6 shadow-xs space-y-4 text-xs text-gray-600 dark:text-gray-400">
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    Event Guidelines
                  </p>
                  <ul className="space-y-2.5">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>Registration is free for all registered IUT students and alumni.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>Virtual meeting links will be accessible before the session starts. (If the session is online)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>You can cancel your registration anytime if you can no longer attend.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </main>

        <Modal
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          title="Edit Event Details"
          size="lg"
        >
          <form onSubmit={handleSaveEdit} className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                Event Title *
              </label>
              <input
                type="text"
                required
                value={editFormData.title}
                onChange={(e) =>
                  setEditFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                  Event Type *
                </label>
                <select
                  value={editFormData.type}
                  onChange={(e) =>
                    setEditFormData((prev) => ({ ...prev, type: e.target.value }))
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
                  value={editFormData.location}
                  onChange={(e) =>
                    setEditFormData((prev) => ({
                      ...prev,
                      location: e.target.value,
                    }))
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  value={editFormData.date}
                  onChange={(e) =>
                    setEditFormData((prev) => ({ ...prev, date: e.target.value }))
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
                  value={editFormData.endDate}
                  onChange={(e) =>
                    setEditFormData((prev) => ({
                      ...prev,
                      endDate: e.target.value,
                    }))
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
                value={editFormData.link}
                onChange={(e) =>
                  setEditFormData((prev) => ({ ...prev, link: e.target.value }))
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                Event Description & Agenda *
              </label>
              <textarea
                required
                rows={4}
                value={editFormData.description}
                onChange={(e) =>
                  setEditFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
              <button
                type="button"
                onClick={() => setEditModalOpen(false)}
                className="px-4 py-2 text-sm font-medium rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmittingEdit}
                className="inline-flex items-center gap-2 px-5 py-2 text-sm font-bold rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50 transition-colors cursor-pointer"
              >
                {isSubmittingEdit ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Pencil className="w-4 h-4" />
                )}
                <span>Save Changes</span>
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </ProtectedRoute>
  );
}
