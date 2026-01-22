"use client";
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Search, MonitorPlay, Star, Clock } from 'lucide-react';

interface Course {
    _id: string;
    title: string;
    description: string;
    price: number;
    category: string;
    instructor: { name: string };
    rating: number;
}

export default function CoursesPage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/courses`);
            setCourses(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const filteredCourses = courses.filter(c =>
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.category.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="min-h-screen pt-24 px-6 pb-12">
            <div className="max-w-7xl mx-auto">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
                    <div>
                        <h1 className="text-4xl font-bold mb-2">Explore Courses</h1>
                        <p className="text-gray-400">Discover new skills taught by experts</p>
                    </div>

                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search for courses..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-glass border border-white/10 rounded-full py-3 pl-12 pr-6 text-white focus:outline-none focus:border-primary/50 transition-all placeholder:text-gray-600 bg-secondary/50"
                        />
                    </div>
                </div>

                {/* Course Grid */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredCourses.map((course) => (
                            <motion.div
                                key={course._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="glass-panel rounded-2xl overflow-hidden hover:border-primary/30 transition-all group"
                            >
                                {/* Visual Placeholder for Course Image */}
                                <div className="h-48 bg-gradient-to-br from-primary/20 to-secondary relative flex items-center justify-center overflow-hidden">
                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                                    <MonitorPlay className="w-12 h-12 text-white/50 group-hover:scale-110 transition-transform duration-500" />
                                    <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-white border border-white/10">
                                        {course.category}
                                    </div>
                                </div>

                                <div className="p-6">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-1 text-yellow-500 text-sm font-medium">
                                            <Star className="w-4 h-4 fill-yellow-500" />
                                            {course.rating.toFixed(1)}
                                        </div>
                                        <div className="flex items-center gap-1 text-gray-400 text-xs">
                                            <Clock className="w-3 h-3" />
                                            12h 30m
                                        </div>
                                    </div>

                                    <h3 className="text-xl font-bold mb-2 line-clamp-1 group-hover:text-primary transition-colors">{course.title}</h3>
                                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">{course.description}</p>

                                    <div className="flex items-center justify-between mt-auto">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-gray-300">
                                                {course.instructor.name.charAt(0)}
                                            </div>
                                            <span className="text-sm text-gray-400">{course.instructor.name}</span>
                                        </div>
                                        <span className="text-xl font-bold text-white">${course.price}</span>
                                    </div>

                                    <Link
                                        href={`/courses/${course._id}`}
                                        className="block mt-6 w-full text-center bg-white/5 hover:bg-white text-white hover:text-black py-3 rounded-lg font-bold transition-all"
                                    >
                                        View Course
                                    </Link>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                {!loading && filteredCourses.length === 0 && (
                    <div className="text-center py-20 text-gray-500">
                        <p className="text-xl">No courses found matching "{search}"</p>
                    </div>
                )}

            </div>
        </div>
    );
}
