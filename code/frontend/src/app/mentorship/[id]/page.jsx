"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import Navbar from "@/components/layout/Navbar";
import { useAuth } from "@/context/AuthProvider";
import axiosInstance from "@/lib/axios";
import Swal from "sweetalert2";
import {
  ArrowLeft,
  GraduationCap,
  Calendar,
  BookOpen,
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  Pencil,
  Clock,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  CheckSquare,
  ListTodo,
  Layers,
  Sparkles,
  User,
  Building2,
  Briefcase,
  X,
  Loader2,
} from "lucide-react";
import user_placeholder from "../../../../public/placeholder-user.jpg";

export default function MenteeTasksPage() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const studentUidParam = searchParams.get("studentUid");
  const alumniUidParam = searchParams.get("alumniUid");
  const router = useRouter();
  const { dbUser: authDbUser } = useAuth();

  const isMentor = authDbUser?.role === "ALUMNI";
  const isStudent = authDbUser?.role === "STUDENT";

  const [targetUser, setTargetUser] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingSessions, setLoadingSessions] = useState(true);

  const [createSessionModalOpen, setCreateSessionModalOpen] = useState(false);
  const [sessionTitle, setSessionTitle] = useState("");
  const [sessionDescription, setSessionDescription] = useState("");
  const [isSubmittingSession, setIsSubmittingSession] = useState(false);

  const [createTaskModalOpen, setCreateTaskModalOpen] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskDueDate, setTaskDueDate] = useState("");
  const [isSubmittingTask, setIsSubmittingTask] = useState(false);

  const [editTaskModalOpen, setEditTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [editTaskTitle, setEditTaskTitle] = useState("");
  const [editTaskDescription, setEditTaskDescription] = useState("");
  const [editTaskDueDate, setEditTaskDueDate] = useState("");
  const [isUpdatingTask, setIsUpdatingTask] = useState(false);

  const fetchUserDetails = useCallback(async () => {
    setLoadingUser(true);
    try {
      let uidToFetch = studentUidParam || alumniUidParam;

      if (!uidToFetch && id) {
        if (isStudent || alumniUidParam) {
          const mentorsRes = await axiosInstance.get("/api/v1/mentorship/mentors", {
            validateStatus: (s) => s < 500,
          });
          if (mentorsRes.status === 200 && Array.isArray(mentorsRes.data?.data)) {
            const match = mentorsRes.data.data.find(
              (item) => item.requestId === Number(id)
            );
            if (match?.mentor?.uid) {
              uidToFetch = match.mentor.uid;
            }
          }
        } else {
          const menteesRes = await axiosInstance.get("/api/v1/mentorship/mentees", {
            validateStatus: (s) => s < 500,
          });
          if (menteesRes.status === 200 && Array.isArray(menteesRes.data?.data)) {
            const match = menteesRes.data.data.find(
              (item) => item.requestId === Number(id)
            );
            if (match?.mentee?.uid) {
              uidToFetch = match.mentee.uid;
            }
          }
        }
      }

      if (uidToFetch) {
        const userRes = await axiosInstance.get(`/api/v1/users/${uidToFetch}`, {
          validateStatus: (s) => s < 500,
        });
        if (userRes.status === 200 && userRes.data?.data) {
          setTargetUser(userRes.data.data);
        }
      }
    } catch (err) {
      console.error("Error fetching user details:", err);
    } finally {
      setLoadingUser(false);
    }
  }, [id, studentUidParam, alumniUidParam, isStudent]);

  const fetchSessions = useCallback(async () => {
    if (!id) return;
    setLoadingSessions(true);
    try {
      const res = await axiosInstance.get(`/api/v1/mentorship/${id}/sessions`, {
        validateStatus: (s) => s < 500,
      });
      if (res.status === 200 && Array.isArray(res.data?.data)) {
        setSessions(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching sessions:", err);
    } finally {
      setLoadingSessions(false);
    }
  }, [id]);

  useEffect(() => {
    fetchUserDetails();
    fetchSessions();
  }, [fetchUserDetails, fetchSessions]);

  const handleCreateSession = async (e) => {
    e.preventDefault();
    if (!sessionTitle.trim()) return;

    setIsSubmittingSession(true);
    try {
      const res = await axiosInstance.post(`/api/v1/mentorship/${id}/sessions`, {
        title: sessionTitle.trim(),
        description: sessionDescription.trim() || undefined,
      });

      if (res.status === 201 || res.status === 200) {
        setSessionTitle("");
        setSessionDescription("");
        setCreateSessionModalOpen(false);
        fetchSessions();

        Swal.fire({
          title: "Milestone Created!",
          text: "New mentorship milestone created successfully.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
      }
    } catch (err) {
      console.error("Error creating session:", err);
      Swal.fire({
        title: "Error",
        text: err.response?.data?.message || "Failed to create milestone.",
        icon: "error",
      });
    } finally {
      setIsSubmittingSession(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!taskTitle.trim() || !activeSessionId) return;

    setIsSubmittingTask(true);
    try {
      const payload = {
        title: taskTitle.trim(),
      };
      if (taskDescription.trim()) {
        payload.description = taskDescription.trim();
      }
      if (taskDueDate) {
        payload.dueDate = new Date(taskDueDate).toISOString();
      }

      const res = await axiosInstance.post(
        `/api/v1/mentorship/sessions/${activeSessionId}/tasks`,
        payload
      );

      if (res.status === 201 || res.status === 200) {
        setTaskTitle("");
        setTaskDescription("");
        setTaskDueDate("");
        setCreateTaskModalOpen(false);
        fetchSessions();

        Swal.fire({
          title: "Task Added!",
          text: "Task assigned successfully.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
      }
    } catch (err) {
      console.error("Error creating task:", err);
      Swal.fire({
        title: "Error",
        text: err.response?.data?.message || "Failed to create task.",
        icon: "error",
      });
    } finally {
      setIsSubmittingTask(false);
    }
  };

  const handleToggleTask = async (taskId, currentStatus) => {
    try {
      setSessions((prev) =>
        prev.map((s) => ({
          ...s,
          tasks: (s.tasks || []).map((t) =>
            t.id === taskId ? { ...t, isCompleted: !currentStatus } : t
          ),
        }))
      );

      await axiosInstance.patch(`/api/v1/mentorship/tasks/${taskId}`, {
        isCompleted: !currentStatus,
      });
    } catch (err) {
      console.error("Error updating task status:", err);
      fetchSessions();
    }
  };

  const openEditTaskModal = (task) => {
    setEditingTask(task);
    setEditTaskTitle(task.title || "");
    setEditTaskDescription(task.description || "");
    setEditTaskDueDate(
      task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : ""
    );
    setEditTaskModalOpen(true);
  };

  const handleUpdateTask = async (e) => {
    e.preventDefault();
    if (!editTaskTitle.trim() || !editingTask) return;

    setIsUpdatingTask(true);
    try {
      const payload = {
        title: editTaskTitle.trim(),
        description: editTaskDescription.trim() || undefined,
        dueDate: editTaskDueDate ? new Date(editTaskDueDate).toISOString() : null,
      };

      const res = await axiosInstance.patch(
        `/api/v1/mentorship/tasks/${editingTask.id}`,
        payload
      );

      if (res.status === 200) {
        setEditTaskModalOpen(false);
        setEditingTask(null);
        fetchSessions();

        Swal.fire({
          title: "Task Updated",
          icon: "success",
          timer: 1400,
          showConfirmButton: false,
        });
      }
    } catch (err) {
      console.error("Error updating task:", err);
      Swal.fire({
        title: "Error",
        text: err.response?.data?.message || "Failed to update task.",
        icon: "error",
      });
    } finally {
      setIsUpdatingTask(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    const confirm = await Swal.fire({
      title: "Delete Task?",
      text: "Are you sure you want to delete this task?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
    });

    if (!confirm.isConfirmed) return;

    try {
      await axiosInstance.delete(`/api/v1/mentorship/tasks/${taskId}`);
      fetchSessions();

      Swal.fire({
        title: "Deleted!",
        text: "Task has been removed.",
        icon: "success",
        timer: 1400,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error("Error deleting task:", err);
      Swal.fire({
        title: "Error",
        text: err.response?.data?.message || "Failed to delete task.",
        icon: "error",
      });
    }
  };

  const totalTasks = sessions.reduce(
    (acc, s) => acc + (s.tasks ? s.tasks.length : 0),
    0
  );
  const completedTasks = sessions.reduce(
    (acc, s) =>
      acc + (s.tasks ? s.tasks.filter((t) => t.isCompleted).length : 0),
    0
  );
  const progressPercent =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-gray-100 flex flex-col font-sans transition-colors duration-200">
        <Navbar />

        <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          <div className="flex items-center justify-between">
            <Link
              href="/mentorship"
              className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Mentorship Dashboard</span>
            </Link>
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 sm:p-7 shadow-sm">
            {loadingUser ? (
              <div className="flex items-center gap-4 animate-pulse">
                <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-zinc-800 shrink-0" />
                <div className="space-y-2.5 flex-1">
                  <div className="h-5 w-48 bg-gray-200 dark:bg-zinc-800 rounded" />
                  <div className="h-4 w-72 bg-gray-100 dark:bg-zinc-800/60 rounded" />
                </div>
              </div>
            ) : targetUser ? (
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
                <div className="flex items-start gap-4 sm:gap-5">
                  <Link
                    href={`/profile/${targetUser.uid}`}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden relative shrink-0 border-2 border-gray-200 dark:border-zinc-700 hover:opacity-90 transition-opacity"
                  >
                    <Image
                      src={targetUser.profileImage || user_placeholder}
                      alt={targetUser.name || "User"}
                      fill
                      className="object-cover"
                    />
                  </Link>

                  <div className="space-y-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link
                          href={`/profile/${targetUser.uid}`}
                          className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white hover:underline"
                        >
                          {targetUser.name || (targetUser.role === "ALUMNI" ? "Alumni Mentor" : "Student Mentee")}
                        </Link>
                        <span
                          className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full ${
                            targetUser.role === "ALUMNI"
                              ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                              : "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                          }`}
                        >
                          {targetUser.role === "ALUMNI" ? "ALUMNI" : "STUDENT"}
                        </span>
                        {targetUser.isVerified && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Verified</span>
                          </span>
                        )}
                      </div>

                      {targetUser.role === "ALUMNI" && targetUser.alumniProfile?.currentPosition && (
                        <p className="text-xs sm:text-sm font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-1.5 pt-0.5">
                          <Briefcase className="w-3.5 h-3.5 text-gray-400" />
                          <span>
                            {targetUser.alumniProfile.currentPosition}
                            {targetUser.alumniProfile.currentCompany && ` at ${targetUser.alumniProfile.currentCompany}`}
                          </span>
                        </p>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-gray-600 dark:text-gray-300">
                      {(targetUser.alumniProfile?.department || targetUser.studentProfile?.department) && (
                        <div className="flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-gray-400" />
                          <span>
                            <strong>Department:</strong>{" "}
                            {targetUser.alumniProfile?.department || targetUser.studentProfile?.department}
                          </span>
                        </div>
                      )}

                      {(targetUser.alumniProfile?.program || targetUser.studentProfile?.program) && (
                        <div className="flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5 text-gray-400" />
                          <span>
                            <strong>Program:</strong>{" "}
                            {targetUser.alumniProfile?.program || targetUser.studentProfile?.program}
                          </span>
                        </div>
                      )}

                      {(targetUser.alumniProfile?.batch || targetUser.studentProfile?.batch) && (
                        <div className="flex items-center gap-1.5">
                          <GraduationCap className="w-3.5 h-3.5 text-gray-400" />
                          <span>
                            <strong>Batch:</strong>{" "}
                            {targetUser.alumniProfile?.batch || targetUser.studentProfile?.batch}
                          </span>
                        </div>
                      )}
                    </div>

                    {targetUser.studentProfile?.careerGoal &&
                      !targetUser.studentProfile.careerGoal.startsWith("{") && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 italic pt-1 max-w-xl">
                          <strong>Career Goal:</strong> "{targetUser.studentProfile.careerGoal}"
                        </p>
                      )}

                    {targetUser.alumniProfile?.mentorshipDomains && targetUser.alumniProfile.mentorshipDomains.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 mr-1">
                          Domains:
                        </span>
                        {targetUser.alumniProfile.mentorshipDomains.map((domain) => (
                          <span
                            key={domain}
                            className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-900/40"
                          >
                            {domain}
                          </span>
                        ))}
                      </div>
                    )}

                    {((targetUser.studentProfile?.skills && targetUser.studentProfile.skills.length > 0) ||
                      (targetUser.alumniProfile?.skills && targetUser.alumniProfile.skills.length > 0)) && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {(targetUser.studentProfile?.skills || targetUser.alumniProfile?.skills || []).map((skill) => (
                          <span
                            key={skill}
                            className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="shrink-0 pt-2 sm:pt-0">
                  <Link
                    href={`/profile/${targetUser.uid}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-900 dark:text-white transition-colors"
                  >
                    <span>View Full Profile</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500 text-sm">
                Details could not be loaded.
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <ListTodo className="w-5 h-5 text-gray-900 dark:text-white" />
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                  Mentorship Milestones & Tasks
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                {isMentor
                  ? "Organize learning milestones and assign actionable tasks for your mentee."
                  : "Track milestones and complete assigned tasks from your mentor."}
              </p>
            </div>

            {isMentor && (
              <button
                type="button"
                onClick={() => setCreateSessionModalOpen(true)}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Milestone</span>
              </button>
            )}
          </div>

          {sessions.length > 0 && (
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 shadow-xs">
              <div className="flex items-center justify-between text-xs sm:text-sm font-semibold mb-2">
                <span className="text-gray-700 dark:text-gray-300">
                  Overall Completion ({completedTasks}/{totalTasks} Tasks)
                </span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                  {progressPercent}%
                </span>
              </div>
              <div className="w-full h-2.5 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}

          {loadingSessions ? (
            <div className="p-12 text-center text-gray-500 dark:text-gray-400 space-y-3 bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-gray-800">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-400" />
              <p className="text-sm font-medium">Loading milestones and tasks...</p>
            </div>
          ) : sessions.length === 0 ? (
            <div className="p-12 text-center space-y-4 bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-gray-800">
              <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-zinc-800 flex items-center justify-center mx-auto text-gray-400">
                <Layers className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                  No milestones created yet
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                  Create your first mentorship milestone (e.g., "Resume Review", "System Design Basics", "Mock Interview") and assign tasks to guide your mentee.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCreateSessionModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 rounded-xl text-xs sm:text-sm font-semibold hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Create First Milestone</span>
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {sessions.map((session, sIdx) => {
                const sTotal = session.tasks ? session.tasks.length : 0;
                const sCompleted = session.tasks
                  ? session.tasks.filter((t) => t.isCompleted).length
                  : 0;

                return (
                  <div
                    key={session.id}
                    className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-xs"
                  >
                    <div className="p-5 sm:p-6 border-b border-gray-100 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-50/50 dark:bg-zinc-900/50">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Milestone {sIdx + 1}
                          </span>
                          <span className="text-xs text-gray-400">•</span>
                          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                            {sCompleted}/{sTotal} completed
                          </span>
                        </div>
                        <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                          {session.title}
                        </h3>
                        {session.description && (
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {session.description}
                          </p>
                        )}
                      </div>

                      {isMentor && (
                        <button
                          type="button"
                          onClick={() => {
                            setActiveSessionId(session.id);
                            setCreateTaskModalOpen(true);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-900 dark:text-white text-xs font-semibold transition-colors cursor-pointer shrink-0 self-start sm:self-auto"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Task</span>
                        </button>
                      )}
                    </div>

                    <div className="p-5 sm:p-6">
                      {!session.tasks || session.tasks.length === 0 ? (
                        <div className="text-center py-6 text-xs text-gray-400 dark:text-gray-500 italic">
                          No tasks in this milestone yet.
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {session.tasks.map((task) => {
                            const isOverdue =
                              task.dueDate &&
                              !task.isCompleted &&
                              new Date(task.dueDate) < new Date();

                            return (
                              <div
                                key={task.id}
                                className={`p-4 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                                  task.isCompleted
                                    ? "bg-gray-50/50 dark:bg-zinc-950/30 border-gray-100 dark:border-zinc-800/80 opacity-75"
                                    : isOverdue
                                    ? "bg-rose-50/30 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/40"
                                    : "bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700"
                                }`}
                              >
                                <div className="flex items-start gap-3 min-w-0 flex-1">
                                  {isMentor ? (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleToggleTask(task.id, task.isCompleted)
                                      }
                                      className="mt-0.5 text-gray-400 hover:text-emerald-600 transition-colors cursor-pointer shrink-0"
                                      title={task.isCompleted ? "Mark incomplete" : "Mark as completed"}
                                    >
                                      {task.isCompleted ? (
                                        <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100 dark:fill-emerald-950" />
                                      ) : (
                                        <Circle className="w-5 h-5" />
                                      )}
                                    </button>
                                  ) : (
                                    <div
                                      className="mt-0.5 text-gray-400 shrink-0 cursor-default"
                                      title={
                                        task.isCompleted
                                          ? "Completed (Verified by mentor)"
                                          : "Pending completion by mentor"
                                      }
                                    >
                                      {task.isCompleted ? (
                                        <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100 dark:fill-emerald-950" />
                                      ) : (
                                        <Circle className="w-5 h-5 text-gray-300 dark:text-zinc-700" />
                                      )}
                                    </div>
                                  )}

                                  <div className="space-y-1 min-w-0 flex-1">
                                    <p
                                      className={`text-sm font-semibold leading-snug break-words ${
                                        task.isCompleted
                                          ? "line-through text-gray-400 dark:text-gray-500"
                                          : "text-gray-900 dark:text-white"
                                      }`}
                                    >
                                      {task.title}
                                    </p>

                                    {task.description && (
                                      <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                                        {task.description}
                                      </p>
                                    )}

                                    {task.dueDate && (
                                      <div className="flex items-center gap-1 text-[11px] pt-0.5">
                                        <Clock className="w-3 h-3 text-gray-400" />
                                        <span
                                          className={
                                            task.isCompleted
                                              ? "text-gray-400"
                                              : isOverdue
                                              ? "text-rose-600 dark:text-rose-400 font-bold"
                                              : "text-gray-500 dark:text-gray-400"
                                          }
                                        >
                                          Due:{" "}
                                          {new Date(task.dueDate).toLocaleDateString("en-US", {
                                            month: "short",
                                            day: "numeric",
                                            year: "numeric",
                                          })}
                                          {isOverdue && !task.isCompleted && " (Overdue)"}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {isMentor && (
                                  <div className="flex items-center gap-1 shrink-0 pt-0.5">
                                    <button
                                      type="button"
                                      onClick={() => openEditTaskModal(task)}
                                      className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                                      title="Edit Task"
                                    >
                                      <Pencil className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteTask(task.id)}
                                      className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                                      title="Delete Task"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>

        {createSessionModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-gray-800 w-full max-w-md overflow-hidden shadow-xl">
              <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-gray-900 dark:text-white text-base">
                  <Layers className="w-4 h-4 text-blue-600" />
                  <span>Add Mentorship Milestone</span>
                </div>
                <button
                  type="button"
                  onClick={() => setCreateSessionModalOpen(false)}
                  className="p-1 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateSession} className="p-5 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Milestone Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Month 1: Resume & Portfolio Review"
                    value={sessionTitle}
                    onChange={(e) => setSessionTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800/60 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Description (Optional)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Brief description of the milestone objectives..."
                    value={sessionDescription}
                    onChange={(e) => setSessionDescription(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800/60 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white resize-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setCreateSessionModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingSession || !sessionTitle.trim()}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                  >
                    {isSubmittingSession ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <span>Create Milestone</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {createTaskModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-gray-800 w-full max-w-md overflow-hidden shadow-xl">
              <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-gray-900 dark:text-white text-base">
                  <CheckSquare className="w-4 h-4 text-emerald-600" />
                  <span>Assign New Task</span>
                </div>
                <button
                  type="button"
                  onClick={() => setCreateTaskModalOpen(false)}
                  className="p-1 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateTask} className="p-5 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Task Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Update GitHub README and deployed project links"
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800/60 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Description (Optional)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Additional instructions or guidelines for this task..."
                    value={taskDescription}
                    onChange={(e) => setTaskDescription(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800/60 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Due Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={taskDueDate}
                    onChange={(e) => setTaskDueDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800/60 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setCreateTaskModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingTask || !taskTitle.trim()}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                  >
                    {isSubmittingTask ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <span>Assign Task</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {editTaskModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-gray-800 w-full max-w-md overflow-hidden shadow-xl">
              <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-gray-900 dark:text-white text-base">
                  <Pencil className="w-4 h-4 text-amber-600" />
                  <span>Edit Task</span>
                </div>
                <button
                  type="button"
                  onClick={() => setEditTaskModalOpen(false)}
                  className="p-1 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleUpdateTask} className="p-5 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Task Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editTaskTitle}
                    onChange={(e) => setEditTaskTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800/60 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Description (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={editTaskDescription}
                    onChange={(e) => setEditTaskDescription(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800/60 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Due Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={editTaskDueDate}
                    onChange={(e) => setEditTaskDueDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800/60 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditTaskModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdatingTask || !editTaskTitle.trim()}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                  >
                    {isUpdatingTask ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <span>Save Changes</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
