"use client";
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { signOut, signIn } from 'next-auth/react';
import { motion } from 'framer-motion';
import { Menu, X, Rocket, User, LogOut } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className="fixed top-0 w-full z-50 px-6 py-4">
            <div className="max-w-7xl mx-auto glass-panel rounded-2xl px-6 py-3 flex justify-between items-center transition-all duration-300">

                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="bg-primary/20 p-2 rounded-lg group-hover:bg-primary/30 transition-colors">
                        <Rocket className="w-6 h-6 text-accent" />
                    </div>
                    <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                        LMS Market
                    </span>
                </Link>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center gap-8">
                    <Link href="/courses" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">
                        Browse Courses
                    </Link>

                    {user ? (
                        <div className="flex items-center gap-6">
                            <Link href="/dashboard" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">
                                Dashboard
                            </Link>
                            <div className="h-4 w-px bg-white/10"></div>
                            <div className="flex items-center gap-3">
                                <span className="text-sm font-semibold text-white">{user.name}</span>
                                <button
                                    onClick={() => signOut()}
                                    className="bg-red-500/10 hover:bg-red-500/20 text-red-400 p-2 rounded-lg transition-colors"
                                >
                                    <LogOut className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={() => signIn()}
                            className="bg-white text-black px-5 py-2 rounded-full font-semibold text-sm hover:bg-gray-200 transition-all shadow-lg shadow-white/10"
                        >
                            Sign In
                        </button>
                    )}
                </div>

                {/* Mobile Toggle */}
                <button className="md:hidden text-white" onClick={() => setIsOpen(!isOpen)}>
                    {isOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute top-20 left-6 right-6 glass-panel rounded-2xl p-6 flex flex-col gap-4 md:hidden"
                >
                    <Link href="/courses" className="text-gray-200 py-2">Courses</Link>
                    {user ? (
                        <>
                            <Link href="/dashboard" className="text-gray-200 py-2">Dashboard</Link>
                            <button
                                onClick={() => signOut()}
                                className="text-red-400 text-left py-2"
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <button onClick={() => signIn()} className="bg-white text-black py-2 rounded-lg font-bold">
                            Sign In
                        </button>
                    )}
                </motion.div>
            )}
        </nav>
    );
}
