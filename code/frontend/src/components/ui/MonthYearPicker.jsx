"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { Calendar, ChevronLeft, ChevronRight, ChevronDown, X } from "lucide-react";

const MONTHS = [
  { short: "Jan", full: "January", num: "01", index: 0 },
  { short: "Feb", full: "February", num: "02", index: 1 },
  { short: "Mar", full: "March", num: "03", index: 2 },
  { short: "Apr", full: "April", num: "04", index: 3 },
  { short: "May", full: "May", num: "05", index: 4 },
  { short: "Jun", full: "June", num: "06", index: 5 },
  { short: "Jul", full: "July", num: "07", index: 6 },
  { short: "Aug", full: "August", num: "08", index: 7 },
  { short: "Sep", full: "September", num: "09", index: 8 },
  { short: "Oct", full: "October", num: "10", index: 9 },
  { short: "Nov", full: "November", num: "11", index: 10 },
  { short: "Dec", full: "December", num: "12", index: 11 },
];

export default function MonthYearPicker({
  value = "",
  onChange,
  placeholder = "Select month & year",
  minDate = null,
  maxDate = null,
  disabled = false,
  className = "",
}) {
  const containerRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [viewMode, setViewMode] = useState("months");

  const selectedYear = useMemo(() => {
    if (!value || typeof value !== "string") return null;
    const [y] = value.split("-");
    const num = parseInt(y, 10);
    return isNaN(num) ? null : num;
  }, [value]);

  const selectedMonthIndex = useMemo(() => {
    if (!value || typeof value !== "string") return null;
    const parts = value.split("-");
    if (parts.length < 2) return null;
    const num = parseInt(parts[1], 10);
    return isNaN(num) ? null : num - 1;
  }, [value]);

  const currentYearNow = new Date().getFullYear();
  const currentMonthNow = new Date().getMonth();

  const [viewYear, setViewYear] = useState(() => selectedYear || currentYearNow);

  const [decadeStart, setDecadeStart] = useState(() => {
    const yr = selectedYear || currentYearNow;
    return Math.floor(yr / 12) * 12;
  });

  useEffect(() => {
    if (selectedYear) {
      setViewYear(selectedYear);
      setDecadeStart(Math.floor(selectedYear / 12) * 12);
    }
  }, [selectedYear]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        setViewMode("months");
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const displayLabel = useMemo(() => {
    if (selectedYear !== null && selectedMonthIndex !== null && MONTHS[selectedMonthIndex]) {
      return `${MONTHS[selectedMonthIndex].full} ${selectedYear}`;
    }
    return "";
  }, [selectedYear, selectedMonthIndex]);

  const handlePrev = (e) => {
    e.stopPropagation();
    if (viewMode === "months") {
      setViewYear((prev) => prev - 1);
    } else {
      setDecadeStart((prev) => prev - 12);
    }
  };

  const handleNext = (e) => {
    e.stopPropagation();
    if (viewMode === "months") {
      setViewYear((prev) => prev + 1);
    } else {
      setDecadeStart((prev) => prev + 12);
    }
  };

  const handleSelectMonth = (month) => {
    const formatted = `${viewYear}-${month.num}`;
    onChange?.(formatted);
    setIsOpen(false);
    setViewMode("months");
  };

  const handleSelectYear = (yr) => {
    setViewYear(yr);
    setViewMode("months");
  };

  const isMonthDisabled = (monthIndex) => {
    const monthNum = String(monthIndex + 1).padStart(2, "0");
    const currentStr = `${viewYear}-${monthNum}`;
    if (minDate && currentStr < minDate) return true;
    if (maxDate && currentStr > maxDate) return true;
    return false;
  };

  const isYearDisabled = (yr) => {
    if (minDate) {
      const minY = parseInt(minDate.split("-")[0], 10);
      if (yr < minY) return true;
    }
    if (maxDate) {
      const maxY = parseInt(maxDate.split("-")[0], 10);
      if (yr > maxY) return true;
    }
    return false;
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange?.("");
  };

  const yearsInDecade = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 12; i++) {
      arr.push(decadeStart + i);
    }
    return arr;
  }, [decadeStart]);

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          if (!disabled) {
            setIsOpen((prev) => !prev);
            setViewMode("months");
          }
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
          <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
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
        <div className="absolute left-0 top-full mt-1.5 z-50 w-72 sm:w-80 p-3.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl animate-in fade-in-0 zoom-in-95 duration-150">
          {/* Calendar Header */}
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100 dark:border-gray-800">
            <button
              type="button"
              onClick={handlePrev}
              className="p-1.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer"
              title={viewMode === "months" ? "Previous year" : "Previous decade"}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() =>
                setViewMode((prev) => (prev === "months" ? "years" : "months"))
              }
              className="px-2.5 py-1 rounded-lg font-bold text-sm text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <span>
                {viewMode === "months"
                  ? viewYear
                  : `${decadeStart} – ${decadeStart + 11}`}
              </span>
              <span className="text-[10px] text-blue-600 dark:text-blue-400 uppercase font-semibold">
                {viewMode === "months" ? "Change" : "Months"}
              </span>
            </button>

            <button
              type="button"
              onClick={handleNext}
              className="p-1.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer"
              title={viewMode === "months" ? "Next year" : "Next decade"}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Month Selection Grid */}
          {viewMode === "months" ? (
            <div className="grid grid-cols-3 gap-2">
              {MONTHS.map((m) => {
                const isSelected =
                  selectedYear === viewYear && selectedMonthIndex === m.index;
                const isCurrent =
                  currentYearNow === viewYear && currentMonthNow === m.index;
                const isDisabled = isMonthDisabled(m.index);

                return (
                  <button
                    key={m.num}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => handleSelectMonth(m)}
                    className={`py-2 px-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? "bg-blue-600 text-white shadow-md shadow-blue-500/20 font-bold"
                        : isCurrent
                        ? "border border-blue-500/50 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/30 hover:bg-blue-100 dark:hover:bg-blue-950/60"
                        : isDisabled
                        ? "text-gray-300 dark:text-gray-600 cursor-not-allowed bg-transparent"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                  >
                    <span>{m.short}</span>
                  </button>
                );
              })}
            </div>
          ) : (
            /* Year Selection Grid */
            <div className="grid grid-cols-3 gap-2 max-h-56 overflow-y-auto">
              {yearsInDecade.map((yr) => {
                const isSelected = selectedYear === yr;
                const isCurrent = currentYearNow === yr;
                const isDisabled = isYearDisabled(yr);

                return (
                  <button
                    key={yr}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => handleSelectYear(yr)}
                    className={`py-2 px-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? "bg-blue-600 text-white shadow-md shadow-blue-500/20 font-bold"
                        : isCurrent
                        ? "border border-blue-500/50 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/30 hover:bg-blue-100 dark:hover:bg-blue-950/60"
                        : isDisabled
                        ? "text-gray-300 dark:text-gray-600 cursor-not-allowed bg-transparent"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                  >
                    <span>{yr}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Quick Action Footer: Today */}
          <div className="pt-3 mt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-[11px]">
            <button
              type="button"
              onClick={() => {
                const m = MONTHS[currentMonthNow];
                const formatted = `${currentYearNow}-${m.num}`;
                onChange?.(formatted);
                setIsOpen(false);
                setViewMode("months");
              }}
              className="text-blue-600 dark:text-blue-400 font-semibold hover:underline cursor-pointer"
            >
              Select Current Month
            </button>
            <span className="text-gray-400">
              {MONTHS[currentMonthNow].short} {currentYearNow}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
