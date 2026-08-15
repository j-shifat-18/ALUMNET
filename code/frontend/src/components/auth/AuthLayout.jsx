"use client";

import React from "react";
import Image from "next/image";
import authBg from "../../../public/iut-auth-bg.jpg";

export default function AuthLayout({
  children,
  heading = "Welcome to ALUMNET",
  subheading = "The exclusive networking platform for Islamic University of Technology students and alumni.",
}) {
  return (
    <div className="min-h-screen w-full grid lg:grid-cols-12 bg-white dark:bg-zinc-950 font-sans">
      <div className="relative hidden lg:flex lg:col-span-6 xl:col-span-7 flex-col justify-center items-start p-10 xl:p-14 overflow-hidden select-none text-left">
        <Image
          src={authBg}
          alt="IUT Campus"
          fill
          priority
          className="object-cover object-center"
        />

        <div className="absolute inset-0 bg-black/45" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/35 to-transparent" />

        <div className="relative z-10 space-y-3 max-w-xl text-left pl-2">
          <h1 className="text-3xl xl:text-4xl 2xl:text-5xl font-extrabold text-white tracking-tight leading-tight drop-shadow-lg">
            {heading}
          </h1>
          <p className="text-base xl:text-lg text-zinc-100 font-medium leading-relaxed drop-shadow">
            {subheading}
          </p>
        </div>
      </div>

      <div className="lg:col-span-6 xl:col-span-5 flex flex-col justify-center items-center p-4 sm:p-8 xl:p-12 overflow-y-auto min-h-screen bg-zinc-50 dark:bg-zinc-950">
        <div className="w-full max-w-md flex flex-col items-center">
          {children}
        </div>
      </div>
    </div>
  );
}
