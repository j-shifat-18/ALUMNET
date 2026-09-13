"use client";

import { use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
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
import { useState } from "react";
import socket from "@/lib/socket";

export default function ConversationPage({ params }) {
  // params is a promise in Next.js 15+ when using the App Router
  const { conversationId } = use(params);
  const router = useRouter();

  const { dbUser } = useAuth();
  const { setTotalUnread } = useSocket();
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
      <div className="min-h-screen bg-gray-50 dark:bg-black/95">
        <Navbar />
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

            {/* Left sidebar — conversation list (hidden on mobile) */}
            <div className="hidden lg:block col-span-4 xl:col-span-3">
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800">
                  <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
                    Messages
                  </h2>
                </div>
                <ConversationList
                  conversations={conversations}
                  loading={convsLoading}
                  currentUserId={dbUser?.id}
                />
              </div>
            </div>

            {/* Main chat area */}
            <div className="col-span-12 lg:col-span-8 xl:col-span-9">
              <div
                className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs overflow-hidden flex flex-col"
                style={{ height: "calc(100vh - 9rem)" }}
              >
                {/* ── Header ─────────────────────────────────────────────── */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
                  {/* Mobile back button */}
                  <Link
                    href="/chat"
                    className="lg:hidden p-1.5 -ml-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  </Link>

                  {convLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                  ) : (
                    <>
                      {/* Avatar */}
                      <Link
                        href={participantUser ? `/profile/${participantUser.uid}` : "#"}
                        className="flex-shrink-0"
                      >
                        <div className="w-9 h-9 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                          {participantUser?.profileImage ? (
                            <Image
                              src={participantUser.profileImage}
                              alt={participantUser.name ?? "User"}
                              width={36}
                              height={36}
                              className="object-cover w-full h-full"
                            />
                          ) : (
                            <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">
                              {participantInitials}
                            </span>
                          )}
                        </div>
                      </Link>

                      {/* Name + status */}
                      <div className="flex-1 min-w-0">
                        <Link href={participantUser ? `/profile/${participantUser.uid}` : "#"}>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate hover:underline">
                            {participantUser?.name ?? "Unknown"}
                          </p>
                        </Link>
                        {participantUser && (
                          <OnlineStatus userId={participantUser.id} />
                        )}
                      </div>
                    </>
                  )}
                </div>

                {/* ── Error banner ────────────────────────────────────────── */}
                {msgError && (
                  <div className="px-4 py-2 bg-red-50 dark:bg-red-900/20 border-b border-red-100 dark:border-red-900/40 text-xs text-red-600 dark:text-red-400">
                    {msgError}
                  </div>
                )}

                {/* ── Messages ────────────────────────────────────────────── */}
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

                {/* ── Input ───────────────────────────────────────────────── */}
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
