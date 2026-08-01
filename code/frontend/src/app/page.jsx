'use client';

import Navbar from "@/components/shared/Navbar/Navbar";
import { useAuth } from "@/context/AuthProvider";
import axiosInstance from "@/lib/axios";
import { Construction } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Home() {
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
  
  
  return (
    <div className="">
      <Navbar></Navbar>
      <div className="flex flex-col items-center justify-center font-bold text-6xl mt-50">
        {
          dbUser?.role == "USER" ? <>
          <Link href={"/profile-setup"} className="p-4 border-2 rounded-xl border-black hover:cursor-pointer hover:bg-zinc-900 hover:text-white">Complete Your Profile to Continue</Link>
          </> : <>
          <p className='flex items-center gap-3 justify-center text-4xl font-bold'><Construction className='text-red-700'/> Site Under Construction... Developer is in Delusion 😞</p>
          </>
        }
      </div>
    </div>
  );
}
