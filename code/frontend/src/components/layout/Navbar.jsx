"use client";

import React, { useState, useEffect } from 'react';
import { Menu, X, House, Users, MessageSquare, Calendar, Bell, Briefcase, Sparkles } from 'lucide-react';
import logo from "../../../public/logo.png";
import Image from 'next/image';
import { useAuth } from '@/context/AuthProvider';
import { useSocket } from '@/context/SocketProvider';
import { useNotifications } from '@/context/NotificationProvider';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import UserProfileDropdown from '@/components/profile/UserProfileDropdown';
import NotificationDropdown from '@/components/notifications/NotificationDropdown';
import ThemeToggle from '@/components/ui/ThemeToggle';

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const { user } = useAuth();
    const { totalUnread } = useSocket() ?? {};
    const { unreadCount: notifUnreadCount } = useNotifications();
    const pathname = usePathname();

    const handleHomeClick = (e, href) => {
        if (href === "/" && pathname === "/") {
            window.dispatchEvent(new CustomEvent("refresh-feed"));
        }
    };

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
        href: "/",
        label: "Home",
        icon: <House />
    }, {
        href: "/network",
        label: "My Network",
        icon: <Users />
    },
    {
        href: "/matching",
        label: "Mentor Match",
        icon: <Sparkles />
    },
    {
        href: "/jobs",
        label: "Jobs",
        icon: <Briefcase />
    },
    {
        href: "/events",
        label: "Events",
        icon: <Calendar />
    },
     {
        href: "/chat",
        label: "Messages",
        icon: <MessageSquare />,
        badge: totalUnread > 0 ? (totalUnread > 99 ? "99+" : String(totalUnread)) : null,
    }];

    const isRouteActive = (href) => {
        if (href === "/") return pathname === "/";
        return pathname === href || pathname?.startsWith(`${href}/`);
    };

    return (
        <header className={`sticky top-0 z-50 w-full transition-all duration-300 ${isScrolled ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg shadow-lg' : 'bg-white/90 dark:bg-gray-900/80 backdrop-blur-md'} border-b border-gray-200 dark:border-gray-800`}>
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
                <div className="flex h-14 sm:h-16 lg:h-20 items-center justify-between">
                    <div className="flex items-center">
                        <Link href={"/"} onClick={(e) => handleHomeClick(e, "/")} className="flex items-center space-x-2 group">
                            <Image src={logo} alt='ALUMNET' width={180} className="w-36 sm:w-44 lg:w-48 h-auto object-contain dark:brightness-0 dark:invert transition-all" priority />
                        </Link>
                    </div>

                    <nav className="hidden md:flex items-center space-x-4 lg:space-x-6 xl:space-x-8">
                        {navLinks.map(link => {
                            const isActive = isRouteActive(link.href);
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={(e) => handleHomeClick(e, link.href)}
                                    className={`relative group flex items-center p-2 rounded-xl transition-all duration-200 ${
                                        isActive
                                            ? "text-blue-600 dark:text-blue-400 font-bold bg-blue-50/80 dark:bg-blue-950/40 [&>svg]:stroke-[2.5px]"
                                            : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100/60 dark:hover:bg-zinc-800/60"
                                    }`}
                                >
                                    {link.icon}
                                    {link.badge && (
                                        <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[9px] font-bold rounded-full flex items-center justify-center leading-none">
                                            {link.badge}
                                        </span>
                                    )}
                                    <span className="pointer-events-none absolute top-10 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-900 dark:bg-gray-100 px-2.5 py-1 text-xs font-medium text-white dark:text-gray-900 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-md z-50">
                                        {link.label}
                                    </span>
                                    {/* Active status */}
                                    <span
                                        className={`absolute -bottom-1.5 left-1/2 -translate-x-1/2 h-0.5 rounded-full transition-all duration-300 ${
                                            isActive
                                                ? "w-6 bg-blue-600 dark:bg-blue-400"
                                                : "w-0 bg-gray-900 dark:bg-gray-100 group-hover:w-4"
                                        }`}
                                    />
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="flex items-center space-x-1 sm:space-x-2">
                        <ThemeToggle />
                        {user && <NotificationDropdown />}
                        {user ? (
                            <UserProfileDropdown />
                        ) : (
                            <div className="hidden md:flex items-center space-x-2 lg:space-x-3">
                                <Link href={"/login"} className="flex items-center space-x-1.5 lg:space-x-2 px-3 lg:px-4 py-1.5 lg:py-2 text-xs lg:text-sm font-medium text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-all hover:shadow-md">
                                    Sign In
                                </Link>
                                <Link href={"/register"} className="px-4 lg:px-6 py-1.5 lg:py-2 text-xs lg:text-sm font-medium bg-gray-900 text-white dark:bg-gray-50 dark:text-gray-900 rounded-md hover:bg-gray-800 dark:hover:bg-gray-200 transition-all shadow-sm hover:shadow-lg transform hover:scale-105">
                                    Sign Up
                                </Link>
                            </div>
                        )}

                        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors" aria-label="Toggle menu">
                            {isMenuOpen ? <X className="h-5 w-5 sm:h-6 sm:w-6" /> : <Menu className="h-5 w-5 sm:h-6 sm:w-6" />}
                        </button>
                    </div>
                </div>

                <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="py-4 border-t border-gray-200 dark:border-gray-800">
                        <div className="flex flex-col space-y-1">
                            {navLinks.map(link => {
                                const isActive = isRouteActive(link.href);
                                return (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        onClick={() => setIsMenuOpen(false)}
                                        className={`flex items-center gap-3 px-3 py-2.5 text-sm sm:text-base font-medium rounded-xl transition-all ${
                                            isActive
                                                ? "bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-bold border-l-4 border-blue-600 dark:border-blue-400"
                                                : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                                        }`}
                                    >
                                        <span className={isActive ? "[&>svg]:stroke-[2.5px]" : ""}>
                                            {link.icon}
                                        </span>
                                        <span>{link.label}</span>
                                        {link.badge && (
                                            <span className="ml-auto min-w-[18px] h-[18px] px-1 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[10px] font-bold rounded-full flex items-center justify-center">
                                                {link.badge}
                                            </span>
                                        )}
                                    </Link>
                                );
                            })}
                            {user && (
                                <Link
                                    href="/notifications"
                                    onClick={() => setIsMenuOpen(false)}
                                    className={`flex items-center gap-3 px-3 py-2.5 text-sm sm:text-base font-medium rounded-xl transition-all ${
                                        pathname?.startsWith("/notifications")
                                            ? "bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-bold border-l-4 border-blue-600 dark:border-blue-400"
                                            : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                                    }`}
                                >
                                    <Bell className="w-5 h-5" />
                                    <span>Notifications</span>
                                    {notifUnreadCount > 0 && (
                                        <span className="ml-auto min-w-[18px] h-[18px] px-1 bg-blue-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                                            {notifUnreadCount > 99 ? "99+" : notifUnreadCount}
                                        </span>
                                    )}
                                </Link>
                            )}
                            {!user && (
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
        </header>
    );
};

export default Navbar;
