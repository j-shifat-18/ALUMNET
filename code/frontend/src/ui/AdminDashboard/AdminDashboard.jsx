'use client';

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Logo from "../Logo/Logo";
import { ShieldUser } from "lucide-react";
import axiosInstance from "@/lib/axios";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import ActionDropdown from "../ActionDropdown/ActionDropdown";

const AnalyticsIcon = ({
  className = "w-5 h-5"
}) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3 3v18h18" />
    <path d="m19 9-5 5-4-4-3 3" />
  </svg>;
const UsersIcon = ({
  className = "w-5 h-5"
}) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="m22 21-2-2" />
    <path d="M16 16.28A13.84 13.84 0 0 1 22 21" />
  </svg>;


const AnalyticsContent = () => (
  <div>
    <h3 className="text-xl font-semibold mb-4">Dashboard Metrics</h3>
  </div>
);

const UsersContent = ({ usersList }) => (
  <div>
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-25">#</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {
          usersList.map((user, index) =>
          <TableRow key={user.id}>
          <TableCell className="font-medium">
              {index+1}    
          </TableCell>
          <TableCell className="font-medium">
              {user.name}   
          </TableCell>
          <TableCell className="font-medium">
              {user.email}   
          </TableCell>
          <TableCell className="font-medium">
              {user.role? user.role : "N\\A"}   
          </TableCell>
          <TableCell className="font-medium">
                 <ActionDropdown></ActionDropdown>
          </TableCell>
        </TableRow>
        )}
      </TableBody>
    </Table>
  </div>
);

export default function VerticalTabs({ tabs, className }) {

  const [activeTab, setActiveTab] = useState(tabs[0].id);
  const [usersList, setUsersList] = useState([]);

  const users = () => {
    axiosInstance.get("/api/v1/users").then(response => {
      // console.log(response.data.data);
      setUsersList(response.data.data);
    }).catch(err => {
      // console.error(err);
    })
  }

  useEffect(() => {
    users();
  }, []);

  return (
    <div className={`flex flex-col h-screen w-full bg-slate-50 dark:bg-[#0a0a0a] ${className || ''}`}>
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6 dark:border-slate-800 dark:bg-black">
        <Logo></Logo>
        <div className="flex items-center">
          <p>Welcome, Admin</p>
          <ShieldUser width={50}></ShieldUser>
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
                    {tab.component ? <tab.component usersList={usersList} /> : <p className="text-lg leading-relaxed text-slate-600 dark:text-slate-300">{tab.content}</p>}
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