"use client";
import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const Modal = ({
  isOpen,
  onClose,
  children,
  title,
  size = "md",
  animation = "scale",
  overflow = "auto",
  className,
}) => {
  const getModalVariants = (animationType) => {
    switch (animationType) {
      case "scale":
        return {
          hidden: { opacity: 0, scale: 0.75, y: 20 },
          visible: {
            opacity: 1,
            scale: 1,
            y: 0,
            transition: {
              type: "spring",
              damping: 25,
              stiffness: 300,
            },
          },
          exit: {
            opacity: 0,
            scale: 0.75,
            y: 20,
            transition: { duration: 0.2 },
          },
        };

      case "slide":
        return {
          hidden: { opacity: 0, y: -50, scale: 0.95 },
          visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
              type: "spring",
              damping: 20,
              stiffness: 300,
            },
          },
          exit: {
            opacity: 0,
            y: -30,
            scale: 0.95,
            transition: { duration: 0.2 },
          },
        };

      case "fade":
        return {
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: { duration: 0.3, ease: "easeOut" },
          },
          exit: {
            opacity: 0,
            transition: { duration: 0.2 },
          },
        };

      case "bounce":
        return {
          hidden: { opacity: 0, scale: 0.3, rotate: -10 },
          visible: {
            opacity: 1,
            scale: 1,
            rotate: 0,
            transition: {
              type: "spring",
              damping: 15,
              stiffness: 400,
              bounce: 0.6,
            },
          },
          exit: {
            opacity: 0,
            scale: 0.3,
            rotate: 10,
            transition: { duration: 0.2 },
          },
        };

      default:
        return {
          hidden: { opacity: 0, scale: 0.75, y: 20 },
          visible: {
            opacity: 1,
            scale: 1,
            y: 0,
            transition: {
              type: "spring",
              damping: 25,
              stiffness: 300,
            },
          },
          exit: {
            opacity: 0,
            scale: 0.75,
            y: 20,
            transition: { duration: 0.2 },
          },
        };
    }
  };

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  };

  const modalVariants = getModalVariants(animation);

  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      const originalPointerEvents = document.body.style.pointerEvents;

      document.body.style.overflow = "hidden";
      document.body.style.pointerEvents = "none";

      return () => {
        document.body.style.overflow = originalOverflow || "";
        document.body.style.pointerEvents = originalPointerEvents || "";
      };
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-auto"
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={backdropVariants}
          transition={{ duration: 0.2 }}>
          <motion.div
            className={cn("absolute inset-0 backdrop-blur-sm", "bg-black/50 dark:bg-black/70")}
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }} />

          <motion.div
            className={cn(
              "relative rounded-lg shadow-xl w-full mx-4 max-h-[90vh]",
              overflow === "visible" ? "overflow-visible" : "overflow-auto",
              "bg-white dark:bg-gray-900",
              "border-0 dark:border dark:border-gray-700",
              sizeClasses[size],
              className
            )}
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit">
            {title && (
              <div
                className={cn(
                  "flex items-center justify-between p-4 border-b",
                  "border-gray-200 dark:border-gray-700"
                )}>
                <h3 className={cn("text-lg font-semibold", "text-gray-900 dark:text-white")}>
                  {title}
                </h3>
                <button
                  onClick={onClose}
                  className={cn(
                    "p-1 rounded-md transition-colors",
                    "text-gray-400 hover:text-gray-600",
                    "dark:text-gray-400 dark:hover:text-gray-200",
                    "hover:bg-gray-100 dark:hover:bg-gray-800"
                  )}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}

            <div className="p-4">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default Modal;
