'use client';

import React, { useState } from 'react';
import logo from '../../../../public/icon.png';
import placholderUser from "../../../../public/placeholder-user.jpg";
import Image from 'next/image';
import Button from '../button';
import { Check, ChevronLast, ImageUp } from 'lucide-react';
import DepartmentDropdown from '../DepartmentDropdown/DepartmentDropdown';
import ProgrammeDropdown from '../ProgrammeDropdown/ProgrammeDropdown';
import BatchYearDropdown from '../BatchYearDropdown/BatchYearDropdown';
const UserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
</svg>;
const MailIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
    <polyline points="22,6 12,13 2,6"></polyline>
</svg>;
const LockIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
    <circle cx="12" cy="16" r="1"></circle>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
</svg>;
const EyeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
    <circle cx="12" cy="12" r="3"></circle>
</svg>;
const EyeOffIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
    <line x1="1" y1="1" x2="23" y2="23"></line>
</svg>;
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
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [step, setStep] = useState(1);
    const [alumniActive, setAlumniActive] = useState(false);
    const [studentActive, setStudentActive] = useState(false);
    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [selectedProgramme, setSelectedProgramme] = useState('');
    const [selectedBatch, setSelectedBatch] = useState('');
    const [selectedPhotoName, setSelectedPhotoName] = useState('');

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

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleNext = () => {
        if (step < 5) {
            setStep(step + 1);
        }
    };

    const handleSubmit = e => {
        e.preventDefault();
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
        }, 2000);
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

    const handlePhotoUpload = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setSelectedPhotoName(file.name);
    }

    return <div className="flex items-center justify-center p-4">
        <div className="w-full max-w-md">
            { }
            <div className="mb-6">
                <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Step {step} of 5</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">{Math.round(step / 5 * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2 overflow-hidden">
                    <div className="signin-progress bg-gray-900 dark:bg-gray-100 h-2 rounded-full transition-all duration-500 ease-out" style={{
                        width: `${step / 5 * 100}%`
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
                        {step === 3 && "Almost done! Review your details"}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    { }
                    {step === 1 && <div className="signin-step space-y-4">
                        <div className="space-y-2">
                            <h4 className='mb-5'>Select Your Role</h4>
                            <div className="relative flex justify-center gap-20">
                                <Button onClick={isAlumniActive} className={alumniActive? "bg-transparent text-zinc-900 hover:text-white border-2 border-zinc-900" : "bg-zinc-900"} variant="default" size="lg">{alumniActive? "ALUMNI" : "ALUMNI"}{alumniActive? <Check/> : <></>}</Button>
                                <Button onClick={isStudentActive} className={studentActive? "bg-transparent text-zinc-900 hover:text-white border-2 border-zinc-900" : "bg-zinc-900"} variant="default" size="lg">{studentActive? "STUDENT" : "STUDENT"}{studentActive? <Check/> : <></>}</Button>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <h4 className='mb-5'>Your Batch</h4>
                            <BatchYearDropdown 
                              role={alumniActive ? 'ALUMNI' : studentActive ? 'STUDENT' : null}
                              onSelect={setSelectedBatch}
                            />
                        </div>
                        <div className="space-y-2">
                            <h4 className='mb-5'>Your Department</h4>
                            <DepartmentDropdown onSelect={setSelectedDepartment}></DepartmentDropdown>
                        </div>
                        <div className="space-y-2">
                            <h4 className='mb-5'>Your Programme</h4>
                            <ProgrammeDropdown selectedDepartment={selectedDepartment} onSelect={setSelectedProgramme}></ProgrammeDropdown>
                        </div>
                        <button type="button" onClick={handleNext} disabled={!isValidSelection()} className="signin-button w-full bg-gray-900 dark:bg-gray-100 hover:cursor-pointer text-white dark:text-gray-900 py-2 px-4 rounded-md text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-black transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                            Next Step
                            <ArrowRightIcon />
                        </button>
                    </div>}

                    { }
                    {step === 2 && <div className="signin-step space-y-4 relative">
                        <button type="button" onClick={handleNext} className="absolute top-0 right-0 flex items-center justify-end hover:cursor-pointer text-zinc-900 hover:text-zinc-900/90">
                            Skip
                            <ChevronLast width={20}/>
                        </button>

                        <div className='flex justify-center pt-12'>
                            <Image src={placholderUser} alt='user' width={200} height={200} className='rounded-full'></Image>
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
                                Upload Your Photo</p>
                            </label>
                            {selectedPhotoName && <p className='text-center text-sm text-gray-600 dark:text-gray-400 mt-2'>{selectedPhotoName}</p>}
                        </div>
                        
                        <button type="button" onClick={handleNext} disabled={!email || !password} className="signin-button w-full hover:cursor-pointer bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 py-2 px-4 rounded-md text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-black transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                            Next Step
                            <ArrowRightIcon />
                        </button>
                    </div>}

                    { }
                    {step === 3 && <div className="signin-step space-y-4">
                        <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 rounded-md">
                            <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                                <CheckIcon />
                                Review Details
                            </h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between items-center py-1">
                                    <span className="text-gray-600 dark:text-gray-400">Name:</span>
                                    <span className="text-gray-900 dark:text-gray-100 font-medium">{fullName}</span>
                                </div>
                                <div className="flex justify-between items-center py-1">
                                    <span className="text-gray-600 dark:text-gray-400">Email:</span>
                                    <span className="text-gray-900 dark:text-gray-100 font-medium">{email}</span>
                                </div>
                                <div className="flex justify-between items-center py-1">
                                    <span className="text-gray-600 dark:text-gray-400">Password:</span>
                                    <span className="text-gray-900 dark:text-gray-100 font-medium">••••••••</span>
                                </div>
                            </div>
                        </div>

                        <button type="submit" disabled={isLoading} className="signin-button w-full bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 py-2 px-4 rounded-md text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-black transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
                            {isLoading ? <div className="flex items-center justify-center gap-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white dark:border-gray-900 border-t-transparent"></div>
                                Creating account...
                            </div> : 'Create account'}
                        </button>
                    </div>}
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