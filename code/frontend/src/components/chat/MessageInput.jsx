"use client";

import { useState, useRef, useCallback } from "react";
import { Send } from "lucide-react";

/**
 * MessageInput
 *
 * Props:
 *   onSend(content: string)  — called when the user submits a message
 *   onTyping()               — called on every keystroke (debounced by useMessages)
 *   onStopTyping()           — called when the user clears or submits
 *   disabled                 — boolean, disables the input
 */
export default function MessageInput({ onSend, onTyping, onStopTyping, disabled }) {
  const [content, setContent] = useState("");
  const textareaRef = useRef(null);

  const handleSend = useCallback(() => {
    const trimmed = content.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setContent("");
    onStopTyping?.();
    // Resize textarea back to 1 row
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }, [content, disabled, onSend, onStopTyping]);

  const handleKeyDown = (e) => {
    // Send on Enter (no shift)
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChange = (e) => {
    const val = e.target.value;
    if (val.length > 2000) return; // enforce limit
    setContent(val);
    onTyping?.();

    // Auto-grow textarea up to ~6 lines
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = "auto";
      ta.style.height = Math.min(ta.scrollHeight, 144) + "px";
    }
  };

  const remaining = 2000 - content.length;

  return (
    <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      <div className="flex items-end gap-2">
        {/* Textarea */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            rows={1}
            placeholder="Type a message…"
            className="w-full resize-none overflow-hidden px-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-400 dark:focus:ring-gray-500 transition disabled:opacity-50 disabled:cursor-not-allowed leading-relaxed"
            style={{ maxHeight: "144px" }}
          />
          {/* Character counter — shown only when close to limit */}
          {remaining < 200 && (
            <span
              className={`absolute bottom-2 right-3 text-[10px] pointer-events-none ${
                remaining < 50 ? "text-red-400" : "text-gray-400"
              }`}
            >
              {remaining}
            </span>
          )}
        </div>

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={!content.trim() || disabled}
          className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-2xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:opacity-90 transition disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Send message"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

      <p className="mt-1.5 text-[10px] text-gray-400 dark:text-gray-600 pl-1">
        Enter to send · Shift + Enter for new line
      </p>
    </div>
  );
}
