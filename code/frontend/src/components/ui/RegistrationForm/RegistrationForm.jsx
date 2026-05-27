'use client';

import React, { use, useState } from 'react';
import logo from "../../../../public/icon.png";
import GoogleSignInButton from '../GoogleSignInButton/GoogleSignInButton';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthProvider';
import axiosInstance from '@/lib/axios';
import { useRouter } from 'next/navigation';
import Notification from '../toast';

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
const SmallCheckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20,6 9,17 4,12"></polyline></svg>;
const SmallXIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;

const ValidationItem = ({ isValid, text }) => (
  <p className={`flex items-center gap-1.5 text-xs transition-colors ${isValid ? 'text-green-600 dark:text-green-400' : 'text-red-500'}`}>
    {isValid ? <SmallCheckIcon /> : <SmallXIcon />}
    <span>{text}</span>
  </p>
);

const RegistrationForm = () => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [notification, setNotification] = useState(null);

  const hasInvalidEmailChars = /\s|[A-Z]/.test(email);
  const hasValidEmailDomain = email.endsWith('@iut-dhaka.edu') && email.length > '@iut-dhaka.edu'.length;
  const isEmailValid = email.length > 0 && !hasInvalidEmailChars && hasValidEmailDomain;

  const hasPasswordLength = password.length >= 8;
  const hasPasswordUpper = /[A-Z]/.test(password);
  const hasPasswordLower = /[a-z]/.test(password);
  const hasPasswordNumber = /\d/.test(password);
  const isPasswordValid = password.length > 0 && hasPasswordLength && hasPasswordUpper && hasPasswordLower && hasPasswordNumber;

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  const { registerUser, updateUserProfile } = useAuth();

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const user = await registerUser(email, password);
      await updateUserProfile({ displayName: fullName });

      await axiosInstance.post("/api/v1/users", {
        uid: user.uid,
        name: fullName,
        email: user.email,
      });

      setNotification({
        type: "success",
        title: "Registration Successful!",
        message: "Verification email sent! Check your email and verify your account",
        duration: 3000
      });
      
      setTimeout(() => {
        router.push("/verify-email");
      }, 3000);
    } catch (err) {
      setNotification({
        type: "error",
        title: "Registration Failed!",
        message: err.message || String(err),
        duration: 5000
      });
    } finally {
      setIsLoading(false);
    }
  };

  return <div className="p-4 w-full flex justify-center">
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
    <div className="w-full max-w-sm">
      { }
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Step {step} of 3</span>
          <span className="text-sm text-gray-500 dark:text-gray-400">{Math.round(step / 3 * 100)}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2 overflow-hidden">
          <div className="signin-progress bg-zinc-900 dark:bg-gray-100 h-2 rounded-full transition-all duration-500 ease-out" style={{
            width: `${step / 3 * 100}%`
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
            Create account
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {step === 1 && "Let's start with your basic information"}
            {step === 2 && "Now, set up your credentials"}
            {step === 3 && "Almost done! Review your details"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          { }
          {step === 1 && <div className="signin-step space-y-4">
            <div className="space-y-2">
              <label htmlFor="fullName" className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Full Name
              </label>
              <div className="relative">
                <input name='name' id="fullName" type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Enter your full name" className="signin-input w-full px-3 py-2 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-md text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:border-transparent transition-all duration-200" />
                {fullName && <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500">
                  {!/\d/.test(fullName) && fullName && <CheckIcon />}
                </div>}
              </div>
            </div>
            <button type="button" onClick={handleNext} disabled={!fullName || /\d/.test(fullName)} className="signin-button w-full bg-zinc-900 dark:bg-gray-100 text-white dark:text-gray-900 py-2 px-4 rounded-md text-sm font-medium hover:bg-zinc-900/90 hover:cursor-pointer dark:hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-black transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              Next Step
              {<ArrowRightIcon />}
            </button>
            <GoogleSignInButton></GoogleSignInButton>
          </div>}

          { }
          {step === 2 && <div className="signin-step space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 dark:text-gray-500">
                  <MailIcon />
                </div>
                <input name='email' id="email" type="text" inputMode="email" value={email} onFocus={() => setIsEmailFocused(true)} onBlur={() => setIsEmailFocused(false)} onChange={e => setEmail(e.target.value)} placeholder="name@iut-dhaka.edu" className="signin-input w-full pl-9 pr-3 py-2 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-md text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:border-transparent transition-all duration-200" />
              </div>
              {isEmailFocused && (
                <div className="space-y-1 mt-2">
                  <ValidationItem isValid={email.length > 0 && !hasInvalidEmailChars} text="No spaces or uppercase letters" />
                  <ValidationItem isValid={hasValidEmailDomain} text="Ends with @iut-dhaka.edu" />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 dark:text-gray-500">
                  <LockIcon />
                </div>
                <input name='password' id="password" type={showPassword ? "text" : "password"} value={password} onFocus={() => setIsPasswordFocused(true)} onBlur={() => setIsPasswordFocused(false)} onChange={e => setPassword(e.target.value)} placeholder="Create a password" className="signin-input w-full pl-9 pr-10 py-2 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-md text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:border-transparent transition-all duration-200" />
                <button type="button" onClick={togglePasswordVisibility} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
              {isPasswordFocused && (
                <div className="space-y-1 mt-2">
                  <ValidationItem isValid={hasPasswordLength} text="At least 8 characters long" />
                  <ValidationItem isValid={hasPasswordUpper} text="At least one uppercase letter" />
                  <ValidationItem isValid={hasPasswordLower} text="At least one lowercase letter" />
                  <ValidationItem isValid={hasPasswordNumber} text="At least one number" />
                </div>
              )}
            </div>

            <button type="button" onClick={handleNext} disabled={!isEmailValid || !isPasswordValid} className="signin-button w-full bg-zinc-900 dark:bg-gray-100 text-white dark:text-gray-900 py-2 px-4 rounded-md text-sm font-medium hover:bg-zinc-900/90 hover:cursor-pointer dark:hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-black transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
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

            <button type="submit" disabled={isLoading} className="signin-button w-full bg-zinc-900 dark:bg-gray-100 text-white dark:text-gray-900 py-2 px-4 rounded-md text-sm font-medium hover:bg-zinc-900/90 hover:cursor-pointer dark:hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-black transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
              {isLoading ? <div className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white dark:border-gray-900 border-t-transparent"></div>
                Creating account...
              </div> : 'Create account'}
            </button>
          </div>}
        </form>

        { }
        {step > 1 && <button onClick={() => setStep(step - 1)} className="mt-4 w-full text-gray-600 dark:text-gray-400 hover:cursor-pointer hover:text-gray-900 dark:hover:text-gray-100 transition-colors text-sm font-medium flex items-center justify-center gap-2">
          <ArrowLeftIcon />
          Back to previous step
        </button>}

        { }
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <Link href={"/login"} className="text-gray-900 underline dark:text-gray-100 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  </div>;
};
export default RegistrationForm;
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