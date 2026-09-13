"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Send, Smile } from "lucide-react";

const QUICK_EMOJIS = ["👋", "👍", "❤️", "😊", "🎉", "🔥", "🎓", "🤝", "🙏", "🚀"];

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
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const textareaRef = useRef(null);
  const emojiPickerRef = useRef(null);

  const handleSend = useCallback(() => {
    const trimmed = content.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setContent("");
    setShowEmojiPicker(false);
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

    // Auto-grow textarea up to ~5 lines
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = "auto";
      ta.style.height = Math.min(ta.scrollHeight, 120) + "px";
    }
  };

  const handleInsertEmoji = (emoji) => {
    setContent((prev) => prev + emoji);
    onTyping?.();
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  // Close emoji picker when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(e.target)
      ) {
        setShowEmojiPicker(false);
      }
    }
    if (showEmojiPicker) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showEmojiPicker]);

  const remaining = 2000 - content.length;
  const canSend = content.trim().length > 0 && !disabled;

  return (
    <div className="relative px-4 py-3 border-t border-gray-200/80 dark:border-gray-800/80 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md">
      {/* Quick Emoji Bar Popup */}
      {showEmojiPicker && (
        <div
          ref={emojiPickerRef}
          className="absolute bottom-16 left-4 z-20 flex items-center gap-1.5 p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg animate-in fade-in zoom-in-95 duration-150"
        >
          {QUICK_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => handleInsertEmoji(emoji)}
              className="p-1.5 text-base hover:bg-gray-100 dark:hover:bg-gray-700/80 rounded-xl transition hover:scale-110 active:scale-95"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      <div className="flex items-end gap-2">
        {/* Input Wrapper */}
        <div className="flex-1 flex items-end bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700/80 rounded-2xl focus-within:border-gray-400 dark:focus-within:border-gray-500 focus-within:ring-2 focus-within:ring-gray-200 dark:focus-within:ring-gray-700/50 transition-all px-3 py-1.5">
          {/* Emoji Trigger */}
          <button
            type="button"
            onClick={() => setShowEmojiPicker((prev) => !prev)}
            disabled={disabled}
            className={`p-1.5 rounded-xl transition-colors shrink-0 mb-0.5 ${
              showEmojiPicker
                ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40"
                : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-200/60 dark:hover:bg-gray-700"
            }`}
            title="Add emoji"
          >
            <Smile className="w-5 h-5" />
          </button>

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            rows={1}
            placeholder="Type a message…"
            className="w-full resize-none bg-transparent px-2.5 py-1.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none transition leading-relaxed disabled:opacity-50 disabled:cursor-not-allowed max-h-[120px] scrollbar-none"
          />

          {/* Character counter */}
          {remaining < 200 && (
            <span
              className={`text-[10px] font-mono px-1 self-center shrink-0 ${
                remaining < 50
                  ? "text-red-500 font-bold"
                  : "text-gray-400 dark:text-gray-500"
              }`}
            >
              {remaining}
            </span>
          )}
        </div>

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={!canSend}
          className={`flex-shrink-0 w-11 h-11 flex items-center justify-center rounded-2xl transition-all duration-200 ${
            canSend
              ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 hover:scale-105 active:scale-95 shadow-sm"
              : "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed"
          }`}
          aria-label="Send message"
        >
          <Send className={`w-4 h-4 transition-transform ${canSend ? "translate-x-0.5" : ""}`} />
        </button>
      </div>

      <div className="flex items-center justify-between mt-1 px-1 text-[11px] text-gray-400 dark:text-gray-500 select-none">
        <span>Press <kbd className="font-sans px-1 py-0.5 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-[10px]">Enter</kbd> to send</span>
        <span><kbd className="font-sans px-1 py-0.5 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-[10px]">Shift + Enter</kbd> for new line</span>
      </div>
    </div>
  );
}

