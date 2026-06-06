"use client";

import { useAuth } from "@/context/AuthProvider";
import React, { useState, useEffect, useRef } from "react";
import axiosInstance from "@/lib/axios";
import Image from "next/image";
import placeholder from "../../../../public/placeholder-user.jpg";
import Link from "next/link";

const User = props => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>;
const LogOut = props => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" x2="9" y1="12" y2="12" />
  </svg>;
const DropdownMenu = ({
  children,
  trigger
}) => {
  const [isOpen, setIsOpen] = useState(false);
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
    setIsOpen(!isOpen);
  };
  return <div className="relative inline-block text-left" ref={dropdownRef}>
      <div onClick={handleTriggerClick} className="cursor-pointer">
        {trigger}
      </div>
      {isOpen && <div className="origin-top-right absolute right-0 mt-2 w-72 rounded-xl shadow-xl bg-white dark:bg-zinc-900 ring-1 ring-black ring-opacity-5 focus:outline-none z-50 animate-in fade-in-0 zoom-in-95 p-2" role="menu" aria-orientation="vertical">
          {children}
        </div>}
    </div>;
};
const DropdownMenuItem = ({
  children,
  onClick
}) => <div onClick={onClick} className="cursor-pointer text-zinc-700 dark:text-zinc-300 group flex items-center px-3 py-2.5 text-sm rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors duration-150" role="menuitem">
    {children}
  </div>;
const DropdownMenuSeparator = () => <div className="h-px bg-zinc-200 dark:bg-zinc-700" />;
export default function UserProfileDropdown() {
  const { user, logout } = useAuth();
  const [usersList, setUsersList] = useState([]);

  const users = () => {
    if (!user){
        return;
    }
    axiosInstance.get(`/api/v1/profiles/${user.uid}`).then(response => {
      setUsersList(response.data.data ? [response.data.data] : []);
    }).catch(err => {})
  }

  useEffect(() => {
    users();
  }, [user]);

  const dbUser = usersList[0];
  // console.log(dbUser);

  return <div className="flex items-center justify-center font-sans p-8">
      <DropdownMenu trigger={<button className="flex items-center space-x-3 p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
            <Image src={dbUser?.profileImage || placeholder} alt="USER" width={40} height={40} className="rounded-full"></Image>
            <div className="text-left">
              <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {user?.displayName}
              </div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400">
                {user?.email}
              </div>
            </div>
          </button>}>
        <div className="px-3 py-3 border-b border-zinc-200 dark:border-zinc-700">
          <div className="flex items-center space-x-3">
            <Image src={dbUser?.profileImage || placeholder} alt="USER" width={40} height={40} className="rounded-full"></Image>
            <div>
              <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {dbUser?.name}
              </div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400">
                {dbUser?.email}
              </div>
              <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                {dbUser?.role}
              </div>
            </div>
          </div>
        </div>

        <div className="py-1">
          <Link href={`/profile/${user?.uid}`} className="text-zinc-700 dark:text-zinc-300 group flex items-center px-3 py-2.5 text-sm rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors duration-150" role="menuitem">
            <User className="mr-3 h-4 w-4 text-zinc-500" />
            My Profile
          </Link>
        </div>

        <DropdownMenuSeparator />

        <div className="py-1">
          <DropdownMenuItem onClick={() => logout().catch(err => console.error("Sign out failed:", err))}>
            <LogOut className="mr-3 h-4 w-4 text-zinc-500" />
            Sign Out
          </DropdownMenuItem>
        </div>
      </DropdownMenu>
    </div>;
}