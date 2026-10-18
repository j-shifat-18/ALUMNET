'use client';

import React, { useState } from 'react';
import logo from "../../../public/icon.png";
import GoogleSignInButton from '@/components/auth/GoogleSignInButton';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/context/AuthProvider';
import { useRouter } from 'next/navigation';
import Notification from '@/components/ui/Toast';

const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-zinc-500 dark:text-zinc-400">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-zinc-500 dark:text-zinc-400">
    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
    <line x1="2" x2="22" y1="2" y2="22" />
  </svg>
);

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const { signInUser, resetPassword } = useAuth();
  const router = useRouter();

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!email) {
      setNotification({
        type: "warning",
        title: "Email Required",
        message: "Please enter your email address.",
        duration: 5000
      });
      return;
    }

    setIsLoading(true);
    try {
      await resetPassword(email);
      setNotification({
        type: "success",
        title: "Password Reset Email Sent!",
        message: `A password reset link has been sent to your email.`,
        duration: 5000
      });
    } catch (err) {
      setNotification({
        type: "error",
        title: "Reset Failed",
        message: err.message || String(err),
        duration: 5000
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const loggedUser = await signInUser(email, password);

      if (!loggedUser.emailVerified) {
        setNotification({
          type: "warning",
          title: "Email Not Verified",
          message: "Verify your email first to continue.",
          duration: 3000
        });
        setTimeout(() => {
          router.push("/verify-email");
        }, 1500);
        return;
      }

      setNotification({
        type: "success",
        title: "Successfully Logged In!",
        message: "Welcome back!",
        duration: 2000
      });

      setTimeout(() => {
        router.push("/");
      }, 1000);

    } catch (err) {
      setNotification({
        type: "error",
        title: "Failed to Log In!",
        message: err.message || String(err),
        duration: 5000
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="relative w-full flex items-center justify-center font-sans overflow-hidden">
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
      <div className="relative w-full max-w-md p-8 space-y-6 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-none">
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <Image src={logo} alt='ALUMNET' width={80} height={80} />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white">Welcome back</h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">Enter your credentials to sign in</p>
          </div>
        </div>

        <div>
          <GoogleSignInButton disabled={isLoading} />
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-zinc-200 dark:border-zinc-800" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white dark:bg-zinc-900 px-2 text-zinc-500 dark:text-zinc-400">
              Or continue with
            </span>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-zinc-900 dark:text-zinc-50">
              Email
            </label>
            <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="name@example.com" disabled={isLoading} className="flex h-9 w-full rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-5 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-zinc-500 dark:placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 dark:focus-visible:ring-zinc-300 disabled:cursor-not-allowed disabled:opacity-50" />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-zinc-900 dark:text-zinc-50">
              Password
            </label>
            <div className="relative">
              <input type={showPassword ? "text" : "password"} id="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password" disabled={isLoading} className="flex h-9 w-full rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-5 pr-10 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-zinc-500 dark:placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 dark:focus-visible:ring-zinc-300 disabled:cursor-not-allowed disabled:opacity-50" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="hover:cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </div>
          <button type="submit" disabled={isLoading || !email || !password} className="bg-zinc-900 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors hover:cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 dark:focus-visible:ring-zinc-300 disabled:pointer-events-none disabled:opacity-50 text-zinc-50 shadow hover:bg-zinc-900/90 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-50/90 h-9 px-4 py-2 w-full">
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white dark:border-gray-900 border-t-transparent"></div>
                Signing in...
              </div>
            ) : 'Sign in'}
          </button>
        </form>

        <div className="text-center space-y-2">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Don&apos;t have an account?{' '}
            <Link href={"/register"} className="font-medium text-zinc-900 dark:text-zinc-50 underline underline-offset-4 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors">
              Register
            </Link>
          </p>
          <button type="button" onClick={handleForgotPassword} className="text-sm font-medium text-zinc-900 dark:text-zinc-50 underline underline-offset-4 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors bg-transparent border-0 p-0 cursor-pointer">
            Forgot your password?
          </button>
        </div>
      </div>
    </div>
  );
}
