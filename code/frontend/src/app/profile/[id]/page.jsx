"use client";

import ProtectedRoute from '@/components/shared/ProtectedRoute'
import React, { useEffect, useState } from 'react'
import cover_placeholder from "../../../../public/cover_placeholder.jpg";
import user_placeholder from "../../../../public/placeholder-user.jpg";
import Image from 'next/image';
import Navbar from '@/components/shared/Navbar/Navbar';
import { useAuth } from '@/context/AuthProvider';
import axiosInstance from '@/lib/axios';

export default function Profile() {

    const {user} = useAuth();
    const [usersList, setUsersList] = useState([]);

    const users = () => {
    if (!user){
        return;
    }
    axiosInstance.get("/api/v1/users").then(response => {
      const signedInUser = response.data.data.find(u => u.email === user.email);
      setUsersList(signedInUser ? [signedInUser] : []);
    }).catch(err => {})
  }

  useEffect(() => {
    users();
  }, [user]);

  const dbUser = usersList[0];
  console.log(dbUser);

  return (
    <ProtectedRoute>
      <Navbar />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 mt-6">
        <div className="flex gap-5 items-start">
          <div className="flex-1 min-w-0">
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
              <div className="relative h-36 sm:h-44 lg:h-52 w-full overflow-hidden">
                <Image
                  src={dbUser?.coverImage || cover_placeholder}
                  alt="Cover"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              <div className="px-5 pb-5">
                <div className="relative -mt-12 sm:-mt-24 mb-5">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 lg:w-50 lg:h-50 rounded-full border-4 border-white dark:border-gray-900 overflow-hidden shadow-md">
                    <Image
                      src={dbUser?.profileImage || user_placeholder}
                      alt="User"
                      width={128}
                      height={128}
                      className="object-cover w-full h-full"
                    />
                  </div>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white leading-tight">
                  {dbUser?.name}
                </h1>
                <p className="text-xl mt-1">
                  {dbUser?.bio}
                </p>
                <p className="text-xl mt-1">{dbUser?.location || "Not Available"}</p>
                <p className="text-xl mt-1">{dbUser?.followersCount || "0 followers"}</p>
              </div>
            </div>
          </div>
          <aside className="hidden lg:flex flex-col gap-4 w-72 xl:w-80 shrink-0">
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-5">
              <div className="flex flex-col gap-4">
                <div className="flex items-start gap-3">
                  <div>
                    <p className="text-xl font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-0.5">Role</p>
                    <p className="text-md text-gray-700 dark:text-gray-300">{dbUser?.role}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div>
                    <p className="text-xl font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-0.5">Email</p>
                    <p className="text-md text-gray-700 dark:text-gray-300">{dbUser?.email}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div>
                    <p className="text-xl font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-0.5">Contact No</p>
                    <p className="text-md text-gray-700 dark:text-gray-300">{dbUser?.contactNo || "N\\A"}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div>
                    <p className="text-xl font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-0.5">Gender</p>
                    <p className="text-md text-gray-700 dark:text-gray-300">{dbUser?.gender}</p>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </ProtectedRoute>
  )
}
