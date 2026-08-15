'use client';

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import logo from "../../../public/logo.png";
import { ShieldUser, Ban } from "lucide-react";
import axiosInstance from "@/lib/axios";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import Image from "next/image";
import Link from "next/link";

const ChevronDown = props => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const Trash = props => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

const DropdownMenu = ({ children, trigger }) => {
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

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <div onClick={handleTriggerClick} className="cursor-pointer">
        {trigger}
      </div>
      {isOpen && (
        <div className={`absolute right-0 w-48 rounded-lg shadow-lg bg-white dark:bg-zinc-900 ring-1 ring-black ring-opacity-5 focus:outline-none z-50 animate-in fade-in-0 zoom-in-95 p-1 ${openUpwards ? "bottom-full mb-2 origin-bottom-right" : "top-full mt-2 origin-top-right"}`} role="menu" aria-orientation="vertical">
          {children}
        </div>
      )}
    </div>
  );
};

const DropdownMenuItem = ({ children, onClick }) => (
  <a
    href="#"
    onClick={e => {
      e.preventDefault();
      if (onClick) onClick();
    }}
    className="text-zinc-700 dark:text-zinc-300 group flex items-center px-3 py-2 text-sm rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors duration-150"
    role="menuitem"
  >
    {children}
  </a>
);

const DropdownMenuSeparator = () => <div className="my-1 h-px bg-zinc-200 dark:bg-zinc-700" />;

function ActionDropdown({ user, onDelete }) {
  const handleDeleteUser = () => {
    axiosInstance.delete(`/api/v1/users/${user.uid}`)
      .then(() => {
        alert("User Deleted Successfully");
        if (onDelete) onDelete(user.id);
      }).catch(err => {
        console.log(err);
      });
  };

  return (
    <div>
      <DropdownMenu trigger={
        <button className="inline-flex items-center px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-600 rounded-md shadow-sm hover:bg-zinc-50 dark:hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors">
          Actions
          <ChevronDown className="ml-2 h-4 w-4" />
        </button>
      }>
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
    </div>
  );
}

const AnalyticsIcon = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3 3v18h18" />
    <path d="m19 9-5 5-4-4-3 3" />
  </svg>
);

const UsersIcon = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="m22 21-2-2" />
    <path d="M16 16.28A13.84 13.84 0 0 1 22 21" />
  </svg>
);

const AnalyticsContent = () => (
  <div>
    <h3 className="text-xl font-semibold mb-4">Dashboard Metrics</h3>
  </div>
);

const UsersContent = ({ usersList, setUsersList }) => (
  <div>
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-25">#</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {usersList.map((user, index) => (
          <TableRow key={user.id}>
            <TableCell className="font-medium">
              {index + 1}
            </TableCell>
            <TableCell className="font-medium">
              {user.name}
            </TableCell>
            <TableCell className="font-medium">
              {user.role ? user.role : "N\\A"}
            </TableCell>
            <TableCell className="font-medium">
              <ActionDropdown user={user} onDelete={(id) => setUsersList && setUsersList(prev => prev.filter(u => u.id !== id))} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </div>
);

export default function VerticalTabs({ tabs, className }) {
  const [activeTab, setActiveTab] = useState(tabs[0].id);
  const [usersList, setUsersList] = useState([]);

  const users = () => {
    axiosInstance.get("/api/v1/users").then(response => {
      setUsersList(response.data.data);
    }).catch(() => {});
  };

  useEffect(() => {
    users();
  }, []);

  return (
    <div className={`flex flex-col h-screen w-full bg-slate-50 dark:bg-[#0a0a0a] ${className || ''}`}>
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6 dark:border-slate-800 dark:bg-black">
        <Link href={"/"}>
          <Image src={logo} alt='ALUMNET' width={200} height={200} />
        </Link>
        <div className="flex items-center">
          <p>Welcome, Admin</p>
          <ShieldUser width={50} />
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-64 shrink-0 overflow-y-auto border-r border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-black">
          <div className="space-y-1.5">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`group relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-all duration-200 ${isActive ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400" : "text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/50"}`}
                >
                  <Icon className={`h-5 w-5 transition-colors ${isActive ? "text-blue-700 dark:text-blue-400" : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300"}`} />
                  <span className="font-medium">{tab.title}</span>
                  {tab.badge && (
                    <span className={`ml-auto rounded-full px-2 py-0.5 text-xs font-medium ${isActive ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto p-8">
          <AnimatePresence mode="wait">
            {tabs.map(tab => {
              if (activeTab !== tab.id) return null;
              return (
                <motion.div
                  key={tab.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="mx-auto max-w-5xl"
                >
                  <h2 className="mb-6 text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
                    {tab.title}
                  </h2>
                  <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-black">
                    {tab.component ? <tab.component usersList={usersList} setUsersList={setUsersList} /> : <p className="text-lg leading-relaxed text-slate-600 dark:text-slate-300">{tab.content}</p>}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

export function AdminDashboard() {
  const tabs = [
    {
      id: "analytics",
      title: "Analytics",
      icon: AnalyticsIcon,
      component: AnalyticsContent
    },
    {
      id: "users",
      title: "User Management",
      icon: UsersIcon,
      component: UsersContent
    }
  ];
  return <VerticalTabs tabs={tabs} />;
}
