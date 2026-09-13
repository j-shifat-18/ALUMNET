"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, MessageSquare, User, ExternalLink } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import Navbar from "@/components/layout/Navbar";
import ConversationList from "@/components/chat/ConversationList";
import MessageList from "@/components/chat/MessageList";
import MessageInput from "@/components/chat/MessageInput";
import OnlineStatus from "@/components/chat/OnlineStatus";
import { useAuth } from "@/context/AuthProvider";
import { useSocket } from "@/context/SocketProvider";
import { useChat } from "@/hooks/useChat";
import { useMessages } from "@/hooks/useMessages";
import axiosInstance from "@/lib/axios";
import socket from "@/lib/socket";

export default function ConversationPage({ params }) {
  // params is a promise in Next.js 15+ when using the App Router
  const { conversationId } = use(params);
  const router = useRouter();

  const { dbUser } = useAuth();
  const { setTotalUnread, onlineUsers } = useSocket();
  const {
    conversations,
    loading: convsLoading,
    handleIncomingMessage,
  } = useChat();

  // Single conversation detail (members, participant info)
  const [conversation, setConversation] = useState(null);
  const [convLoading, setConvLoading] = useState(true);

  // Load the conversation detail once
  useEffect(() => {
    if (!conversationId) return;
    setConvLoading(true);
    axiosInstance
      .get(`/api/v1/conversations/${conversationId}`)
      .then((res) => setConversation(res.data.data))
      .catch(() => router.push("/chat"))
      .finally(() => setConvLoading(false));
  }, [conversationId, router]);

  // Messages hook — handles socket room join/leave + real-time events
  const {
    messages,
    loading: msgsLoading,
    loadingMore,
    hasMore,
    error: msgError,
    typingUsers,
    sendMessage,
    loadMore,
    notifyTyping,
    stopTyping,
    markRead,
  } = useMessages({
    conversationId,
    currentUserId: dbUser?.id,
  });

  // Mark as read whenever this conversation is open
  useEffect(() => {
    if (!conversationId || !dbUser) return;
    markRead();
    setTotalUnread(0);
    axiosInstance
      .patch(`/api/v1/conversations/${conversationId}/read`)
      .catch(() => {});
  }, [conversationId, dbUser, markRead, setTotalUnread]);

  // Bubble up incoming message_notification so the ConversationList stays fresh
  useEffect(() => {
    function onMessageNotification({ conversationId: cid, message }) {
      handleIncomingMessage(cid, message);
    }
    socket.on("message_notification", onMessageNotification);
    return () => socket.off("message_notification", onMessageNotification);
  }, [handleIncomingMessage]);

  // Resolve the other participant from the conversation members
  const participant = conversation?.members?.find(
    (m) => m.userId !== dbUser?.id,
  );

  const participantUser = participant?.user;
  const isParticipantOnline = participantUser ? onlineUsers.has(Number(participantUser.id)) : false;
  const isParticipantTyping = participantUser ? typingUsers.has(Number(participantUser.id)) : false;
  const participantFirstName = participantUser?.name ? participantUser.name.split(" ")[0] : "User";

  const participantInitials = participantUser?.name
    ? participantUser.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  return (
    <ProtectedRoute>
      <div className="h-screen bg-gray-50/50 dark:bg-black/95 flex flex-col overflow-hidden">
        <Navbar />
        <main className="container mx-auto px-2 sm:px-4 lg:px-8 xl:px-12 2xl:px-16 py-3 sm:py-4 flex-1 flex flex-col min-h-0 overflow-hidden">
          {/* Unified Chat Window Container */}
          <div className="bg-white dark:bg-gray-900/90 rounded-2xl border border-gray-200/80 dark:border-gray-800/80 shadow-sm overflow-hidden flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-0 h-full">
            
            {/* Left sidebar — conversation list (hidden on mobile when viewing a thread) */}
            <div className="hidden lg:flex col-span-4 xl:col-span-4 2xl:col-span-3.5 border-r border-gray-200/80 dark:border-gray-800/80 flex-col h-full min-h-0 overflow-hidden bg-white dark:bg-gray-900">
              <div className="px-4 py-3.5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 flex items-center justify-center shadow-xs">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <h2 className="text-base font-bold text-gray-900 dark:text-white">
                    Messages
                  </h2>
                </div>
                {conversations.length > 0 && (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                    {conversations.length}
                  </span>
                )}
              </div>
              <div className="flex-1 min-h-0 overflow-hidden">
                <ConversationList
                  conversations={conversations}
                  loading={convsLoading}
                  currentUserId={dbUser?.id}
                />
              </div>
            </div>

            {/* Main chat area */}
            <div className="col-span-12 lg:col-span-8 xl:col-span-8 2xl:col-span-8.5 flex flex-col h-full min-h-0 overflow-hidden bg-white dark:bg-gray-900">
              {/* ── Header ─────────────────────────────────────────────── */}
              <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-gray-200/80 dark:border-gray-800/80 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md flex-shrink-0 z-10">
                <div className="flex items-center gap-3 min-w-0">
                  {/* Mobile back button */}
                  <Link
                    href="/chat"
                    className="lg:hidden p-2 -ml-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors"
                    aria-label="Back to messages"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </Link>

                  {convLoading ? (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-800 animate-pulse" />
                      <div className="space-y-1.5">
                        <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-28 animate-pulse" />
                        <div className="h-3 bg-gray-100 dark:bg-gray-800/60 rounded w-16 animate-pulse" />
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Avatar */}
                      <Link
                        href={participantUser ? `/profile/${participantUser.uid}` : "#"}
                        className="relative flex-shrink-0 group"
                      >
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center border border-gray-200/80 dark:border-gray-700 shadow-2xs group-hover:opacity-90 transition">
                          {participantUser?.profileImage ? (
                            <Image
                              src={participantUser.profileImage}
                              alt={participantUser.name ?? "User"}
                              width={40}
                              height={40}
                              className="object-cover w-full h-full"
                            />
                          ) : (
                            <span className="text-sm font-bold text-gray-700 dark:text-gray-200">
                              {participantInitials}
                            </span>
                          )}
                        </div>
                        {isParticipantOnline && (
                          <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-gray-900 rounded-full ring-1 ring-emerald-400" />
                        )}
                      </Link>

                      {/* Name + Status + Role */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <Link href={participantUser ? `/profile/${participantUser.uid}` : "#"}>
                            <p className="text-sm font-bold text-gray-900 dark:text-white truncate hover:underline">
                              {participantUser?.name ?? "Unknown"}
                            </p>
                          </Link>
                          {participantUser?.role && (
                            <span
                              className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase shrink-0 ${
                                participantUser.role.toUpperCase() === "ALUMNI"
                                  ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60"
                                  : "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60"
                              }`}
                            >
                              {participantUser.role}
                            </span>
                          )}
                        </div>
                        {participantUser && (
                          isParticipantTyping ? (
                            <div className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 font-medium select-none mt-0.5 animate-in fade-in duration-150">
                              <span>{participantFirstName} is typing</span>
                              <span className="inline-flex items-center gap-0.5 ml-0.5">
                                <span
                                  className="w-1 h-1 bg-blue-600 dark:bg-blue-400 rounded-full animate-bounce"
                                  style={{ animationDelay: "0ms", animationDuration: "0.8s" }}
                                />
                                <span
                                  className="w-1 h-1 bg-blue-600 dark:bg-blue-400 rounded-full animate-bounce"
                                  style={{ animationDelay: "150ms", animationDuration: "0.8s" }}
                                />
                                <span
                                  className="w-1 h-1 bg-blue-600 dark:bg-blue-400 rounded-full animate-bounce"
                                  style={{ animationDelay: "300ms", animationDuration: "0.8s" }}
                                />
                              </span>
                            </div>
                          ) : (
                            <OnlineStatus userId={participantUser.id} className="mt-0.5" />
                          )
                        )}
                      </div>
                    </>
                  )}
                </div>

                {/* Header Action: View Profile */}
                {participantUser && !convLoading && (
                  <Link
                    href={`/profile/${participantUser.uid}`}
                    className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800/80 hover:bg-gray-200/80 dark:hover:bg-gray-700 border border-gray-200/60 dark:border-gray-700/60 rounded-xl transition shadow-2xs shrink-0"
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>View Profile</span>
                  </Link>
                )}
              </div>

              {/* ── Error banner ────────────────────────────────────────── */}
              {msgError && (
                <div className="px-4 py-2 bg-red-50 dark:bg-red-900/20 border-b border-red-100 dark:border-red-900/40 text-xs text-red-600 dark:text-red-400 flex-shrink-0">
                  {msgError}
                </div>
              )}

              {/* ── Messages ────────────────────────────────────────────── */}
              <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
                <MessageList
                  messages={messages}
                  loading={msgsLoading}
                  loadingMore={loadingMore}
                  hasMore={hasMore}
                  currentUserId={dbUser?.id}
                  typingUsers={typingUsers}
                  members={conversation?.members}
                  onLoadMore={loadMore}
                />
              </div>

              {/* ── Input ───────────────────────────────────────────────── */}
              <div className="flex-shrink-0">
                <MessageInput
                  onSend={sendMessage}
                  onTyping={notifyTyping}
                  onStopTyping={stopTyping}
                  disabled={convLoading || msgsLoading}
                />
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}


