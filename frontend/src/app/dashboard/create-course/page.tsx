"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';
import { Loader2, Upload, Video, Layers, DollarSign, Type, Globe, Lock } from 'lucide-react'; // Added icons
import { motion } from 'framer-motion';

export default function CreateCoursePage() {
    const { user } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        category: '',
        video: null as File | null,
        status: 'draft' // Default status
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setLoading(true);

        try {
            // Use FormData for file upload
            const data = new FormData();
            data.append('title', formData.title);
            data.append('description', formData.description);
            data.append('price', formData.price);
            data.append('category', formData.category);
            data.append('status', formData.status); // Send status
            // Default lesson structure
            data.append('lessons', JSON.stringify([{
                title: "Introduction",
                content: "Welcome to the course!",
                videoUrl: "" // Backend handles the file uploaded below
            }]));

            if (formData.video) {
                data.append('video', formData.video);
            }

            const token = user.token || (user as any).accessToken; // Handle inconsistent token location

            await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/courses`, data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                }
            });

            router.push('/dashboard');
        } catch (error) {
            console.error(error);
            alert('Failed to create course');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen pt-24 px-6 pb-20 max-w-3xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold mb-2">Create New Course</h1>
                    <p className="text-gray-400">Share your expertise with the world</p>
                </div>

                <form onSubmit={handleSubmit} className="glass-panel p-8 rounded-2xl space-y-6">

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                                <Type className="w-4 h-4" /> Course Title
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                className="w-full bg-secondary/50 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-primary/50"
                                placeholder="e.g. Advanced React Patterns"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                                <Layers className="w-4 h-4" /> Category
                            </label>
                            <select
                                required
                                value={formData.category}
                                onChange={e => setFormData({ ...formData, category: e.target.value })}
                                className="w-full bg-secondary/50 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-primary/50 [&>option]:bg-gray-900"
                            >
                                <option value="">Select Category</option>
                                <option value="Development">Development</option>
                                <option value="Design">Design</option>
                                <option value="Business">Business</option>
                                <option value="Marketing">Marketing</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Description</label>
                        <textarea
                            required
                            rows={4}
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            className="w-full bg-secondary/50 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-primary/50"
                            placeholder="What will students learn?"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                                <DollarSign className="w-4 h-4" /> Price ($)
                            </label>
                            <input
                                type="number"
                                required
                                min="0"
                                value={formData.price}
                                onChange={e => setFormData({ ...formData, price: e.target.value })}
                                className="w-full bg-secondary/50 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-primary/50"
                                placeholder="49.99"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                                <Video className="w-4 h-4" /> Intro Video (Optional)
                            </label>
                            <label className="flex flex-col items-center justify-center w-full h-12 border border-white/10 border-dashed rounded-lg cursor-pointer bg-secondary/30 hover:bg-secondary/50 transition-colors">
                                <span className="text-xs text-gray-400 truncate px-4">
                                    {formData.video ? formData.video.name : "Click to upload video"}
                                </span>
                                <input
                                    type="file"
                                    accept="video/*"
                                    className="hidden"
                                    onChange={e => setFormData({ ...formData, video: e.target.files?.[0] || null })}
                                />
                            </label>
                        </div>
                    </div>

                    {/* Status Selection */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                            {formData.status === 'published' ? <Globe className="w-4 h-4 text-green-400" /> : <Lock className="w-4 h-4 text-orange-400" />}
                            Visibility Status
                        </label>
                        <div className="flex gap-4">
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, status: 'draft' })}
                                className={`flex-1 py-3 rounded-lg border transition-all ${formData.status === 'draft' ? 'bg-orange-500/20 border-orange-500 text-orange-400' : 'bg-transparent border-white/10 text-gray-400'}`}
                            >
                                Draft (Hidden)
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, status: 'published' })}
                                className={`flex-1 py-3 rounded-lg border transition-all ${formData.status === 'published' ? 'bg-green-500/20 border-green-500 text-green-400' : 'bg-transparent border-white/10 text-gray-400'}`}
                            >
                                Published (Public)
                            </button>
                        </div>
                        <p className="text-xs text-gray-500">Draft courses are only visible to you. Published courses appear in the marketplace.</p>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-white text-black font-bold py-4 rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-white/10"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (formData.status === 'published' ? "Publish Course" : "Save Draft")}
                        </button>
                    </div>

                </form>
            </motion.div>
        </div>
    );
}
