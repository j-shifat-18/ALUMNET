"use client";

import ProtectedRoute from "@/components/layout/ProtectedRoute";
import Navbar from "@/components/layout/Navbar";
import ConversationList from "@/components/chat/ConversationList";
import { useChat } from "@/hooks/useChat";
import { useAuth } from "@/context/AuthProvider";
import { useSocket } from "@/context/SocketProvider";
import { useEffect } from "react";
import { MessageSquare } from "lucide-react";
import socket from "@/lib/socket";

export default function ChatPage() {
  const { dbUser } = useAuth();
  const { conversations, loading, handleIncomingMessage } = useChat();
  const { setTotalUnread } = useSocket();

  // Listen for incoming message_notification at the page level
  // to update unread counts in the conversation list
  useEffect(() => {
    function onMessageNotification({ conversationId, message }) {
      handleIncomingMessage(conversationId, message);
    }
    socket.on("message_notification", onMessageNotification);
    return () => socket.off("message_notification", onMessageNotification);
  }, [handleIncomingMessage]);

  // Clear global unread badge while on the chat page
  useEffect(() => {
    setTotalUnread(0);
  }, [setTotalUnread]);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-black/95">
        <Navbar />
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Conversation list — full width on mobile, left panel on desktop */}
            <div className="col-span-12 lg:col-span-4 xl:col-span-3">
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800">
                  <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
                    Messages
                  </h2>
                </div>
                <ConversationList
                  conversations={conversations}
                  loading={loading}
                  currentUserId={dbUser?.id}
                />
              </div>
            </div>

            {/* Empty state on desktop when no conversation is selected */}
            <div className="hidden lg:flex col-span-8 xl:col-span-9 items-center justify-center">
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs w-full h-[calc(100vh-10rem)] flex flex-col items-center justify-center gap-4 text-gray-400 dark:text-gray-600 select-none">
                <MessageSquare className="w-12 h-12 opacity-30" />
                <div className="text-center">
                  <p className="font-medium text-gray-500 dark:text-gray-400">
                    Select a conversation
                  </p>
                  <p className="text-sm mt-1">
                    Choose from your existing conversations or start a new one
                    from a user's profile.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
