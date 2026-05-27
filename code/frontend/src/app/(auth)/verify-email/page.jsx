'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthProvider';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import icon from '../../../../public/icon.png';
import Notification from '@/components/ui/toast';
import { Mail, CheckCircle, RefreshCw, LogOut } from 'lucide-react';
import { auth } from '@/lib/firebase';
import { sendEmailVerification } from 'firebase/auth';

export default function VerifyEmailPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    if (!user) {
      router.push('/login');
    } else if (user.emailVerified) {
      router.push('/profile-setup');
    }
  }, [user, router]);

  const handleCheckVerification = async () => {
    if (!auth.currentUser) return;
    setIsChecking(true);
    try {
      await auth.currentUser.reload();
      const updatedUser = auth.currentUser;

      if (updatedUser.emailVerified) {
        setNotification({
          type: 'success',
          title: 'Email Verified!',
          message: 'Complete your profile to get started.',
          duration: 3000,
        });
        setTimeout(() => {
          router.push('/profile-setup');
        }, 3000);
      } else {
        setNotification({
          type: 'warning',
          title: 'Not Verified Yet',
          message: 'Please check your email and verify your email.',
          duration: 5000,
        });
      }
    } catch (err) {
      setNotification({
        type: 'error',
        title: 'Check Failed',
        message: err.message || String(err),
        duration: 5000,
      });
    } finally {
      setIsChecking(false);
    }
  };

  const handleResendEmail = async () => {
    if (!auth.currentUser) return;
    setIsLoading(true);
    try {
      await sendEmailVerification(auth.currentUser);
      setNotification({
        type: 'success',
        title: 'Verification Email Sent!',
        message: 'A new link has been sent to your email address.',
        duration: 5000,
      });
    } catch (err) {
      setNotification({
        type: 'error',
        title: 'Failed to Send',
        message: err.message || String(err),
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (err) {
      console.error('Sign out failed:', err);
    }
  };

  if (!user) return null;

  return (
    <div className="relative w-full min-h-screen flex items-center justify-center font-sans overflow-hidden py-12 px-4 sm:px-6 lg:px-8 bg-zinc-50 dark:bg-zinc-950">
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

      <div className="relative w-full max-w-md p-8 space-y-6 bg-white dark:bg-black rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-lg dark:shadow-zinc-900/50">
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <Image src={icon} alt="ALUMNET" width={80} height={80} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
              Verify your email
            </h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
              We sent a verification link to <span className="font-semibold text-zinc-900 dark:text-white">{user.email}</span>
            </p>
          </div>
        </div>

        <div className="flex justify-center py-4">
          <div className="p-4 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 animate-pulse">
            <Mail className="h-12 w-12" />
          </div>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleCheckVerification}
            disabled={isChecking}
            className="w-full bg-primary inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors hover:cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 dark:focus-visible:ring-zinc-300 disabled:pointer-events-none disabled:opacity-50 text-zinc-50 shadow hover:bg-primary/70 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-50/90 h-10 px-4 py-2"
          >
            {isChecking ? (
              <span className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4 animate-spin" />
                Checking status...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                I have verified my email
              </span>
            )}
          </button>

          <button
            onClick={handleResendEmail}
            disabled={isLoading || isChecking}
            className="w-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:bg-zinc-50 dark:hover:bg-zinc-900 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors hover:cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 dark:focus-visible:ring-zinc-300 disabled:pointer-events-none disabled:opacity-50 text-zinc-900 dark:text-zinc-50 h-10 px-4 py-2"
          >
            {isLoading ? 'Sending new verification email' : 'Resend verification email'}
          </button>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-zinc-200 dark:border-zinc-800" />
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={handleSignOut}
            className="inline-flex items-center gap-2 text-sm font-medium text-red-600 dark:text-red-400 hover:underline transition-colors hover:cursor-pointer bg-transparent border-0"
          >
            <LogOut className="h-4 w-4" />
            Back to sign in
          </button>
        </div>
      </div>
    </div>
  );
}
