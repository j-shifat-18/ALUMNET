"use client";

/**
 * TypingIndicator
 *
 * Renders an animated "… is typing" indicator.
 * typingUsers is a Set of userIds. We show the first name if available.
 */
export default function TypingIndicator({ typingUsers, participants }) {
  if (!typingUsers || typingUsers.size === 0) return null;

  // Resolve the first typing user's name if we have participants
  let label = "Someone is typing";
  if (participants) {
    const typingId = [...typingUsers][0];
    const p = participants.find((m) => m.userId === typingId);
    if (p?.user?.name) {
      label = `${p.user.name.split(" ")[0]} is typing`;
    }
  }

  return (
    <div className="flex items-center gap-2 px-4 py-1 text-xs text-gray-400 dark:text-gray-500">
      <span>{label}</span>
      {/* Animated three dots */}
      <span className="flex gap-0.5 items-end">
        <span
          className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"
          style={{ animationDelay: "0ms" }}
        />
        <span
          className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"
          style={{ animationDelay: "150ms" }}
        />
        <span
          className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"
          style={{ animationDelay: "300ms" }}
        />
      </span>
    </div>
  );
}
