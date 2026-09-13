"use client";

import ProtectedRoute from "@/components/layout/ProtectedRoute";
import Navbar from "@/components/layout/Navbar";
import ConversationList from "@/components/chat/ConversationList";
import { useChat } from "@/hooks/useChat";
import { useAuth } from "@/context/AuthProvider";
import { useSocket } from "@/context/SocketProvider";
import { useEffect } from "react";
import { MessageSquare, Sparkles, ShieldCheck, Zap } from "lucide-react";
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
      <div className="h-screen bg-gray-50/50 dark:bg-black/95 flex flex-col overflow-hidden">
        <Navbar />
        <main className="container mx-auto px-2 sm:px-4 lg:px-8 xl:px-12 2xl:px-16 py-3 sm:py-4 flex-1 flex flex-col min-h-0 overflow-hidden">
          {/* Unified Chat Window Container */}
          <div className="bg-white dark:bg-gray-900/90 rounded-2xl border border-gray-200/80 dark:border-gray-800/80 shadow-sm overflow-hidden flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-0 h-full">
            
            {/* Left sidebar — Conversation List */}
            <div className="col-span-12 lg:col-span-4 xl:col-span-4 2xl:col-span-3.5 border-r border-gray-200/80 dark:border-gray-800/80 flex flex-col h-full min-h-0 overflow-hidden bg-white dark:bg-gray-900">
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
                  loading={loading}
                  currentUserId={dbUser?.id}
                />
              </div>
            </div>

            {/* Right empty state on desktop when no conversation is selected */}
            <div className="hidden lg:flex col-span-8 xl:col-span-8 2xl:col-span-8.5 flex-col items-center justify-center h-full min-h-0 bg-gray-50/40 dark:bg-black/20 relative p-8 select-none">
              <div className="relative z-10 flex flex-col items-center text-center max-w-sm space-y-4">
                <div className="relative">
                  <div className="w-20 h-20 rounded-3xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 flex items-center justify-center shadow-md">
                    <MessageSquare className="w-10 h-10 stroke-[1.5]" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-sm">
                    <Zap className="w-4 h-4 fill-white" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    Your Messages
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                    Select a conversation from the sidebar or visit any user's profile to start a new direct message.
                  </p>
                </div>

                <div className="pt-2 flex flex-wrap justify-center gap-2 text-[11px] text-gray-400 dark:text-gray-500">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-800/80 border border-gray-200/60 dark:border-gray-700/60">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> End-to-End Real-Time
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-800/80 border border-gray-200/60 dark:border-gray-700/60">
                    <Sparkles className="w-3.5 h-3.5 text-blue-500" /> Instant Alerts
                  </span>
                </div>
              </div>
            </div>

          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}


