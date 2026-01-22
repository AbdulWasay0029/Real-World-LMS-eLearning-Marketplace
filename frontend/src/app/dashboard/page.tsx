"use client";
import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Plus, BookOpen, BarChart3, TrendingUp, Users, DollarSign, Layout, MonitorPlay } from 'lucide-react';
import axios from 'axios';

interface Course {
    _id: string;
    title: string;
    price: number;
    category: string;
    lessons: any[];
}

export default function Dashboard() {
    const { user, loading } = useAuth();
    const [activeTab, setActiveTab] = useState('overview');
    const [courses, setCourses] = useState<Course[]>([]);
    const [stats, setStats] = useState({ earnings: 0, students: 0, views: 0 });

    useEffect(() => {
        if (user && user.role === 'instructor') {
            // Fetch instructor courses
            fetchInstructorData();
        }
    }, [user]);

    const fetchInstructorData = async () => {
        try {
            // In a real app, you'd filter by instructor ID on backend or have a specific endpoint
            // For now fetching all and filtering locally or assuming backend handles it
            const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/courses`);
            // Mock filtering for demo if backend returns all
            const myCourses = res.data.filter((c: any) => c.instructor._id === user?._id || c.instructor === user?._id);
            setCourses(myCourses);
            setStats({
                earnings: myCourses.length * 150, // Mock data
                students: myCourses.length * 12,
                views: myCourses.length * 450
            });
        } catch (error) {
            console.error(error);
        }
    };

    if (loading) return <div className="min-h-screen pt-24 text-center">Loading...</div>;
    if (!user) return <div className="min-h-screen pt-24 text-center">Please log in</div>;

    const isInstructor = user.role === 'instructor';

    return (
        <div className="min-h-screen pt-24 px-6 pb-12">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">

                {/* Sidebar */}
                <div className="lg:col-span-1">
                    <div className="glass-panel rounded-2xl p-6 sticky top-24">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-xl font-bold text-white shadow-lg">
                                {user.name.charAt(0)}
                            </div>
                            <div>
                                <h3 className="font-bold text-white">{user.name}</h3>
                                <span className="text-xs uppercase tracking-wider text-accent font-semibold">{user.role}</span>
                            </div>
                        </div>

                        <nav className="space-y-2">
                            <button
                                onClick={() => setActiveTab('overview')}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'overview' ? 'bg-primary/20 text-white border border-primary/50' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                            >
                                <Layout className="w-5 h-5" />
                                Overview
                            </button>
                            <button
                                onClick={() => setActiveTab('courses')}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'courses' ? 'bg-primary/20 text-white border border-primary/50' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                            >
                                <BookOpen className="w-5 h-5" />
                                My Courses
                            </button>
                            {isInstructor && (
                                <button
                                    onClick={() => setActiveTab('analytics')}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'analytics' ? 'bg-primary/20 text-white border border-primary/50' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                                >
                                    <BarChart3 className="w-5 h-5" />
                                    Analytics
                                </button>
                            )}
                        </nav>
                    </div>
                </div>

                {/* Main Content */}
                <div className="lg:col-span-3">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        {/* Header Area */}
                        <div className="flex justify-between items-end">
                            <div>
                                <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
                                <p className="text-gray-400">Manage your learning journey</p>
                            </div>
                            {isInstructor && (
                                <Link href="/dashboard/create-course" className="bg-white text-black px-6 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors flex items-center gap-2 shadow-lg shadow-white/5">
                                    <Plus className="w-5 h-5" />
                                    Create Course
                                </Link>
                            )}
                        </div>

                        {/* Stats Grid (Instructor Only) */}
                        {isInstructor && activeTab === 'overview' && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group">
                                    <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                                        <DollarSign className="w-24 h-24" />
                                    </div>
                                    <h3 className="text-gray-400 text-sm font-medium mb-1">Total Earnings</h3>
                                    <p className="text-3xl font-bold text-white">${stats.earnings}</p>
                                </div>
                                <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group">
                                    <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                                        <Users className="w-24 h-24" />
                                    </div>
                                    <h3 className="text-gray-400 text-sm font-medium mb-1">Total Students</h3>
                                    <p className="text-3xl font-bold text-white">{stats.students}</p>
                                </div>
                                <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group">
                                    <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                                        <TrendingUp className="w-24 h-24" />
                                    </div>
                                    <h3 className="text-gray-400 text-sm font-medium mb-1">Course Views</h3>
                                    <p className="text-3xl font-bold text-white">{stats.views}</p>
                                </div>
                            </div>
                        )}

                        {/* Courses View */}
                        {(activeTab === 'overview' || activeTab === 'courses') && (
                            <div>
                                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                    <MonitorPlay className="w-5 h-5 text-primary" />
                                    {isInstructor ? 'Your Published Courses' : 'Enrolled Courses'}
                                </h2>

                                {courses.length === 0 ? (
                                    <div className="glass-panel rounded-2xl p-12 text-center border-dashed border-2 border-white/10">
                                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <BookOpen className="w-8 h-8 text-gray-400" />
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-300 mb-2">No Courses Found</h3>
                                        <p className="text-gray-500 max-w-sm mx-auto mb-6">
                                            {isInstructor
                                                ? "You haven't created any courses yet. Share your knowledge with the world!"
                                                : "You haven't enrolled in any courses yet. Browse our marketplace to get started."}
                                        </p>
                                        {isInstructor ? (
                                            <Link href="/dashboard/create-course" className="text-primary hover:text-accent font-semibold">
                                                Create your first course &rarr;
                                            </Link>
                                        ) : (
                                            <Link href="/courses" className="text-primary hover:text-accent font-semibold">
                                                Browse Courses &rarr;
                                            </Link>
                                        )}
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {courses.map(course => (
                                            <div key={course._id} className="glass-panel rounded-xl p-4 flex gap-4 hover:bg-white/5 transition-colors cursor-pointer group">
                                                <div className="w-24 h-24 bg-gray-800 rounded-lg flex-shrink-0 flex items-center justify-center">
                                                    <MonitorPlay className="text-gray-600 group-hover:text-primary transition-colors" />
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="font-bold text-lg mb-1">{course.title}</h3>
                                                    <div className="flex items-center gap-2 text-xs text-gray-400 mb-4">
                                                        <span className="bg-white/10 px-2 py-0.5 rounded text-gray-300">{course.category}</span>
                                                        <span>{course.lessons?.length || 0} Lessons</span>
                                                    </div>
                                                    <span className="font-bold text-primary">${course.price}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                    </motion.div>
                </div>
            </div>
        </div>
    );
}
