"use client";

import { useAuth } from "@/context/AuthProvider";
import { Ban } from "lucide-react";
import React, { useState, useEffect, useRef, ReactNode } from "react";
import axiosInstance from "@/lib/axios";
const ChevronDown = props => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
  <polyline points="6 9 12 15 18 9" />
</svg>;
const File = props => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
  <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
  <polyline points="14 2 14 8 20 8" />
</svg>;
const Edit = props => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
</svg>;
const Trash = props => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
  <polyline points="3 6 5 6 21 6" />
  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
</svg>;
const DropdownMenu = ({
  children,
  trigger
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [openUpwards, setOpenUpwards] = useState(false);
  const dropdownRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = event => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  const handleTriggerClick = e => {
    e.stopPropagation();
    if (!isOpen && dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      setOpenUpwards(spaceBelow < 150);
    }
    setIsOpen(!isOpen);
  };
  return <div className="relative inline-block text-left" ref={dropdownRef}>
    <div onClick={handleTriggerClick} className="cursor-pointer">
      {trigger}
    </div>
    {isOpen && <div className={`absolute right-0 w-48 rounded-lg shadow-lg bg-white dark:bg-zinc-900 ring-1 ring-black ring-opacity-5 focus:outline-none z-50 animate-in fade-in-0 zoom-in-95 p-1 ${openUpwards ? "bottom-full mb-2 origin-bottom-right" : "top-full mt-2 origin-top-right"}`} role="menu" aria-orientation="vertical">
      {children}
    </div>}
  </div>;
};
const DropdownMenuItem = ({
  children,
  onClick
}) => <a href="#" onClick={e => {
  e.preventDefault();
  if (onClick) onClick();
}} className="text-zinc-700 dark:text-zinc-300 group flex items-center px-3 py-2 text-sm rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors duration-150" role="menuitem">
    {children}
  </a>;
const DropdownMenuSeparator = () => <div className="my-1 h-px bg-zinc-200 dark:bg-zinc-700" />;
export default function ActionDropdown({ user, onDelete }) {


  const handleDeleteUser = () => {
    axiosInstance.delete(`/api/v1/users/${user.id}`)
      .then(() => {
        alert("User Deleted Successfully");
        if (onDelete) onDelete(user.id);
      }).catch(err => {
        console.log(err)
      })
  }

  return <div className="">
    <DropdownMenu trigger={<button className="inline-flex items-center px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-600 rounded-md shadow-sm hover:bg-zinc-50 dark:hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors">
      Actions
      <ChevronDown className="ml-2 h-4 w-4" />
    </button>}>
      <DropdownMenuItem onClick={() => console.log("Edit")}>
        <Ban className="mr-3 h-4 w-4 text-zinc-500" />
        Ban
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={handleDeleteUser}>
        <Trash className="mr-3 h-4 w-4 text-red-500" />
        <span className="text-red-600 dark:text-red-400">Delete</span>
      </DropdownMenuItem>
    </DropdownMenu>
  </div>;
}