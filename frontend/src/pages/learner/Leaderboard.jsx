import { useState, useEffect } from 'react';
import axios from 'axios';
const API_URL = 'http://localhost:5000/api';
import { Trophy, Medal, Star, Target, Users, TrendingUp, Award, Crown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Leaderboard() {
    const { userData } = useAuth();
    const [leaders, setLeaders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLeaders();
    }, []);

    const fetchLeaders = async () => {
        try {
            const response = await axios.get(`${API_URL}/users/leaderboard`);
            setLeaders(response.data);
        } catch (error) {
            console.error("Error fetching leaderboard:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );

    const getRankIcon = (index) => {
        if (index === 0) return <Crown className="text-amber-400" size={24} />;
        if (index === 1) return <Medal className="text-slate-400" size={24} />;
        if (index === 2) return <Medal className="text-amber-700" size={24} />;
        return <span className="text-slate-400 font-bold">{index + 1}</span>;
    };

    const getBadge = (points) => {
        if (points >= 120) return { name: 'Master', color: 'bg-purple-100 text-purple-700' };
        if (points >= 100) return { name: 'Expert', color: 'bg-rose-100 text-rose-700' };
        if (points >= 80) return { name: 'Specialist', color: 'bg-amber-100 text-amber-700' };
        if (points >= 60) return { name: 'Achiever', color: 'bg-emerald-100 text-emerald-700' };
        return { name: 'Scholar', color: 'bg-blue-100 text-blue-700' };
    };

    return (
        <div className="min-h-screen bg-white font-sans">
            {/* Header Hero */}
            <div className="bg-slate-900 text-white overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-slate-900 to-blue-900 opacity-90"></div>
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-blue-200 text-xs font-bold uppercase tracking-widest mb-6 animate-fade-in">
                        <Trophy size={14} className="text-amber-400" /> Global Rankings
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight animate-fade-in-up">The Hall of Fame</h1>
                    <p className="text-blue-100/60 max-w-2xl mx-auto text-lg leading-relaxed animate-fade-in-up">
                        Meet the top learners pushes the boundaries of knowledge.
                        Complete courses and quizzes to climb the global leaderboard.
                    </p>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-20 pb-20">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    {[
                        { icon: Users, label: 'Active Learners', value: '1,280+', color: 'text-blue-600', bg: 'bg-blue-50' },
                        { icon: Star, label: 'Points Distributed', value: '45.2K', color: 'text-amber-500', bg: 'bg-amber-50' },
                        { icon: Award, label: 'Badges Earned', value: '890', color: 'text-emerald-500', bg: 'bg-emerald-50' }
                    ].map((stat, i) => (
                        <div key={i} className="bg-white rounded-3xl p-6 shadow-xl shadow-slate-200/50 border border-slate-100 flex items-center gap-5 translate-y-0 hover:-translate-y-2 transition-transform duration-300">
                            <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color}`}>
                                <stat.icon size={28} />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                                <p className="text-2xl font-black text-slate-900">{stat.value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Leaderboard Table */}
                <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden">
                    <div className="p-8 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <TrendingUp className="text-blue-600" size={20} />
                            <h2 className="font-black text-slate-900 uppercase tracking-tight">Top Performance</h2>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Updated Real-time</span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-white">
                                <tr>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Rank</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Learner</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Achievement</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Points</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {leaders.map((leader, index) => {
                                    const isCurrent = leader.email === userData?.email;
                                    const badge = getBadge(leader.points);

                                    return (
                                        <tr key={leader.email} className={`hover:bg-blue-50/30 transition-colors group ${isCurrent ? 'bg-blue-50/50' : ''}`}>
                                            <td className="px-8 py-6">
                                                <div className="w-10 h-10 flex items-center justify-center">
                                                    {getRankIcon(index)}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg shadow-sm border ${isCurrent ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                                        {leader.name[0]}
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-slate-900 group-hover:text-blue-600 transition-colors">
                                                            {leader.name} {isCurrent && <span className="ml-2 text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full">YOU</span>}
                                                        </p>
                                                        <p className="text-xs text-slate-400 font-medium">{leader.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${badge.color}`}>
                                                    {badge.name}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="inline-flex items-center gap-2">
                                                    <span className="text-2xl font-black text-slate-900">{leader.points}</span>
                                                    <Star size={14} className="text-amber-400 fill-current" />
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="mt-10 text-center">
                    <div className="inline-flex items-center gap-6 p-6 bg-slate-900 rounded-[2rem] text-white shadow-2xl">
                        <div className="text-left">
                            <p className="text-[10px] text-blue-400 font-bold uppercase tracking-[0.2em]">Next Goal</p>
                            <p className="font-bold">Reach 200 points to unlock "Legendary" rank</p>
                        </div>
                        <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-500/20">
                            Keep Learning
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
