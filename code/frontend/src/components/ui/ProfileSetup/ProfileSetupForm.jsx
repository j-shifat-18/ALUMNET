'use client';

import React, { useState, useRef } from 'react';
import logo from '../../../../public/icon.png';
import placholderUser from "../../../../public/placeholder-user.jpg";
import Image from 'next/image';
import Button from '../button';
import { Check, ChevronLast, ImageUp } from 'lucide-react';
import DepartmentDropdown from '../DepartmentDropdown/DepartmentDropdown';
import ProgrammeDropdown from '../ProgrammeDropdown/ProgrammeDropdown';
import BatchYearDropdown from '../BatchYearDropdown/BatchYearDropdown';
import GenderDropdown from '../GenderDropdown/GenderDropdown';
import PreferencesMultiSelect from '../MultiSelectDropdown/PreferencesMultiSelect';
import SkillsMultiSelect from '../MultiSelectDropdown/SkillsMultiSelect';
import Notification from '../toast';
import axiosInstance from '@/lib/axios';
import { useAuth } from '@/context/AuthProvider';
import { useRouter } from 'next/navigation';

const CheckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20,6 9,17 4,12"></polyline>
</svg>;
const ArrowRightIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14"></path>
    <path d="m12 5 7 7-7 7"></path>
</svg>;
const ArrowLeftIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5"></path>
    <path d="m12 19-7-7 7-7"></path>
</svg>;

