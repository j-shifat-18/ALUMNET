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
import { Camera, FileUser, Globe, PencilLine, UserRoundCheck, UserRoundPlus } from 'lucide-react';
import { EditDrawer, DrawerOverlay, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter, Button } from '@/components/ui/EditDrawer/EditDrawer';
import GenderDropdown from '@/components/ui/GenderDropdown/GenderDropdown';
import ProfilePhotoEditModal from '@/components/ui/ProfilePhotoEditModal/ProfilePhotoEditModal';
import CoverPhotoEditModal from '@/components/ui/CoverPhotoEditModal/CoverPhotoEditModal';
import Github from '@/components/ImageToJSX/Github';

export default function Profile() {

  const { user } = useAuth();
  const { id } = useParams();
  const [dbUser, setDbUser] = useState(null);
  const [basicInfoDrawerOpen, setBasicInfoDrawerOpen] = useState(false);
  const [contactInfoDrawerOpen, setContactInfoDrawerOpen] = useState(false);
  const [additionalInfoDrawerOpen, setAdditionalInfoDrawerOpen] = useState(false);
  const [editInfoDrawerOpen, setEditInfoDrawerOpen] = useState(false);
  const [profilePhotoModalOpen, setProfilePhotoModalOpen] = useState(false);
  const [coverPhotoModalOpen, setCoverPhotoModalOpen] = useState(false);
  const textareaRef = useRef(null);
  const [bio, setBio] = useState(dbUser?.bio || "");
  const [name, setName] = useState(dbUser?.name || "");
  const [location, setLocation] = useState(dbUser?.location || "");
  const [contactNo, setContactNo] = useState(dbUser?.contactNo || "");
  const [githubUrl, setGithubUrl] = useState(dbUser?.githubUrl || "");
  const [portfolioUrl, setPortfolioUrl] = useState(dbUser?.portfolioUrl || "");
  const [resumeUrl, setResumeUrl] = useState(dbUser?.resumeUrl || "");
  const [followed, setFollowed] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedGender, setSelectedGender] = useState(dbUser?.gender);
  const [profileImageUrl, setProfileImageUrl] = useState(dbUser?.profileImage || "");
  const [coverImageUrl, setCoverImageUrl] = useState(dbUser?.coverImage || "");

  useEffect(() => {
    if (!id) return;
    axiosInstance.get(`/api/v1/profiles/${id}`)
      .then(response => {
        console.log("Profile API Response:", response);
        const data = response.data.data;
        setDbUser(data);
        setName(data?.name || "");
        setContactNo(data?.contactNo || "");
        setLocation(data?.location || "");
        setSelectedGender(data?.gender || "");
        
        const userProfile = data?.role === 'STUDENT' ? data?.studentProfile : data?.alumniProfile;
        setGithubUrl(userProfile?.githubUrl || "");
        setPortfolioUrl(userProfile?.portfolioUrl || "");
        setResumeUrl(userProfile?.resumeUrl || "");
      })
      .catch(err => {
        console.error("Error fetching profile:", err.response?.data || err.message);
      });
  }, [id]);

  // console.log(user);
  // console.log(dbUser);

  const profile = dbUser?.role === 'STUDENT' ? dbUser?.studentProfile : dbUser?.alumniProfile;
  const isOwner = user?.uid === id;
  // console.log(isOwner);

  const handleInput = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  const handleEditBasicInfo = async () => {
    try {
      setIsSaving(true);
      await axiosInstance.patch(`/api/v1/profiles/${user.uid}`, {
        gender: selectedGender,
      });
      setDbUser(prev => ({ ...prev, gender: selectedGender }));
      setBasicInfoDrawerOpen(false);
    }
    catch (err) {

    }
    finally {
      setIsSaving(false);
    }
  };

  const handleEditContactInfo = async () => {
    try {
      setIsSaving(true);
      await axiosInstance.patch(`/api/v1/profiles/${user.uid}`, {
        contactNo: contactNo,
      });
      setDbUser(prev => ({ ...prev, contactNo: contactNo }));
      setContactInfoDrawerOpen(false);
    }
    catch (err) {

    }
    finally {
      setIsSaving(false);
    }
  };

  const handleEditAdditionalInfo = async () => {
    try {
      setIsSaving(true);
      const payload = dbUser?.role === "STUDENT" ? {
        studentProfile: {
          githubUrl,
          portfolioUrl,
          resumeUrl
        }
      } : {
        alumniProfile: {
          githubUrl,
          portfolioUrl,
          resumeUrl,
        }
      };

      await axiosInstance.patch(`/api/v1/profiles/${user.uid}`, payload);
      setDbUser(prev => ({
        ...prev, [dbUser?.role === "STUDENT" ? "studentProfile" : "alumniProfile"]: {
          ...profile,
          githubUrl,
          portfolioUrl,
          resumeUrl,
        }
      }));
      setAdditionalInfoDrawerOpen(false);
    }
    catch (err) {

    }
    finally {
      setIsSaving(false);
    }
  };

  const handleEditProfileInfo = async () => {
    try {
      setIsSaving(true);
      await axiosInstance.patch(`/api/v1/profiles/${user.uid}`, {
        name, bio, location,
      });
      setDbUser(prev => ({ ...prev, name, bio, location }));
      setEditInfoDrawerOpen(false);
    }
    catch (err) {

    }
    finally {
      setIsSaving(false);
    }
  };

  const handleProfilePhotoSave = async (imageUrl) => {
    try {
      setIsSaving(true);
      await axiosInstance.patch(`/api/v1/profiles/${user.uid}`, {
        profileImage: imageUrl,
      });
      setDbUser(prev => ({ ...prev, profileImage: imageUrl }));
      setProfileImageUrl(imageUrl);
      setProfilePhotoModalOpen(false);
    } catch (error) {
      console.error("Error updating profile photo:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCoverPhotoSave = async (imageUrl) => {
    try {
      setIsSaving(true);
      await axiosInstance.patch(`/api/v1/profiles/${user.uid}`, {
        coverImage: imageUrl,
      });
      setDbUser(prev => ({ ...prev, coverImage: imageUrl }));
      setCoverImageUrl(imageUrl);
      setCoverPhotoModalOpen(false);
    } catch (error) {
      console.error("Error updating cover photo:", error);
    } finally {
      setIsSaving(false);
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
                {isOwner && (
                  <Camera
                    onClick={() => setCoverPhotoModalOpen(true)}
                    className='relative top-6 left-250 w-7 h-7 text-black bg-gray-400 hover:cursor-pointer p-1 border-2 border-white rounded-full hover:bg-gray-500 transition-colors'
                  />
                )}
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
                  {isOwner && (
                    <Camera
                      onClick={() => setProfilePhotoModalOpen(true)}
                      className='relative bottom-9 left-36 w-7 h-7 text-black bg-gray-400 hover:cursor-pointer p-1 border-2 border-white rounded-full hover:bg-gray-500 transition-colors'
                    />
                  )}
                </div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white leading-tight">
                  {dbUser?.name}
                </h1>
                <p className="text-xl mt-1">
                  {dbUser?.bio || " "}
                </p>
                <p className="text-xl mt-1">{dbUser?.location || " "}</p>
                <p className="text-xl mt-1">{dbUser?.followersCount || "0 followers"}</p>
                {isOwner ? <button type='button' className='mt-2 px-4 py-1 border border-zinc-900 rounded-xl hover:cursor-pointer hover:bg-zinc-900 hover:text-white flex items-center justify-between gap-2' onClick={() => setEditInfoDrawerOpen(true)}>
                  <PencilLine className='w-4 h-4' /> Edit Profile
                </button> : <button
                  onClick={() => setFollowed(!followed)}
                  className={`mt-2 px-4 py-1 border border-zinc-900 rounded-xl hover:cursor-pointer flex items-center justify-between gap-2 transition-colors ${followed
                    ? 'bg-white text-zinc-900'
                    : 'bg-zinc-900 text-white'
                    }`}
                >
                  {followed ? (
                    <><UserRoundCheck className='w-4 h-4' /> Followed</>
                  ) : (
                    <><UserRoundPlus className='w-4 h-4' /> Follow</>
                  )}
                </button>}
              </div>
            </div>
          </div>
          <aside className="hidden lg:flex flex-col gap-4 w-72 xl:w-80 shrink-0">
            
            {/* Basic Information Section starts here */}
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

            {/* Contant Info section is here */}
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

            {/* Additional Info section containing URLs are here */}
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
                    <div className="text-xl text-gray-700 dark:text-gray-300">{profile?.githubUrl ? <a href={profile?.githubUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline dark:text-blue-400 break-all">
                      <div className='flex items-center gap-2'><Github /> Github</div>
                    </a> : "N\\A"}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div>
                    <div className="text-xl text-gray-700 dark:text-gray-300">{profile?.portfolioUrl ? <a href={profile?.portfolioUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline dark:text-blue-400 break-all">
                      <div className='flex items-center gap-2'><Globe className='w-6 h-6 text-black'/> Portfolio</div>
                    </a> : "N\\A"}</div>
                  </div>
                </div>
                {
                  dbUser?.role === 'STUDENT' ? <>
                    <div className="flex items-start gap-3">
                      <div>
                        <div className="text-xl text-gray-700 dark:text-gray-300">{profile?.resumeUrl ? <a href={profile?.resumeUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline dark:text-blue-400 break-all">
                          <div className='flex items-center gap-2'><FileUser className='w-6 h-6 text-black'/> Resume</div>
                        </a> : "N\\A"}</div>
                      </div>
                    </div>
                  </> : <></>
                }
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* This handles the edit functionality of BASIC INFO */}
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
            <GenderDropdown selectedGender={selectedGender} onGenderChange={setSelectedGender}></GenderDropdown>
          </div>
          <DrawerFooter>
            <Button variant="outline" onClick={() => setBasicInfoDrawerOpen(false)}>Cancel</Button>
            <Button onClick={handleEditBasicInfo} disabled={isSaving}>{
              isSaving ? "Saving changes..." : "Save"
            }</Button>
          </DrawerFooter>
        </DrawerContent>
      </EditDrawer>

      {/* This part handles the edit of CONTACT INFO */}
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
            <input value={contactNo} onChange={(e) => setContactNo(e.target.value)} className='signin-input w-full px-3 py-2 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-md text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:border-transparent transition-all duration-200'></input>
          </div>
          <DrawerFooter>
            <Button variant="outline" onClick={() => setContactInfoDrawerOpen(false)}>Cancel</Button>
            <Button onClick={handleEditContactInfo} disabled={isSaving}>
              {
                isSaving ? "Saving changes..." : "Save"
              }
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </EditDrawer>

      {/* This handles the edit of ADDITIONAL INFO section */}
      <EditDrawer open={additionalInfoDrawerOpen} onOpenChange={setAdditionalInfoDrawerOpen} side="bottom">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Edit Additional Information</DrawerTitle>
          </DrawerHeader>
          <div className="p-6 flex-1 overflow-visible">
            <label>Github URL</label>
            <input value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} className='signin-input w-full px-3 py-2 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-md text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:border-transparent transition-all duration-200'></input>
            <label>Portfolio URL</label>
            <input value={portfolioUrl} onChange={(e) => setPortfolioUrl(e.target.value)} className='signin-input w-full px-3 py-2 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-md text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:border-transparent transition-all duration-200'></input>
            {
              dbUser?.role === "STUDENT" ? <>
                <label>Resume URL</label>
                <input defaultValue={resumeUrl} onChange={(e) => setResumeUrl(e.target.value)} className='signin-input w-full px-3 py-2 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-md text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:border-transparent transition-all duration-200'></input>
              </> : <></>
            }
          </div>
          <DrawerFooter>
            <Button variant="outline" onClick={() => setAdditionalInfoDrawerOpen(false)}>Cancel</Button>
            <Button onClick={handleEditAdditionalInfo} disabled={isSaving}>{
              isSaving ? "Saving changes..." : "Save"
            }</Button>
          </DrawerFooter>
        </DrawerContent>
      </EditDrawer>

      {/* This section handles the profile info edit functionality like names, location etc. */}
      <EditDrawer open={editInfoDrawerOpen} onOpenChange={setEditInfoDrawerOpen} side="bottom">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Edit Profile Information</DrawerTitle>
          </DrawerHeader>
          <div className="p-6 flex-1 overflow-visible">
            <label>Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className='signin-input w-full px-3 py-2 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-md text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:border-transparent transition-all duration-200'></input>
            <label>Bio</label>
            <textarea ref={textareaRef} rows={1} value={bio || dbUser?.bio || ''} onChange={(e) => { setBio(e.target.value); handleInput(); }} onInput={handleInput} name="bio" id="bio" placeholder='Write about yourself' className='signin-input w-full px-3 py-2 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-md text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:border-transparent transition-all duration-200'></textarea>
            <label>Location</label>
            <input defaultValue={location} onChange={(e) => setLocation(e.target.value)} className='signin-input w-full px-3 py-2 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-md text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:border-transparent transition-all duration-200'></input>
          </div>
          <DrawerFooter>
            <Button variant="outline" onClick={() => setEditInfoDrawerOpen(false)}>Cancel</Button>
            <Button onClick={handleEditProfileInfo} disabled={isSaving}>
              {
                isSaving ? "Saving changes..." : "Save"
              }
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </EditDrawer>

      {profilePhotoModalOpen && (
        <ProfilePhotoEditModal
          onClose={() => setProfilePhotoModalOpen(false)}
          currentImage={dbUser?.profileImage}
          onSave={handleProfilePhotoSave}
        />
      )}

      {coverPhotoModalOpen && (
        <CoverPhotoEditModal
          onClose={() => setCoverPhotoModalOpen(false)}
          currentImage={dbUser?.coverImage}
          onSave={handleCoverPhotoSave}
        />
      )}
    </ProtectedRoute>
  )
}
