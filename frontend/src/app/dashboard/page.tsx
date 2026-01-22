"use client";
import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Plus, BookOpen, BarChart3, TrendingUp, Users, DollarSign, Layout, MonitorPlay, ArrowRight } from 'lucide-react';
import axios from 'axios';

interface Course {
    _id: string;
    title: string;
    price: number;
    category: string;
    studentCount?: number;
    lessons: any[];
}

export default function Dashboard() {
    const { user, loading } = useAuth();
    const [activeTab, setActiveTab] = useState('overview');
    const [courses, setCourses] = useState<Course[]>([]);
    const [stats, setStats] = useState({ earnings: 0, students: 0, views: 0 });
    const [fetchLoading, setFetchLoading] = useState(true);

    useEffect(() => {
        if (user) {
            if (user.role === 'instructor') {
                fetchInstructorData();
            } else {
                fetchStudentData();
            }
        }
    }, [user]);

    const fetchStudentData = async () => {
        try {
            // Use 'any' type cast here to bypass potential TS issues with session properties
            const token = user?.token || (user as any)?.accessToken;
            // Empty state handle logic is already inside the response rendering
            const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/courses/my/enrollments`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCourses(res.data);
            setStats({
                earnings: 0,
                students: res.data.length,
                views: res.data.length * 12 // Mock engagement metric
            });
        } catch (error) {
            console.error("Failed to fetch enrollments", error);
        } finally {
            setFetchLoading(false);
        }
    };

    const fetchInstructorData = async () => {
        try {
            const token = user?.token || (user as any)?.accessToken;
            const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/courses/my/created`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const myCourses = res.data;
            setCourses(myCourses);

            // Calculate stats from real data
            const totalStudents = myCourses.reduce((acc: number, curr: Course) => acc + (curr.studentCount || 0), 0);
            const totalEarnings = myCourses.reduce((acc: number, curr: Course) => acc + ((curr.studentCount || 0) * curr.price), 0);

            setStats({
                earnings: totalEarnings,
                students: totalStudents,
                views: totalStudents * 15 // Mock multiplier for views since we don't track pageviews yet
            });
        } catch (error) {
            console.error(error);
        } finally {
            setFetchLoading(false);
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
                                {isInstructor ? 'My Created Courses' : 'My Enrollments'}
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

                        {/* Overview Tab */}
                        {activeTab === 'overview' && (
                            <div className="space-y-8">
                                {/* Stats Row */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {isInstructor ? (
                                        <>
                                            <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group">
                                                <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                                                    <DollarSign className="w-24 h-24" />
                                                </div>
                                                <h3 className="text-gray-400 text-sm font-medium mb-1">Total Earnings</h3>
                                                <p className="text-3xl font-bold text-white">${stats.earnings.toFixed(2)}</p>
                                            </div>
                                            <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group">
                                                <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                                                    <Users className="w-24 h-24" />
                                                </div>
                                                <h3 className="text-gray-400 text-sm font-medium mb-1">Total Enrollments</h3>
                                                <p className="text-3xl font-bold text-white">{stats.students}</p>
                                            </div>
                                            <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group">
                                                <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                                                    <BarChart3 className="w-24 h-24" />
                                                </div>
                                                <h3 className="text-gray-400 text-sm font-medium mb-1">Course Views</h3>
                                                <p className="text-3xl font-bold text-white">{stats.views}</p>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group">
                                                <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                                                    <BookOpen className="w-24 h-24" />
                                                </div>
                                                <h3 className="text-gray-400 text-sm font-medium mb-1">Enrolled Courses</h3>
                                                <p className="text-3xl font-bold text-white">{courses.length}</p>
                                            </div>
                                            <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group">
                                                <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                                                    <MonitorPlay className="w-24 h-24" />
                                                </div>
                                                <h3 className="text-gray-400 text-sm font-medium mb-1">Active Learning</h3>
                                                <p className="text-3xl font-bold text-white">{courses.length}</p>
                                            </div>
                                        </>
                                    )}
                                </div>

                                {/* Recent Activity */}
                                <div>
                                    <div className="flex justify-between items-center mb-4">
                                        <h2 className="text-xl font-bold flex items-center gap-2">
                                            <TrendingUp className="w-5 h-5 text-primary" />
                                            Recent Activity
                                        </h2>
                                        <button onClick={() => setActiveTab('courses')} className="text-sm text-primary hover:text-accent">View All</button>
                                    </div>

                                    {fetchLoading ? (
                                        <div className="text-center py-10 opacity-50">Loading...</div>
                                    ) : courses.length > 0 ? (
                                        <div className="grid grid-cols-1 gap-4">
                                            {courses.slice(0, 3).map(course => (
                                                <Link href={`/courses/${course._id}`} key={course._id}>
                                                    <div className="glass-panel rounded-xl p-4 flex gap-4 hover:bg-white/5 transition-colors cursor-pointer group items-center">
                                                        <div className="w-16 h-16 bg-gray-800 rounded-lg flex-shrink-0 flex items-center justify-center">
                                                            <MonitorPlay className="text-gray-600 group-hover:text-primary transition-colors" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <h3 className="font-bold text-lg mb-1 group-hover:text-primary transition-colors">{course.title}</h3>
                                                            <div className="flex items-center gap-4 text-xs text-gray-400">
                                                                <span className="bg-white/10 px-2 py-0.5 rounded text-gray-300">{course.category}</span>
                                                            </div>
                                                        </div>
                                                        <div className="pr-4">
                                                            <ArrowRight className="w-5 h-5 text-gray-600 group-hover:text-white transition-colors" />
                                                        </div>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-12 text-gray-500 glass-panel rounded-xl">
                                            <p>No activity yet.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Courses Tab */}
                        {activeTab === 'courses' && (
                            <div>
                                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                    <MonitorPlay className="w-5 h-5 text-primary" />
                                    {isInstructor ? 'All Published Courses' : 'All Enrollments'}
                                </h2>

                                {fetchLoading ? (
                                    <div className="flex justify-center py-20">
                                        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
                                    </div>
                                ) : courses.length === 0 ? (
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
                                            <Link href="/dashboard/create-course" className="text-primary hover:text-accent font-semibold flex items-center justify-center gap-2">
                                                Create your first course <ArrowRight className="w-4 h-4" />
                                            </Link>
                                        ) : (
                                            <Link href="/courses" className="text-primary hover:text-accent font-semibold flex items-center justify-center gap-2">
                                                Browse Marketplace <ArrowRight className="w-4 h-4" />
                                            </Link>
                                        )}
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 gap-4">
                                        {courses.map(course => (
                                            <Link href={`/courses/${course._id}`} key={course._id}>
                                                <div className="glass-panel rounded-xl p-4 flex gap-4 hover:bg-white/5 transition-colors cursor-pointer group items-center">
                                                    <div className="w-20 h-20 bg-gray-800 rounded-lg flex-shrink-0 flex items-center justify-center">
                                                        <MonitorPlay className="text-gray-600 group-hover:text-primary transition-colors" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h3 className="font-bold text-lg mb-1 group-hover:text-primary transition-colors">{course.title}</h3>
                                                        <div className="flex items-center gap-4 text-xs text-gray-400">
                                                            <span className="bg-white/10 px-2 py-0.5 rounded text-gray-300">{course.category}</span>
                                                            {isInstructor && <span>{course.studentCount} Students</span>}
                                                            {!isInstructor && <span>Ready to watch</span>}
                                                        </div>
                                                    </div>
                                                    <div className="pr-4">
                                                        <ArrowRight className="w-5 h-5 text-gray-600 group-hover:text-white transition-colors" />
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Analytics Tab (Instructor Only) */}
                        {isInstructor && activeTab === 'analytics' && (
                            <div className="space-y-6">
                                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                    <BarChart3 className="w-5 h-5 text-primary" />
                                    Performance Analytics
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="glass-panel p-6 rounded-2xl">
                                        <h3 className="text-lg font-bold mb-6 text-gray-300">Earnings Breakdown</h3>
                                        <div className="h-48 flex items-end justify-between px-4 gap-2">
                                            {[35, 60, 45, 80, 55, 90, 70].map((h, i) => (
                                                <div key={i} className="w-full bg-primary/20 hover:bg-primary/40 transition-colors rounded-t-sm relative group">
                                                    <div style={{ height: `${h}%` }} className="absolute bottom-0 w-full bg-gradient-to-t from-primary/50 to-primary rounded-t-sm"></div>
                                                    <div className="absolute -top-8 w-full text-center text-xs opacity-0 group-hover:opacity-100 transition-opacity">${h * 10}</div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex justify-between text-xs text-gray-500 mt-4">
                                            <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                                        </div>
                                    </div>

                                    <div className="glass-panel p-6 rounded-2xl">
                                        <h3 className="text-lg font-bold mb-6 text-gray-300">Student Engagement</h3>
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center bg-white/5 p-3 rounded-lg">
                                                <span className="text-gray-400">Course Views</span>
                                                <span className="font-bold text-white">{stats.views}</span>
                                            </div>
                                            <div className="flex justify-between items-center bg-white/5 p-3 rounded-lg">
                                                <span className="text-gray-400">Course Completions (Est)</span>
                                                <span className="font-bold text-white">{Math.floor(stats.students * 0.4)}</span>
                                            </div>
                                            <div className="flex justify-between items-center bg-white/5 p-3 rounded-lg">
                                                <span className="text-gray-400">Avg. Rating</span>
                                                <span className="font-bold text-yellow-400">4.8/5.0</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                    </motion.div>
                </div>
            </div>
        </div>
    );
}
