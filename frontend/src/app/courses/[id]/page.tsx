"use client";
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { Loader2, MonitorPlay, User, PlayCircle, FileText, CheckCircle, Lock, AlertCircle, Circle, CheckCircle2, Star, TrendingUp } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { motion } from 'framer-motion';

interface Lesson {
    _id: string; // Ensure we get IDs
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
    userProgress?: string[]; // Array of completed lesson IDs
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
    const [enrollError, setEnrollError] = useState('');
    const [activeLessonIndex, setActiveLessonIndex] = useState(0);
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [completedLessons, setCompletedLessons] = useState<string[]>([]);

    // Rating state
    const [rating, setRating] = useState(5);
    const [reviewComment, setReviewComment] = useState('');
    const [reviewSubmitting, setReviewSubmitting] = useState(false);

    useEffect(() => {
        if (courseId) {
            fetchCourse();
        }
    }, [courseId, user]);

    const fetchCourse = async () => {
        try {
            const headers = user ? { Authorization: `Bearer ${user.token || (user as any).accessToken}` } : {};
            const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/courses/${courseId}`, { headers });
            setCourse(res.data);

            // Set Progress if enrolled
            if (res.data.userProgress) {
                setCompletedLessons(res.data.userProgress);
                setIsEnrolled(true);

                // Auto-Resume: Find first incomplete lesson
                const firstIncomplete = res.data.lessons.findIndex((l: Lesson) => !res.data.userProgress?.includes(l._id));
                if (firstIncomplete !== -1) {
                    setActiveLessonIndex(firstIncomplete);
                }
            } else if (user && (user as any).purchasedCourses?.includes(courseId)) {
                setIsEnrolled(true);
            } else if (user && user.role === 'instructor' && res.data.instructor._id === user._id) {
                setIsEnrolled(true);
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
            fetchCourse();
        } catch (err: any) {
            setEnrollError(err.response?.data?.error || 'Enrollment failed. Please try again.');
        } finally {
            setEnrollLoading(false);
        }
    };

    const toggleLesson = async (lessonId: string) => {
        if (!lessonId) return; // Guard against missing IDs in old seed data

        // Optimistic UI update
        const isCompleted = completedLessons.includes(lessonId);
        const newCompleted = isCompleted
            ? completedLessons.filter(id => id !== lessonId)
            : [...completedLessons, lessonId];

        setCompletedLessons(newCompleted);

        try {
            const token = user?.token || (user as any)?.accessToken;
            await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/courses/progress/toggle`, {
                courseId,
                lessonId
            }, { headers: { Authorization: `Bearer ${token}` } });
        } catch (err) {
            console.error("Failed to sync progress", err);
            // Revert on failure
            setCompletedLessons(completedLessons);
        }
    };

    const submitReview = async (e: React.FormEvent) => {
        e.preventDefault();
        setReviewSubmitting(true);
        try {
            const token = user?.token || (user as any)?.accessToken;
            await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/courses/${courseId}/reviews`, {
                rating,
                comment: reviewComment
            }, { headers: { Authorization: `Bearer ${token}` } });
            alert("Review submitted!");
            setReviewComment('');
        } catch (err: any) {
            alert(err.response?.data?.error || "Failed to submit review");
        } finally {
            setReviewSubmitting(false);
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
    const canViewContent = !!activeLesson?.videoUrl || !!activeLesson?.content;
    const progressPercentage = course.lessons.length > 0 ? Math.round((completedLessons.length / course.lessons.length) * 100) : 0;

    return (
        <div className="min-h-screen pt-24 px-6 pb-20">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <div className="flex items-center gap-3 text-sm text-primary mb-2">
                            <span className="bg-primary/10 px-3 py-1 rounded-full border border-primary/20">{course.category}</span>
                            {isEnrolled && (
                                <span className="text-gray-400 text-xs flex items-center gap-1">
                                    <TrendingUp className="w-3 h-3" /> {progressPercentage}% Complete
                                </span>
                            )}
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
                            <div className="flex flex-col items-end gap-2">
                                <div className="bg-green-500/10 text-green-400 px-6 py-2 rounded-full border border-green-500/20 flex items-center gap-2 font-bold">
                                    <CheckCircle className="w-5 h-5" /> Enrolled
                                </div>
                                <div className="w-32 h-2 bg-gray-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-green-500 transition-all duration-500" style={{ width: `${progressPercentage}%` }} />
                                </div>
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

                        <div className="flex justify-between items-center glass-panel p-4 rounded-xl">
                            <h3 className="font-bold text-lg">Current Lesson: {activeLesson?.title}</h3>
                            {isEnrolled && activeLesson && (
                                <button
                                    onClick={() => toggleLesson(activeLesson._id)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all ${completedLessons.includes(activeLesson._id) ? 'bg-green-500 text-white' : 'bg-white/10 text-gray-300 hover:bg-white/20'}`}
                                >
                                    {completedLessons.includes(activeLesson._id) ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                                    {completedLessons.includes(activeLesson._id) ? 'Completed' : 'Mark Complete'}
                                </button>
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

                        {/* Review Section */}
                        {isEnrolled && (
                            <div className="glass-panel p-8 rounded-2xl mt-8">
                                <h3 className="text-xl font-bold mb-4">Leave a Review</h3>
                                <form onSubmit={submitReview} className="space-y-4">
                                    <div className="flex gap-2">
                                        {[1, 2, 3, 4, 5].map(star => (
                                            <button
                                                type="button"
                                                key={star}
                                                onClick={() => setRating(star)}
                                                className={`transition-colors ${star <= rating ? 'text-yellow-500' : 'text-gray-600'}`}
                                            >
                                                <Star className="w-6 h-6 fill-current" />
                                            </button>
                                        ))}
                                    </div>
                                    <textarea
                                        value={reviewComment}
                                        onChange={e => setReviewComment(e.target.value)}
                                        placeholder="How was the course?"
                                        className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-primary/50"
                                    />
                                    <button
                                        type="submit"
                                        disabled={reviewSubmitting}
                                        className="bg-primary text-white px-6 py-2 rounded-lg font-bold hover:bg-primary/80 transition-all disabled:opacity-50"
                                    >
                                        {reviewSubmitting ? 'Posting...' : 'Post Review'}
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="glass-panel p-6 rounded-2xl sticky top-24">
                            <h3 className="text-xl font-bold mb-6">Course Content</h3>
                            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                                {course.lessons.map((lesson, idx) => {
                                    const isComplete = completedLessons.includes(lesson._id);
                                    return (
                                        <button
                                            key={idx}
                                            onClick={() => setActiveLessonIndex(idx)}
                                            className={`w-full text-left p-4 rounded-xl transition-all flex items-start gap-3 border relative overflow-hidden ${activeLessonIndex === idx
                                                ? 'bg-primary/20 border-primary/50 text-white'
                                                : 'bg-white/5 border-transparent hover:bg-white/10 text-gray-400 hover:text-white'
                                                }`}
                                        >
                                            {isComplete && <div className="absolute top-0 right-0 p-1"><div className="w-2 h-2 bg-green-500 rounded-full"></div></div>}
                                            <div className="mt-1 flex-shrink-0">
                                                {activeLessonIndex === idx ? <PlayCircle className="w-5 h-5 text-accent" /> :
                                                    isComplete ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Lock className="w-4 h-4 text-gray-600" />}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-sm mb-1 line-clamp-1">Lesson {idx + 1}</p>
                                                <p className="text-sm line-clamp-1 opacity-80">{lesson.title}</p>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
