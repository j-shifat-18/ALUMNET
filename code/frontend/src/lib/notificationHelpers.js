/**
 * Notification Helper Functions
 */

export function parseNotificationData(data) {
  if (!data) return {};
  if (typeof data === "string") {
    try {
      return JSON.parse(data);
    } catch {
      return {};
    }
  }
  return data;
}

export function getNotificationLink(notification) {
  if (!notification) return "/notifications";
  const { type, data } = notification;
  const parsed = parseNotificationData(data);

  switch (type) {
    case "MESSAGE":
      return parsed.conversationId ? `/chat/${parsed.conversationId}` : "/chat";
    case "MENTOR_REQUEST":
      return "/mentorship?tab=REQUESTS";
    case "MENTOR_REQUEST_ACCEPTED":
      return "/mentorship?tab=MENTORS";
    case "POST_LIKE":
      return parsed.postId
        ? `/?postId=${parsed.postId}#post-${parsed.postId}`
        : "/";
    case "POST_COMMENT":
      return parsed.postId
        ? `/?postId=${parsed.postId}&openComments=true#post-${parsed.postId}`
        : "/";
    case "EVENT_CREATED":
      return parsed.eventId ? `/events/${parsed.eventId}` : "/events";
    case "SYSTEM":
    default:
      return "/notifications";
  }
}

export function formatRelativeTime(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const now = new Date();
  const diffSec = Math.floor((now - date) / 1000);

  if (diffSec < 45) return "Just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  if (date.getFullYear() === now.getFullYear()) {
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  }
  return date.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
}
