"use client";
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Star, Shield, Zap } from 'lucide-react';

export default function Home() {
  return (
    <div className="relative min-h-screen flex flex-col justify-center items-center overflow-hidden pt-20">

      {/* Background Blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[100px]"></div>
      </div>

      <div className="container mx-auto px-6 text-center z-10">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className="inline-block py-1 px-3 rounded-full bg-white/5 border border-white/10 text-sm text-accent mb-6 backdrop-blur-sm">
            🚀 The Future of Learning is Here
          </span>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
            Master Skills with <br />
            <span className="text-gradient">Premium Courses</span>
          </h1>

          <p className="text-lg text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Unlock your potential with expert-led courses in coding, design, business, and more.
            Join thousands of learners in a marketplace designed for excellence.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/courses" className="group bg-white text-black px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-200 transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)]">
              Start Learning
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link href="/dashboard" className="px-8 py-4 rounded-full font-bold text-lg text-white border border-white/20 hover:bg-white/5 transition-all backdrop-blur-sm">
              Become an Instructor
            </Link>
          </div>
        </motion.div>

        {/* Feature Grid */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 text-left"
        >
          {[
            { icon: string => <Zap className={string} />, title: "Instant Access", desc: "Start learning immediately after purchase." },
            { icon: string => <Shield className={string} />, title: "Secure Payments", desc: "Powered by Stripe for 100% secure transactions." },
            { icon: string => <Star className={string} />, title: "Expert Quality", desc: "Curated content from top industry professionals." }
          ].map((item, i) => (
            <div key={i} className="glass-panel p-6 rounded-2xl hover:border-primary/50 transition-colors group">
              <div className="w-12 h-12 bg-white/5 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                {item.icon("w-6 h-6 text-accent")}
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
              <p className="text-gray-400">{item.desc}</p>
            </div>
          ))}
        </motion.div>

      </div>
    </div>
  );
}
