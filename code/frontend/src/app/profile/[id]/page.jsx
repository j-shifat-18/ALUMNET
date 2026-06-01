"use client";

import ProtectedRoute from '@/components/shared/ProtectedRoute'
import React, { useEffect, useRef, useState } from 'react'
import { useParams } from 'next/navigation'
import cover_placeholder from "../../../../public/cover_placeholder.jpg";
import user_placeholder from "../../../../public/placeholder-user.jpg";
import Image from 'next/image';
import Navbar from '@/components/shared/Navbar/Navbar';
import { useAuth } from '@/context/AuthProvider';
import axiosInstance from '@/lib/axios';
import Divider from '@/components/ui/divider';
import { PencilLine } from 'lucide-react';
import { EditDrawer, DrawerOverlay, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter, Button } from '@/components/ui/EditDrawer/EditDrawer';
import GenderDropdown from '@/components/ui/GenderDropdown/GenderDropdown';

export default function Profile() {

  const { user } = useAuth();
  const { id } = useParams();
  const [dbUser, setDbUser] = useState(null);
  const [basicInfoDrawerOpen, setBasicInfoDrawerOpen] = useState(false);
  const [contactInfoDrawerOpen, setContactInfoDrawerOpen] = useState(false);
  const [additionalInfoDrawerOpen, setAdditionalInfoDrawerOpen] = useState(false);
  const [editInfoDrawerOpen, setEditInfoDrawerOpen] = useState(false);
  const textareaRef = useRef(null);
  const [bio, setBio] = useState('');

  useEffect(() => {
    if (!id) return;
    axiosInstance.get("/api/v1/users")
      .then(response => {
        const visited = response.data.data.find(u => u.uid === id);
        setDbUser(visited || null);
      })
      .catch(err => { });
  }, [id]);
  console.log(user);
  console.log(dbUser);

  const isOwner = user?.uid === dbUser?.uid;
  // console.log(isOwner);

  const handleInput = () => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = `${textarea.scrollHeight}px`;
        }
    };

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
                { isOwner ? <button type='button' className='mt-2 px-4 py-1 border border-zinc-900 rounded-xl hover:cursor-pointer hover:bg-zinc-900 hover:text-white' onClick={() => setEditInfoDrawerOpen(true)}>Edit Profile</button> : <button>Follow/Followed</button> }
              </div>
            </div>
          </div>
          <aside className="hidden lg:flex flex-col gap-4 w-72 xl:w-80 shrink-0">
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-5">
              <div className='flex justify-between items-center'>
                <h4 className='text-xl font-bold'>Basic Information</h4>
                {isOwner ? <button type="button" className="btn btn-secondary" onClick={() => setBasicInfoDrawerOpen(true)} title="Edit">
                  <PencilLine className='w-5 h-5 hover:cursor-pointer' />
                </button> : <></>}
              </div>
              <Divider className='mt-2 mb-2' />
              <div className="flex flex-col gap-4">
                <div className="flex items-start gap-3">
                  <div>
                    <p className="text-xl font-semibold tracking-wide mb-0.5">Role</p>
                    <p className="text-md text-gray-700 dark:text-gray-300">{dbUser?.role}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div>
                    <p className="text-xl font-semibold tracking-wide mb-0.5">Gender</p>
                    <p className="text-md text-gray-700 dark:text-gray-300">{dbUser?.gender}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-5">
              <div className='flex justify-between items-center'>
                <h4 className='text-xl font-bold'>Contact Information</h4>
                {isOwner ? <button type="button" className="btn btn-secondary" onClick={() => setContactInfoDrawerOpen(true)} title="Edit">
                  <PencilLine className='w-5 h-5 hover:cursor-pointer' />
                </button> : <></>}
              </div>
              <Divider className='mt-2 mb-2' />
              <div className="flex flex-col gap-4">
                <div className="flex items-start gap-3">
                  <div>
                    <p className="text-xl font-semibold tracking-wide mb-0.5">Email</p>
                    <p className="text-md text-gray-700 dark:text-gray-300">{dbUser?.email}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div>
                    <p className="text-xl font-semibold tracking-wide mb-0.5">Contact No.</p>
                    <p className="text-md text-gray-700 dark:text-gray-300">{dbUser?.contactNo || "N\\A"}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-5">
              <div className='flex justify-between items-center'>
                <h4 className='text-xl font-bold'>Additional Information</h4>
                {isOwner ? <button type="button" className="btn btn-secondary" onClick={() => setAdditionalInfoDrawerOpen(true)} title="Edit">
                  <PencilLine className='w-5 h-5 hover:cursor-pointer' />
                </button> : <></>}
              </div>
              <Divider className='mt-2 mb-2' />
              <div className="flex flex-col gap-4">
                <div className="flex items-start gap-3">
                  <div>
                    <p className="text-xl font-semibold tracking-wide mb-0.5">Github URL</p>
                    <p className="text-md text-gray-700 dark:text-gray-300">{dbUser?.githubUrl ? <a href={dbUser?.githubUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline dark:text-blue-400 break-all">{dbUser?.githubUrl}</a> : "N\\A"}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div>
                    <p className="text-xl font-semibold tracking-wide mb-0.5">Portfolio URL</p>
                    <p className="text-md text-gray-700 dark:text-gray-300">{dbUser?.portfolioUrl ? <a href={dbUser?.portfolioUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline dark:text-blue-400 break-all">{dbUser?.portfolioUrl}</a> : "N\\A"}</p>
                  </div>
                </div>
                {
                  dbUser?.role === 'STUDENT' ? <>
                    <div className="flex items-start gap-3">
                      <div>
                        <p className="text-xl font-semibold tracking-wide mb-0.5">Resume URL</p>
                        <p className="text-md text-gray-700 dark:text-gray-300">{dbUser?.resumeUrl ? <a href={dbUser?.resumeUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline dark:text-blue-400 break-all">{dbUser?.resumeUrl}</a> : "N\\A"}</p>
                      </div>
                    </div>
                  </> : <></>
                }
              </div>
            </div>
          </aside>
        </div>
      </main>

      <EditDrawer open={basicInfoDrawerOpen} onOpenChange={setBasicInfoDrawerOpen} side="bottom">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Edit Basic Information</DrawerTitle>
          </DrawerHeader>
          <div className="p-6 flex-1 overflow-visible">
            <label>Role</label>
            <input value={dbUser?.role} disabled className='signin-input w-full px-3 py-2 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-md text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:border-transparent transition-all duration-200 readOnly'></input>
            <label>Gender</label>
            <GenderDropdown selectedGender={dbUser?.gender}></GenderDropdown>
          </div>
          <DrawerFooter>
            <Button variant="outline" onClick={() => setBasicInfoDrawerOpen(false)}>Cancel</Button>
            <Button onClick={() => setBasicInfoDrawerOpen(false)}>Save</Button>
          </DrawerFooter>
        </DrawerContent>
      </EditDrawer>

      <EditDrawer open={contactInfoDrawerOpen} onOpenChange={setContactInfoDrawerOpen} side="bottom">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Edit Contact Information</DrawerTitle>
          </DrawerHeader>
          <div className="p-6 flex-1 overflow-visible">
            <label>Email</label>
            <input value={dbUser?.email} disabled className='signin-input w-full px-3 py-2 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-md text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:border-transparent transition-all duration-200 readOnly'></input>
            <label>Contact No</label>
            <input defaultValue={dbUser?.contactNo} className='signin-input w-full px-3 py-2 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-md text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:border-transparent transition-all duration-200'></input>
          </div>
          <DrawerFooter>
            <Button variant="outline" onClick={() => setContactInfoDrawerOpen(false)}>Cancel</Button>
            <Button onClick={() => setContactInfoDrawerOpen(false)}>Save</Button>
          </DrawerFooter>
        </DrawerContent>
      </EditDrawer>

      <EditDrawer open={additionalInfoDrawerOpen} onOpenChange={setAdditionalInfoDrawerOpen} side="bottom">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Edit Additional Information</DrawerTitle>
          </DrawerHeader>
          <div className="p-6 flex-1 overflow-visible">
            <label>Github URL</label>
            <input defaultValue={dbUser?.githubUrl || "N\\A"} className='signin-input w-full px-3 py-2 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-md text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:border-transparent transition-all duration-200'></input>
            <label>Portfolio URL</label>
            <input defaultValue={dbUser?.portfolioUrl || "N\\A"} className='signin-input w-full px-3 py-2 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-md text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:border-transparent transition-all duration-200'></input>
            {
              dbUser?.role === "STUDENT" ? <>
                <label>Resume URL</label>
                <input defaultValue={dbUser?.resumeUrl || "N\\A"} className='signin-input w-full px-3 py-2 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-md text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:border-transparent transition-all duration-200'></input>
              </> : <></>
            }
          </div>
          <DrawerFooter>
            <Button variant="outline" onClick={() => setAdditionalInfoDrawerOpen(false)}>Cancel</Button>
            <Button onClick={() => setAdditionalInfoDrawerOpen(false)}>Save</Button>
          </DrawerFooter>
        </DrawerContent>
      </EditDrawer>

      <EditDrawer open={editInfoDrawerOpen} onOpenChange={setEditInfoDrawerOpen} side="bottom">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Edit Profile Information</DrawerTitle>
          </DrawerHeader>
          <div className="p-6 flex-1 overflow-visible">
            <label>Name</label>
            <input defaultValue={dbUser?.name || user?.displayName} className='signin-input w-full px-3 py-2 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-md text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:border-transparent transition-all duration-200'></input>
            <label>Bio</label>
            <textarea ref={textareaRef} rows={1} value={bio || dbUser?.bio || ''} onChange={(e) => { setBio(e.target.value); handleInput(); }} onInput={handleInput} name="bio" id="bio" placeholder='Write about yourself' className='signin-input w-full px-3 py-2 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-md text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:border-transparent transition-all duration-200'></textarea>
            <label>Location</label>
            <input defaultValue={dbUser?.location || "N\\A"} className='signin-input w-full px-3 py-2 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-md text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:border-transparent transition-all duration-200'></input>
          </div>
          <DrawerFooter>
            <Button variant="outline" onClick={() => setEditInfoDrawerOpen(false)}>Cancel</Button>
            <Button onClick={() => setEditInfoDrawerOpen(false)}>Save</Button>
          </DrawerFooter>
        </DrawerContent>
      </EditDrawer>
    </ProtectedRoute>
  )
}