const ProfileSetupForm = () => {
    const [isLoading, setIsLoading] = useState(false);
    const { user } = useAuth();
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [selectedPreferences, setSelectedPreferences] = useState([]);
    const [selectedSkills, setSelectedSkills] = useState([]);
    const [notification, setNotification] = useState(null);
    const [alumniActive, setAlumniActive] = useState(false);
    const [studentActive, setStudentActive] = useState(false);
    const [yesActive, setYesActive] = useState(false);
    const [noActive, setNoActive] = useState(false);
    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [selectedProgramme, setSelectedProgramme] = useState('');
    const [selectedGender, setSelectedGender] = useState('');
    const [selectedBatch, setSelectedBatch] = useState('');
    const [selectedPhotoName, setSelectedPhotoName] = useState('');
    const [profileImageUrl, setProfileImageUrl] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [jobPlace, setJobPlace] = useState('');
    const [jobPosition, setJobPosition] = useState('');
    const [bio, setBio] = useState('');
    const [contactNo, setContactNo] = useState('');
    const [resumeUrl, setResumeUrl] = useState('');
    const [githubUrl, setGithubUrl] = useState('');
    const [portfolioUrl, setPortfolioUrl] = useState('');
    const textareaRef = useRef(null);

    const validDepartments = [
        "Mechanical and Production Engineering (MPE)",
        "Electrical and Electronic Engineering (EEE)",
        "Computer Science and Engineering (CSE)",
        "Civil and Environmental Engineering (CEE)",
        "Technical and Vocational Education (TVE)",
        "Business and Technology Management (BTM)",
        "Natural Sciences (NSc)"
    ];

    const departmentProgrammes = {
        "Computer Science and Engineering (CSE)": [
            "B.Sc. in CSE",
            "B.Sc. in SWE",
            "M.Sc. in CSE",
            "M.Engg. in CSE",
            "M.Sc. in CSA",
            "PhD in CSE"
        ],
        "Electrical and Electronic Engineering (EEE)": [
            "B.Sc. in EEE",
            "M.Sc. in EEE",
            "M.Engg. in EEE",
            "PhD in EEE"
        ],
        "Civil and Environmental Engineering (CEE)": [
            "B.Sc. in CEE",
            "M.Sc. in CEE",
            "M.Engg. in CEE",
            "PhD in CEE"
        ],
        "Mechanical and Production Engineering (MPE)": [
            "B.Sc. in ME",
            "B.Sc. in IPE",
            "M.Sc. in ME",
            "M.Engg. in ME",
            "PhD in ME"
        ],
        "Technical and Vocational Education (TVE)": [
            "B.Sc. in TE",
            "M.Sc. in TE",
            "PGD in TE",
            "PhD in TE"
        ],
        "Natural Sciences (NSc)": [
            "NSc"
        ],
        "Business and Technology Management (BTM)": [
            "BBA in TM"
        ]
    };

    const isValidSelection = () => {
        const roleSelected = alumniActive || studentActive;

        let batchValid = false;
        if (selectedBatch) {
            const year = parseInt(selectedBatch);
            if (alumniActive && year >= 1986 && year <= 2020) {
                batchValid = true;
            } else if (studentActive && year >= 2021 && year <= 2024) {
                batchValid = true;
            }
        }

        const departmentValid = selectedDepartment && validDepartments.includes(selectedDepartment);
        const programmeValid = selectedProgramme && departmentProgrammes[selectedDepartment]?.includes(selectedProgramme);

        return roleSelected && batchValid && departmentValid && programmeValid;
    };


    const handleNext = () => {
        if (step < 6) {
            setStep(step + 1);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const users = await axiosInstance.get('/api/v1/users');
            const dbUser = users.data.data.find(u => u.uid === user.uid);
            if (!dbUser) {
                throw new Error("User Profile not found.");
            }

            const role = alumniActive ? 'ALUMNI' : 'STUDENT';
            const payload = {
                role,
                gender: selectedGender,
                contactNo: contactNo || null,
                bio: bio || null,
                profileImage: profileImageUrl || null
            };

            const mappedSkills = Array.isArray(selectedSkills) ? selectedSkills.map(s => s.name) : [];
            const mappedPreferences = Array.isArray(selectedPreferences) ? selectedPreferences.map(p => p.name) : [];

            if (role === 'STUDENT') {
                payload.studentProfile = {
                    upsert: {
                        create: {
                            department: selectedDepartment,
                            program: selectedProgramme,
                            batch: selectedBatch,
                            skills: mappedSkills,
                            interestedDomains: mappedPreferences,
                            currentCompany: jobPlace || null,
                            currentPosition: jobPosition || null,
                            resumeUrl: resumeUrl || null,
                            githubUrl: githubUrl || null,
                            portfolioUrl: portfolioUrl || null,
                        },
                        update: {
                            department: selectedDepartment,
                            program: selectedProgramme,
                            batch: selectedBatch,
                            skills: mappedSkills,
                            interestedDomains: mappedPreferences,
                            currentCompany: jobPlace || null,
                            currentPosition: jobPosition || null,
                            resumeUrl: resumeUrl || null,
                            githubUrl: githubUrl || null,
                            portfolioUrl: portfolioUrl || null,
                        }
                    }
                };
            } else if (role === 'ALUMNI') {
                payload.alumniProfile = {
                    upsert: {
                        create: {
                            department: selectedDepartment,
                            program: selectedProgramme,
                            batch: selectedBatch,
                            graduationYear: 0,
                            skills: mappedSkills,
                            interestedDomains: mappedPreferences,
                            currentCompany: jobPlace || null,
                            currentPosition: jobPosition || null,
                            resumeUrl: resumeUrl || null,
                            githubUrl: githubUrl || null,
                            portfolioUrl: portfolioUrl || null,
                        },
                        update: {
                            department: selectedDepartment,
                            program: selectedProgramme,
                            batch: selectedBatch,
                            graduationYear: 0,
                            skills: mappedSkills,
                            interestedDomains: mappedPreferences,
                            currentCompany: jobPlace || null,
                            currentPosition: jobPosition || null,
                            resumeUrl: resumeUrl || null,
                            githubUrl: githubUrl || null,
                            portfolioUrl: portfolioUrl || null,
                        }
                    }
                };
            }

            await axiosInstance.patch(`/api/v1/users/${dbUser.id}`, payload);

            setNotification({
                type: "success",
                title: "Profile Setup Completed",
                message: "Your profile has been successfully set up!",
                duration: 3000
            });

            setTimeout(() => {
                router.push('/');
            }, 3000);

        } catch (err) {
            setNotification({
                type: "error",
                title: "Setup Failed",
                message: err.message || String(err),
                duration: 5000
            });
        } finally {
            setIsLoading(false);
        }
    };

    const isAlumniActive = () => {
        setAlumniActive(true);
        setStudentActive(false);
        setSelectedBatch('');
    }

    const isStudentActive = () => {
        setStudentActive(true);
        setAlumniActive(false);
        setSelectedBatch('');
    }

    const isYesActive = () => {
        setYesActive(true);
        setNoActive(false);
    }

    const isNoActive = () => {
        setNoActive(true);
        setYesActive(false);
    }

    const handlePhotoUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) {
            return;
        }

        setSelectedPhotoName(file.name);
        setIsUploading(true);

        try {
            const formData = new FormData();
            formData.append('image', file);

            const res = await fetch(`https://api.imgbb.com/1/upload?key=${process.env.NEXT_PUBLIC_IMGBB_API_KEY}`,
                {
                    method: 'POST',
                    body: formData,
                }
            );

            const data = await res.json();

            if (data.success) {
                setProfileImageUrl(data.data.url);
            }
            else {
                setNotification({
                    type: "error",
                    title: "Error!",
                    message: "Photo upload failed",
                    duration: 5000
                });
            }
        }
        catch (err) {
            setNotification({
                type: "error",
                title: "Error!",
                message: err.message || String(err),
                duration: 5000
            });
        }
        finally {
            setIsUploading(false);
        }
    }

    const handleInput = () => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = `${textarea.scrollHeight}px`;
        }
    };

    return <div className="flex items-center justify-center p-4">
        {notification && (
            <div className="fixed top-4 right-4 z-50">
                <Notification
                    type={notification.type}
                    title={notification.title}
                    message={notification.message}
                    showIcon={true}
                    duration={notification.duration}
                    onClose={() => setNotification(null)}
                />
            </div>
        )}
        <div className="w-full max-w-md">
            { }
            <div className="mb-6">
                <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Step {step} of 6</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">{Math.round(step / 6 * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2 overflow-hidden">
                    <div className="signin-progress bg-gray-900 dark:bg-gray-100 h-2 rounded-full transition-all duration-500 ease-out" style={{
                        width: `${step / 6 * 100}%`
                    }} />
                </div>
            </div>

            { }
            <div className="signin-card bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm p-6">
                { }
                <div className="text-center mb-6">
                    <div className="flex justify-center">
                        <Image src={logo} alt='ALUMNET' width={80} height={80}></Image>
                    </div>
                    <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                        Complete Your Profile
                    </h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        {step === 1 && "Let's start with your basic information"}
                        {step === 2 && "Now, Upload your photo or skip"}
                        {step === 3 && "Tell us about yourself"}
                        {step === 4 && "Tell us about your job"}
                        {step === 5 && "Additional Information"}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    { }
                    <div className={`${step === 1 ? '' : 'hidden'} signin-step space-y-4`}>
                        <div className="space-y-2">
                            <label>Select Your Role<span className='text-red-500'>*</span></label>
                            <div className="relative flex justify-center gap-20">
                                <button type='button' onClick={isAlumniActive} className={alumniActive ? "bg-transparent text-zinc-900 rounded-xl px-5 py-3 border-2 border-zinc-900" : "bg-zinc-900 text-white rounded-xl px-5 py-3 hover:bg-zinc-900/90 hover:cursor-pointer"}>{alumniActive ? "ALUMNI" : "ALUMNI"}</button>
                                <button type='button' onClick={isStudentActive} className={studentActive ? "bg-transparent text-zinc-900 rounded-xl px-5 py-3 border-2 border-zinc-900" : "bg-zinc-900 text-white rounded-xl px-5 py-3 hover:bg-zinc-900/90 hover:cursor-pointer"}>{studentActive ? "STUDENT " : "STUDENT"}</button>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label>Your Batch<span className='text-red-500'>*</span></label>
                            <BatchYearDropdown
                                role={alumniActive ? 'ALUMNI' : studentActive ? 'STUDENT' : null}
                                value={selectedBatch}
                                onSelect={setSelectedBatch}
                            />
                        </div>
                        <div className="space-y-2">
                            <label>Your Department<span className='text-red-500'>*</span></label>
                            <DepartmentDropdown value={selectedDepartment} onSelect={setSelectedDepartment}></DepartmentDropdown>
                        </div>
                        <div className="space-y-2">
                            <label>Your Programme<span className='text-red-500'>*</span></label>
                            <ProgrammeDropdown selectedDepartment={selectedDepartment} value={selectedProgramme} onSelect={setSelectedProgramme}></ProgrammeDropdown>
                        </div>
                        <button type="button" onClick={handleNext} disabled={!isValidSelection()} className="signin-button w-full bg-gray-900 dark:bg-gray-100 hover:cursor-pointer text-white dark:text-gray-900 py-2 px-4 rounded-md text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-black transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                            Next Step
                            <ArrowRightIcon />
                        </button>
                    </div>

                    <div className={`${step === 2 ? '' : 'hidden'} signin-step space-y-4 relative`}>
                        <button type="button" onClick={handleNext} className="absolute top-0 right-0 flex items-center justify-end hover:cursor-pointer text-zinc-900 hover:text-zinc-900/90">
                            Skip
                            <ChevronLast width={20} />
                        </button>

                        <div className='flex justify-center pt-12'>
                            <Image src={profileImageUrl || placholderUser} alt='user' width={200} height={200} className='rounded-full object-cover'></Image>
                        </div>

                        <div className='mt-10'>
                            <input
                                id="photo-upload"
                                type="file"
                                accept=".png,.jpg,.jpeg,.webp"
                                className="hidden"
                                onChange={handlePhotoUpload}
                            />
                            <label htmlFor="photo-upload" className='border-2 border-zinc-900 w-full rounded-md hover:cursor-pointer hover:text-zinc-900/90 hover:border-zinc-900/90 block'>
                                <p className='flex items-center gap-2 p-2 justify-center'><ImageUp />
                                    {isUploading ? "Uploading..." : "Upload your photo"}
                                </p>
                            </label>
                            {selectedPhotoName && <p className='text-center text-sm text-gray-600 dark:text-gray-400 mt-2'>{selectedPhotoName}</p>}
                        </div>

                        <button type="button" onClick={handleNext} disabled={!profileImageUrl} className="signin-button w-full hover:cursor-pointer bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 py-2 px-4 rounded-md text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-black transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                            Next Step
                            <ArrowRightIcon />
                        </button>
                    </div>

                    <div className={`${step === 3 ? '' : 'hidden'} signin-step space-y-4`}>
                        <div className="flex flex-col">
                            <label>Bio</label>
                            <textarea ref={textareaRef} rows={1} value={bio} onChange={(e) => { setBio(e.target.value); handleInput(); }} onInput={handleInput} name="bio" id="bio" placeholder='Write about yourself' className='signin-input w-full px-3 py-2 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-md text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:border-transparent transition-all duration-200'></textarea>
                        </div>
                        <div className="space-y-2">
                            <label>Gender<span className='text-red-500'>*</span></label>
                            <GenderDropdown onSelect={setSelectedGender} selectedGender={selectedGender} />
                        </div>
                        <div className="space-y-2">
                            <label>Contact No.</label>
                            <input name="contactNo" id="contactNo" value={contactNo} onChange={(e) => setContactNo(e.target.value)} placeholder='01XXXXXXXXX' className='signin-input w-full px-3 py-2 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-md text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:border-transparent transition-all duration-200'></input>
                        </div>
                        <div className="space-y-2">
                            <label>What Are You Interested In?</label>
                            <PreferencesMultiSelect selectedOptions={selectedPreferences} setSelectedOptions={setSelectedPreferences}></PreferencesMultiSelect>

                        </div>
                        <div className="space-y-2">
                            <label>Skills</label>
                            <SkillsMultiSelect selectedOptions={selectedSkills} setSelectedOptions={setSelectedSkills}></SkillsMultiSelect>
                        </div>
                        <button type="button" onClick={handleNext} disabled={!selectedGender} className="signin-button w-full bg-gray-900 dark:bg-gray-100 hover:cursor-pointer text-white dark:text-gray-900 py-2 px-4 rounded-md text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-black transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                            Next Step
                            <ArrowRightIcon />
                        </button>
                    </div>

                    <div className={`${step === 4 ? '' : 'hidden'} signin-step space-y-4`}>
                        <div className="space-y-2">
                            <label>Are you a job holder?<span className='text-red-500'>*</span></label>
                            <div className="relative flex justify-center gap-20">
                                <button type='button' onClick={isYesActive} className={yesActive ? "bg-transparent text-zinc-900 rounded-xl px-5 py-3 hover:text-white border-2 border-zinc-900" : "bg-zinc-900 text-white rounded-xl px-5 py-3 hover:bg-zinc-900/90 hover:cursor-pointer"}>{yesActive ? "YES" : "YES"}</button>
                                <button type='button' onClick={isNoActive} className={noActive ? "bg-transparent text-zinc-900 rounded-xl px-5 py-3 hover:text-white border-2 border-zinc-900" : "bg-zinc-900 text-white rounded-xl px-5 py-3 hover:bg-zinc-900/90 hover:cursor-pointer"}>{noActive ? "NO" : "NO"}</button>
                            </div>
                        </div>

                        {
                            yesActive ? <>
                                <div className="space-y-2">
                                    <label>Jobplace<span className='text-red-500'>*</span></label>
                                    <input name="jobPlace" id="jobPlace" value={jobPlace} onChange={(e) => setJobPlace(e.target.value)} placeholder='Your current jobplace' className='signin-input w-full px-3 py-2 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-md text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:border-transparent transition-all duration-200'></input>
                                </div>

                                <div className="space-y-2">
                                    <label>Your Position<span className='text-red-500'>*</span></label>
                                    <input name="position" id="position" value={jobPosition} onChange={(e) => setJobPosition(e.target.value)} placeholder='Your current position at job' className='signin-input w-full px-3 py-2 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-md text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:border-transparent transition-all duration-200'></input>
                                </div>
                            </> : <></>
                        }

                        <button type="button" onClick={handleNext} disabled={(!yesActive && !noActive) || (yesActive && (!jobPlace.trim() || !jobPosition.trim()))} className="signin-button w-full bg-gray-900 dark:bg-gray-100 hover:cursor-pointer text-white dark:text-gray-900 py-2 px-4 rounded-md text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-black transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                            {
                                yesActive ? "Next Step" : "Skip"
                            }
                            <ArrowRightIcon />
                        </button>
                    </div>

                    <div className={`${step === 5 ? '' : 'hidden'} signin-step space-y-4`}>
                        <div className="space-y-2">
                            <label>Resume URL</label>
                            <input name="resume" id="resume" value={resumeUrl} onChange={(e) => setResumeUrl(e.target.value)} placeholder='https://drive.google.com/...' className='signin-input w-full px-3 py-2 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-md text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:border-transparent transition-all duration-200'></input>
                        </div>

                        <div className="space-y-2">
                            <label>Github Link</label>
                            <input name="github" id="github" value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} placeholder='https://github.com/...' className='signin-input w-full px-3 py-2 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-md text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:border-transparent transition-all duration-200'></input>
                        </div>

                        <div className="space-y-2">
                            <label>Portfolio Link</label>
                            <input name="portfolio" id="portfolio" value={portfolioUrl} onChange={(e) => setPortfolioUrl(e.target.value)} placeholder='https://portfolio.com/...' className='signin-input w-full px-3 py-2 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-md text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:border-transparent transition-all duration-200'></input>
                        </div>

                        <button type="button" onClick={handleNext} className="signin-button w-full bg-gray-900 dark:bg-gray-100 hover:cursor-pointer text-white dark:text-gray-900 py-2 px-4 rounded-md text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-black transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                            Next Step
                            <ArrowRightIcon />
                        </button>
                    </div>

                    <div className={`${step === 6 ? '' : 'hidden'} signin-step space-y-4`}>
                        <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 rounded-md">
                            <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                                <CheckIcon />
                                Review Details
                            </h3>
                            <p>Role : {alumniActive ? "ALUMNI" : "STUDENT"}</p>
                            <p>Batch : {selectedBatch}</p>
                            <p>Department : {selectedDepartment}</p>
                            <p>Programme : {selectedProgramme}</p>
                            <p>Bio: {bio ? `${bio}` : "N\\A"}</p>
                            <p>Gender: {selectedGender}</p>
                            <p>Contact No: {contactNo ? `${contactNo}` : "N\\A"}</p>
                            <p>Job Place: {jobPlace ? `${jobPlace}` : "N\\A"}</p>
                            <p>Job Position: {jobPosition ? `${jobPosition}` : "N\\A"}</p>
                            <p>Resume URL: {resumeUrl ? <a href={resumeUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline dark:text-blue-400 break-all">{resumeUrl}</a> : "N\\A"}</p>
                            <p>Github URL: {githubUrl ? <a href={githubUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline dark:text-blue-400 break-all">{githubUrl}</a> : "N\\A"}</p>
                            <p>Portfolio URL: {portfolioUrl ? <a href={portfolioUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline dark:text-blue-400 break-all">{portfolioUrl}</a> : "N\\A"}</p>
                        </div>

                        <button type="submit" disabled={isLoading} className="signin-button w-full bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 py-2 px-4 rounded-md text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-black transition-all duration-200 disabled:opacity-50 hover:cursor-pointer disabled:cursor-not-allowed">
                            {isLoading ? <div className="flex items-center justify-center gap-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white dark:border-gray-900 border-t-transparent"></div>
                                Completing your profile...
                            </div> : 'Complete Profile'}
                        </button>
                    </div>
                </form>

                { }
                {step > 1 && <button onClick={() => setStep(step - 1)} className="mt-4 w-full text-gray-600 dark:text-gray-400 hover:text-gray-900 hover:cursor-pointer dark:hover:text-gray-100 transition-colors text-sm font-medium flex items-center justify-center gap-2">
                    <ArrowLeftIcon />
                    Back to previous step
                </button>}

                { }
            </div>
        </div>
    </div>;
};
export default ProfileSetupForm;
const styles = `
  .signin-input:focus {
    box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.1);
  }

  .dark .signin-input:focus {
    box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.1);
  }

  .signin-button:hover {
    transform: translateY(-1px);
  }

  .signin-progress {
    transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  }

  @keyframes slideIn {
    from { opacity: 0; transform: translateX(20px); }
    to { opacity: 1; transform: translateX(0); }
  }

  .signin-step {
    animation: slideIn 0.3s ease-out;
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .signin-card {
    animation: fadeIn 0.3s ease-out;
  }
`;
if (typeof document !== 'undefined') {
    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
}