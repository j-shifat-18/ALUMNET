"use client";

import React, { useState } from "react";
import Modal from "@/components/ui/Modal";
import { Button } from "@/components/ui/Drawer";
import axiosInstance from "@/lib/axios";
import Swal from "sweetalert2";
import { Send, UserCheck, Sparkles, MessageSquare } from "lucide-react";
import Image from "next/image";
import user_placeholder from "../../../public/placeholder-user.jpg";

export default function RequestMentorshipModal({
  isOpen,
  onClose,
  alumni,
  onRequestSent,
}) {
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!alumni?.uid) return;

    try {
      setIsSubmitting(true);
      const res = await axiosInstance.post("/api/v1/mentorship/request", {
        alumniUid: alumni.uid,
        message: message.trim() || undefined,
      });

      Swal.fire({
        title: "Request Sent!",
        text: `Your mentorship request has been sent to ${alumni.name || "the alumni"}.`,
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });

      if (onRequestSent) {
        onRequestSent(res.data?.data);
      }
      onClose();
    } catch (err) {
      console.error("Error sending mentorship request:", err);
      const errorMsg =
        err.response?.data?.message ||
        "Failed to send mentorship request. Please try again.";
      Swal.fire({
        title: "Unable to send request",
        text: errorMsg,
        icon: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!alumni) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Request Mentorship"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 py-1">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800">
          <div className="w-12 h-12 rounded-full overflow-hidden relative shrink-0 border border-zinc-200 dark:border-zinc-700">
            <Image
              src={alumni.profileImage || user_placeholder}
              alt={alumni.name || "Mentor"}
              fill
              className="object-cover"
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h5 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 truncate">
                {alumni.name || "Alumni"}
              </h5>
              <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                ALUMNI
              </span>
            </div>
            {alumni.alumniProfile?.currentPosition && (
              <p className="text-xs text-zinc-600 dark:text-zinc-400 truncate">
                {alumni.alumniProfile.currentPosition}
                {alumni.alumniProfile.currentCompany && ` at ${alumni.alumniProfile.currentCompany}`}
              </p>
            )}
            {alumni.alumniProfile?.department && (
              <p className="text-[11px] text-zinc-500 dark:text-zinc-500">
                Dept. of {alumni.alumniProfile.department}
              </p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5 flex items-center gap-1">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Personal Note / Guidance Goals (Optional)</span>
          </label>
          <textarea
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Introduce yourself, mention what domains or career areas you'd love guidance on, and why you'd like them as your mentor..."
            className="signin-input w-full p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-all resize-none"
          />
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
            Tip: A friendly note explaining your career interests helps mentors understand how they can best guide you.
          </p>
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200"
          >
            {isSubmitting ? (
              "Sending..."
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Send Request</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
