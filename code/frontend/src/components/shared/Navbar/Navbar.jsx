"use client";

import React, { useState, useEffect } from 'react';
import { Menu, X, ExternalLink, House, Users } from 'lucide-react';
import logo from "../../../../public/logo.png";
import Image from 'next/image';
import { useAuth } from '@/context/AuthProvider';
import Link from 'next/link';
import UserProfileDropdown from '@/components/ui/UserProfileDropdown/UserProfileDropdown';
const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const { user, logout } = useAuth();

    const handleLogOut = () => {
        logout().catch(err => {
            console.error("Log out failed:", err);
        });
    }

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) {
                setIsMenuOpen(false);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    const navLinks = [{
        href: "\\",
        label: "Home",
        icon: <House />
    }, {
        href: "#users",
        label: "S",
        icon: <Users />
    }];

    return <header className={`sticky top-0 z-50 w-full transition-all duration-300 ${isScrolled ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg shadow-lg' : 'bg-white/90 dark:bg-gray-900/80 backdrop-blur-md'} border-b border-gray-200 dark:border-gray-800`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
            <div className="flex h-14 sm:h-16 lg:h-20 items-center justify-between">
                { }
                <div className="flex items-center">
                    <Link href={"/"} className="flex items-center space-x-2 group">
                        <Image src={logo} alt='ALUMNET' width={210}></Image>
                    </Link>
                </div>

                { }
                <nav className="hidden md:flex items-center space-x-4 lg:space-x-6 xl:space-x-8">
                    {navLinks.map(link => (
                        <a key={link.href} href={link.href} className="relative group flex items-center text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                            {link.icon}
                            <span className="pointer-events-none absolute top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-900 dark:bg-gray-100 px-2.5 py-1 text-xs font-medium text-white dark:text-gray-900 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-md">
                                {link.label}
                            </span>
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gray-900 dark:bg-gray-100 transition-all duration-300 group-hover:w-full"></span>
                        </a>
                    ))}
                </nav>

                { }
                {
                    user ? <>
                        <UserProfileDropdown></UserProfileDropdown>
                    </> : <>
                        <div className="hidden md:flex items-center space-x-2 lg:space-x-3">
                            <Link href={"/login"} className="flex items-center space-x-1.5 lg:space-x-2 px-3 lg:px-4 py-1.5 lg:py-2 text-xs lg:text-sm font-medium text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-all hover:shadow-md">
                                Sign In
                            </Link>
                            <Link href={"/register"} className="px-4 lg:px-6 py-1.5 lg:py-2 text-xs lg:text-sm font-medium bg-gray-900 text-white dark:bg-gray-50 dark:text-gray-900 rounded-md hover:bg-gray-800 dark:hover:bg-gray-200 transition-all shadow-sm hover:shadow-lg transform hover:scale-105">
                                Sign Up
                            </Link>
                        </div>
                    </>
                }
                { }
                <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors" aria-label="Toggle menu">
                    {isMenuOpen ? <X className="h-5 w-5 sm:h-6 sm:w-6" /> : <Menu className="h-5 w-5 sm:h-6 sm:w-6" />}
                </button>
            </div>

            { }
            <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="py-4 border-t border-gray-200 dark:border-gray-800">
                    <div className="flex flex-col space-y-1">
                        {navLinks.map(link => (
                            <a key={link.href} href={link.href} onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 px-3 py-2.5 text-sm sm:text-base font-medium text-gray-600 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                {link.icon}
                                <span>{link.label}</span>
                            </a>
                        ))}
                        {user ? (
                            <UserProfileDropdown></UserProfileDropdown>
                        ) : (
                            <div className="pt-4 mt-2 border-t border-gray-200 dark:border-gray-700 flex flex-col space-y-2">
                                <Link href={"/login"} onClick={() => setIsMenuOpen(false)} className="flex items-center justify-center space-x-2 px-3 py-2.5 text-sm font-medium border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                    Sign In
                                </Link>
                                <Link href={"/register"} onClick={() => setIsMenuOpen(false)} className="px-3 py-2.5 text-sm font-medium bg-gray-900 text-white dark:bg-gray-50 dark:text-gray-900 rounded-md hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors">
                                    Sign Up
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    </header>;
};
export default Navbar;