"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
  Sparkles,
} from "lucide-react";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const WEEKDAY_NAMES = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export default function DatePicker({
  value = "",
  onChange,
  placeholder = "Select deadline date",
  minDate = null,
  disabled = false,
  className = "",
}) {
  const containerRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);

  // Parse current value (expected format: "YYYY-MM-DD")
  const parsedValue = useMemo(() => {
    if (!value || typeof value !== "string") return null;
    const parts = value.split("-");
    if (parts.length < 3) return null;
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    if (isNaN(year) || isNaN(month) || isNaN(day)) return null;
    return { year, month, day };
  }, [value]);

  const today = useMemo(() => new Date(), []);
  const todayYear = today.getFullYear();
  const todayMonth = today.getMonth();
  const todayDay = today.getDate();
  const todayStr = `${todayYear}-${String(todayMonth + 1).padStart(2, "0")}-${String(todayDay).padStart(2, "0")}`;

  const [navYear, setNavYear] = useState(null);
  const [navMonth, setNavMonth] = useState(null);

  const viewYear = navYear ?? (parsedValue?.year || todayYear);
  const viewMonth = navMonth ?? (parsedValue?.month ?? todayMonth);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        setNavYear(null);
        setNavMonth(null);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Format label for the trigger button
  const displayLabel = useMemo(() => {
    if (!parsedValue) return "";
    const dateObj = new Date(parsedValue.year, parsedValue.month, parsedValue.day);
    return dateObj.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }, [parsedValue]);

  const handlePrevMonth = (e) => {
    e.stopPropagation();
    if (viewMonth === 0) {
      setNavMonth(11);
      setNavYear(viewYear - 1);
    } else {
      setNavMonth(viewMonth - 1);
      setNavYear(viewYear);
    }
  };

  const handleNextMonth = (e) => {
    e.stopPropagation();
    if (viewMonth === 11) {
      setNavMonth(0);
      setNavYear(viewYear + 1);
    } else {
      setNavMonth(viewMonth + 1);
      setNavYear(viewYear);
    }
  };

  const handleSelectDay = (dayNum, isCurrentMonth, targetMonth, targetYear) => {
    const monthFormatted = String(targetMonth + 1).padStart(2, "0");
    const dayFormatted = String(dayNum).padStart(2, "0");
    const dateStr = `${targetYear}-${monthFormatted}-${dayFormatted}`;

    if (minDate && dateStr < minDate) {
      return;
    }

    onChange?.(dateStr);
    setIsOpen(false);
    setNavYear(null);
    setNavMonth(null);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange?.("");
    setNavYear(null);
    setNavMonth(null);
  };

  const handleQuickPreset = (daysToAdd) => {
    const target = new Date();
    target.setDate(target.getDate() + daysToAdd);
    const y = target.getFullYear();
    const m = String(target.getMonth() + 1).padStart(2, "0");
    const d = String(target.getDate()).padStart(2, "0");
    const dateStr = `${y}-${m}-${d}`;
    onChange?.(dateStr);
    setIsOpen(false);
    setNavYear(null);
    setNavMonth(null);
  };

  // Calendar Days Grid Construction
  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay(); // 0 for Sunday
    const daysInCurrentMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

    const days = [];

    // Previous month padding days
    const prevMonth = viewMonth === 0 ? 11 : viewMonth - 1;
    const prevYear = viewMonth === 0 ? viewYear - 1 : viewYear;
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      const dateStr = `${prevYear}-${String(prevMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      days.push({
        day: d,
        month: prevMonth,
        year: prevYear,
        dateStr,
        isCurrentMonth: false,
        isDisabled: Boolean(minDate && dateStr < minDate),
      });
    }

    // Current month days
    for (let d = 1; d <= daysInCurrentMonth; d++) {
      const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      days.push({
        day: d,
        month: viewMonth,
        year: viewYear,
        dateStr,
        isCurrentMonth: true,
        isDisabled: Boolean(minDate && dateStr < minDate),
      });
    }

    // Next month padding days to complete 35 or 42 grid cells
    const remaining = (7 - (days.length % 7)) % 7;
    const nextMonth = viewMonth === 11 ? 0 : viewMonth + 1;
    const nextYear = viewMonth === 11 ? viewYear + 1 : viewYear;
    for (let d = 1; d <= remaining; d++) {
      const dateStr = `${nextYear}-${String(nextMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      days.push({
        day: d,
        month: nextMonth,
        year: nextYear,
        dateStr,
        isCurrentMonth: false,
        isDisabled: Boolean(minDate && dateStr < minDate),
      });
    }

    return days;
  }, [viewYear, viewMonth, minDate]);

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          if (!disabled) setIsOpen((prev) => !prev);
        }}
        className={`w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl border text-sm text-left transition-all ${
          isOpen
            ? "border-blue-600 dark:border-blue-500 ring-2 ring-blue-500/20"
            : "border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700"
        } ${
          disabled
            ? "opacity-50 cursor-not-allowed bg-gray-50 dark:bg-gray-900"
            : "bg-white dark:bg-black cursor-pointer"
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <CalendarIcon className="w-4 h-4 text-gray-400 shrink-0" />
          {displayLabel ? (
            <span className="font-semibold text-gray-900 dark:text-gray-100 truncate">
              {displayLabel}
            </span>
          ) : (
            <span className="text-gray-400 truncate">{placeholder}</span>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {displayLabel && !disabled && (
            <span
              role="button"
              tabIndex={0}
              onClick={handleClear}
              className="p-1 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="Clear date"
            >
              <X className="w-3.5 h-3.5" />
            </span>
          )}
          <ChevronDown
            className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
              isOpen ? "rotate-180 text-blue-600 dark:text-blue-400" : ""
            }`}
          />
        </div>
      </button>

      {/* Calendar Popover */}
      {isOpen && (
        <div className="absolute left-0 sm:left-auto sm:right-0 top-full mt-1.5 z-50 w-72 sm:w-80 p-3.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl animate-in fade-in-0 zoom-in-95 duration-150">
          {/* Header Month / Year Navigation */}
          <div className="flex items-center justify-between pb-3 mb-2 border-b border-gray-100 dark:border-zinc-800">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-gray-900 dark:text-white transition-colors cursor-pointer"
              title="Previous month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="font-bold text-sm text-gray-900 dark:text-white">
              {MONTH_NAMES[viewMonth]} {viewYear}
            </div>

            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-gray-900 dark:text-white transition-colors cursor-pointer"
              title="Next month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Weekday Names */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {WEEKDAY_NAMES.map((w) => (
              <span
                key={w}
                className="text-[11px] font-bold text-gray-400 dark:text-gray-500 py-1"
              >
                {w}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((cell) => {
              const isSelected = value === cell.dateStr;
              const isToday = cell.dateStr === todayStr;

              return (
                <button
                  key={cell.dateStr}
                  type="button"
                  disabled={cell.isDisabled}
                  onClick={() =>
                    handleSelectDay(
                      cell.day,
                      cell.isCurrentMonth,
                      cell.month,
                      cell.year
                    )
                  }
                  className={`h-8 w-8 mx-auto flex items-center justify-center text-xs rounded-xl font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? "bg-blue-600 text-white shadow-sm font-bold scale-105"
                      : isToday
                      ? "border border-blue-500/60 text-blue-600 dark:text-blue-400 font-bold hover:bg-blue-50 dark:hover:bg-blue-950/40"
                      : cell.isDisabled
                      ? "text-gray-300 dark:text-gray-700 opacity-40 cursor-not-allowed"
                      : cell.isCurrentMonth
                      ? "text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-800"
                      : "text-gray-400 dark:text-gray-600 hover:bg-gray-50 dark:hover:bg-zinc-800/50"
                  }`}
                >
                  {cell.day}
                </button>
              );
            })}
          </div>

          {/* Quick Presets for Job Deadlines */}
          <div className="mt-3 pt-2.5 border-t border-gray-100 dark:border-zinc-800 flex items-center justify-between gap-1.5 flex-wrap">
            <span className="text-[10px] uppercase font-bold text-gray-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" /> Quick Set:
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => handleQuickPreset(7)}
                className="px-2 py-0.5 rounded-lg text-[11px] font-bold bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-gray-700 dark:text-gray-300 transition-colors cursor-pointer"
              >
                1 Week
              </button>
              <button
                type="button"
                onClick={() => handleQuickPreset(14)}
                className="px-2 py-0.5 rounded-lg text-[11px] font-bold bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-gray-700 dark:text-gray-300 transition-colors cursor-pointer"
              >
                2 Weeks
              </button>
              <button
                type="button"
                onClick={() => handleQuickPreset(30)}
                className="px-2 py-0.5 rounded-lg text-[11px] font-bold bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-gray-700 dark:text-gray-300 transition-colors cursor-pointer"
              >
                1 Month
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
