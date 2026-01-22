"use client";
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { Loader2, MonitorPlay, User, PlayCircle, FileText, CheckCircle, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

interface Lesson {
    title: string;
    content: string;
    videoUrl?: string;
}

interface Course {
    _id: string;
    title: string;
    description: string;
    price: number;
    category: string;
    instructor: { _id: string; name: string };
    lessons: Lesson[];
}

export default function CourseDetailPage() {
    const params = useParams();
    const courseId = params?.id as string;
    const { user } = useAuth();
    const router = useRouter();

    const [course, setCourse] = useState<Course | null>(null);
    const [loading, setLoading] = useState(true);
    const [enrollLoading, setEnrollLoading] = useState(false);
    const [error, setError] = useState('');
    const [enrollError, setEnrollError] = useState(''); // Separate error for enrollment actions
    const [activeLessonIndex, setActiveLessonIndex] = useState(0);
    const [isEnrolled, setIsEnrolled] = useState(false);

    useEffect(() => {
        if (courseId) {
            fetchCourse();
        }
    }, [courseId, user]);

    const fetchCourse = async () => {
        try {
            // Include token if user is logged in
            const headers = user ? { Authorization: `Bearer ${user.token || (user as any).accessToken}` } : {};
            const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/courses/${courseId}`, { headers });
            setCourse(res.data);

            // Check enrollment based on returned data + user state
            // If backend returns populated content, we are authorized.
            // We can also verify against user purchasedCourses
            if (user && (user as any).purchasedCourses?.includes(courseId)) {
                setIsEnrolled(true);
            } else if (user && user.role === 'instructor' && res.data.instructor._id === user._id) {
                // Instructor view
                setIsEnrolled(true); // Treat as enrolled for UI purposes
            }
        } catch (err) {
            console.error(err);
            setError('Course not found');
        } finally {
            setLoading(false);
        }
    };

    const handleEnroll = async () => {
        setEnrollError('');
        if (!user) {
            router.push('/login');
            return;
        }

        setEnrollLoading(true);
        try {
            const token = user.token || (user as any).accessToken;
            await axios.post(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/courses/${courseId}/enroll`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setIsEnrolled(true);
            // alert('Successfully enrolled!'); // Removed robust UX replaces alert
            fetchCourse(); // Refetch to get unlocked content
        } catch (err: any) {
            setEnrollError(err.response?.data?.error || 'Enrollment failed. Please try again.');
        } finally {
            setEnrollLoading(false);
        }
    };

    if (loading) {
        return <div className="min-h-screen pt-24 flex justify-center"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>;
    }

    if (error || !course) {
        return (
            <div className="min-h-screen pt-24 text-center px-6">
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-red-600 mb-4">404 - Not Found</h1>
                <Link href="/courses" className="text-primary hover:underline">Return to Marketplace</Link>
            </div>
        );
    }

    const activeLesson = course.lessons[activeLessonIndex];
    // Check Authorization based on Data Presence (Backend strips videoUrl if unauthorized)
    const canViewContent = !!activeLesson?.videoUrl || !!activeLesson?.content;

    return (
        <div className="min-h-screen pt-24 px-6 pb-20">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <div className="flex items-center gap-3 text-sm text-primary mb-2">
                            <span className="bg-primary/10 px-3 py-1 rounded-full border border-primary/20">{course.category}</span>
                        </div>
                        <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
                        <p className="text-xl text-gray-400 max-w-3xl">{course.description}</p>
                    </div>

                    {/* ACTION BUTTON */}
                    <div className="flex flex-col items-end gap-2">
                        {user?.role === 'student' && !isEnrolled && (
                            <button
                                onClick={handleEnroll}
                                disabled={enrollLoading}
                                className="bg-white text-black px-8 py-3 rounded-full font-bold hover:bg-gray-200 transition-all shadow-lg flex items-center gap-2"
                            >
                                {enrollLoading ? <Loader2 className="animate-spin" /> : 'Enroll Now (Free)'}
                            </button>
                        )}

                        {enrollError && (
                            <div className="flex items-center gap-2 text-red-400 text-sm bg-red-400/10 px-3 py-1 rounded-lg border border-red-400/20">
                                <AlertCircle className="w-4 h-4" />
                                {enrollError}
                            </div>
                        )}

                        {isEnrolled && (
                            <div className="bg-green-500/10 text-green-400 px-6 py-2 rounded-full border border-green-500/20 flex items-center gap-2 font-bold">
                                <CheckCircle className="w-5 h-5" /> Enrolled
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="glass-panel w-full aspect-video rounded-2xl overflow-hidden bg-black flex items-center justify-center relative shadow-2xl">
                            {canViewContent && activeLesson?.videoUrl ? (
                                <video controls className="w-full h-full object-contain" src={activeLesson.videoUrl}>
                                    Your browser does not support video.
                                </video>
                            ) : (
                                <div className="text-center text-gray-500 flex flex-col items-center">
                                    <Lock className="w-16 h-16 mx-auto mb-4 opacity-50 text-red-400" />
                                    <p className="font-bold text-lg mb-2">Content Locked</p>
                                    <p className="text-sm max-w-xs">{isEnrolled ? "No video available for this lesson." : "Enroll in this course to unlock high-quality video lessons."}</p>
                                </div>
                            )}
                        </div>

                        <div className="glass-panel p-8 rounded-2xl">
                            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                                <FileText className="text-primary w-6 h-6" /> Lesson Notes
                            </h2>
                            <div className="prose prose-invert max-w-none text-gray-300">
                                {canViewContent ? (activeLesson?.content || "No notes available.") : <span className="text-gray-500 italic flex items-center gap-2"><Lock className="w-4 h-4" /> Content is hidden. Enroll to view.</span>}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="glass-panel p-6 rounded-2xl sticky top-24">
                            <h3 className="text-xl font-bold mb-6">Course Content</h3>
                            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                                {course.lessons.map((lesson, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setActiveLessonIndex(idx)}
                                        className={`w-full text-left p-4 rounded-xl transition-all flex items-start gap-3 border ${activeLessonIndex === idx
                                            ? 'bg-primary/20 border-primary/50 text-white'
                                            : 'bg-white/5 border-transparent hover:bg-white/10 text-gray-400 hover:text-white'
                                            }`}
                                    >
                                        <div className="mt-1 flex-shrink-0">
                                            {activeLessonIndex === idx ? <PlayCircle className="w-5 h-5 text-accent" /> : <Lock className="w-4 h-4 text-gray-600" />}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-sm mb-1 line-clamp-1">Lesson {idx + 1}</p>
                                            <p className="text-sm line-clamp-1 opacity-80">{lesson.title}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
