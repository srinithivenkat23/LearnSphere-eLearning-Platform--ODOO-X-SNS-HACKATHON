import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Flame, Trophy, Target, Zap, Award, Star, ChevronRight } from 'lucide-react';
import Card from '../ui/Card';

const GamificationSection = ({ userData, columns = 3 }) => {
    const dailyProgress = Math.min(100, (userData?.dailyProgress / userData?.dailyGoal) * 100) || 0;

    const gridClass = columns === 1
        ? "grid grid-cols-1 gap-6 mb-8"
        : "grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8";

    return (
        <div className={gridClass}>
            {/* Daily Goal Card */}
            <Card className="p-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-500">
                    <Target size={120} />
                </div>
                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                            <Target size={24} />
                        </div>
                        <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full">Daily Goal</span>
                    </div>

                    <h3 className="text-xl font-bold text-slate-900 mb-1">Stay Consistent!</h3>
                    <p className="text-sm text-slate-500 mb-6">Learn for 20 more minutes to hit your goal.</p>

                    <div className="space-y-2">
                        <div className="flex justify-between items-end">
                            <span className="text-2xl font-black text-slate-900">{userData?.dailyProgress || 0}<span className="text-sm text-slate-400 font-bold ml-1">/ {userData?.dailyGoal || 50} XP</span></span>
                            <span className="text-sm font-bold text-blue-600">{Math.round(dailyProgress)}%</span>
                        </div>
                        <div className="h-3 bg-slate-100 rounded-full overflow-hidden p-0.5">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${dailyProgress}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full shadow-sm"
                            />
                        </div>
                    </div>
                </div>
            </Card>

            {/* Streak Card */}
            <Card className="p-6 bg-gradient-to-br from-orange-500 to-red-600 text-white relative overflow-hidden group shadow-xl shadow-orange-500/20">
                <motion.div
                    animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.1, 0.2, 0.1]
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="absolute -right-4 -bottom-4 p-4"
                >
                    <Flame size={140} />
                </motion.div>

                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-6">
                        <div className="p-2 bg-white/20 backdrop-blur-md rounded-xl">
                            <Flame size={24} />
                        </div>
                        <div className="flex gap-1">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className={`w-1.5 h-6 rounded-full ${i < (userData?.streaks || 0) ? 'bg-white' : 'bg-white/20'}`} />
                            ))}
                        </div>
                    </div>

                    <div className="mb-8">
                        <h3 className="text-4xl font-black mb-1">{userData?.streaks || 0} Day</h3>
                        <p className="text-orange-100 font-bold text-sm uppercase tracking-widest">Current Learning Streak</p>
                    </div>

                    <button className="w-full py-3 bg-white text-orange-600 rounded-xl font-black text-sm hover:bg-orange-50 transition-colors flex items-center justify-center gap-2 group-hover:gap-3">
                        Keep it Burning <ChevronRight size={16} />
                    </button>
                </div>
            </Card>

            {/* Achievements Card */}
            <Card className="p-6 relative overflow-hidden group">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-slate-900">Recent Achievements</h3>
                    <Award size={20} className="text-slate-400" />
                </div>

                <div className="grid grid-cols-3 gap-4">
                    {userData?.achievements?.length > 0 ? (
                        userData.achievements.slice(0, 3).map((ach, i) => (
                            <motion.div
                                key={i}
                                whileHover={{ scale: 1.05 }}
                                className="flex flex-col items-center text-center"
                            >
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-100 to-yellow-50 flex items-center justify-center mb-2 shadow-sm border border-amber-200/50">
                                    <Trophy size={28} className="text-amber-500" />
                                </div>
                                <span className="text-[10px] font-bold text-slate-700 leading-tight">{ach.title}</span>
                            </motion.div>
                        ))
                    ) : (
                        [
                            { icon: Star, color: 'text-purple-500', bg: 'bg-purple-50', title: 'Fast Learner' },
                            { icon: Zap, color: 'text-blue-500', bg: 'bg-blue-50', title: 'High Flier' },
                            { icon: Trophy, color: 'text-amber-500', bg: 'bg-amber-50', title: 'Quiz Master' }
                        ].map((ach, i) => (
                            <div key={i} className="flex flex-col items-center text-center opacity-40 grayscale">
                                <div className={`w-16 h-16 rounded-2xl ${ach.bg} flex items-center justify-center mb-2 border border-slate-100`}>
                                    <ach.icon size={28} className={ach.color} />
                                </div>
                                <span className="text-[10px] font-bold text-slate-400 leading-tight">{ach.title}</span>
                            </div>
                        ))
                    )}
                </div>

                <div className="mt-6 pt-4 border-t border-slate-50 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                            <Zap size={16} />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Total XP</p>
                            <p className="text-sm font-black text-slate-900">{userData?.points || 0}</p>
                        </div>
                    </div>
                    <Link to="/profile" className="text-xs font-bold text-blue-600 hover:underline">View All</Link>
                </div>
            </Card>
        </div>
    );
};

export default GamificationSection;
