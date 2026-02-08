import { useState, useEffect } from 'react';
import axios from 'axios';
const API_URL = 'http://localhost:5000/api';
import Card from '../ui/Card';
import { CheckCircle, Clock, AlertCircle, TrendingUp, Award, Target } from 'lucide-react';

export default function LearningJourney({ courseId, userId }) {
    const [journey, setJourney] = useState([]);
    const [stats, setStats] = useState({
        totalTimeSpent: 0,
        averageScore: 0,
        chaptersCompleted: 0,
        totalChapters: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (courseId && userId) {
            fetchJourney();
        }
    }, [courseId, userId]);

    const fetchJourney = async () => {
        try {
            const response = await axios.get(`${API_URL}/progress/${courseId}/journey?userId=${userId}`);
            setJourney(response.data.journey || []);
            setStats(response.data.stats || stats);
        } catch (error) {
            console.error('Error fetching learning journey:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'mastered': return 'emerald';
            case 'in-progress': return 'blue';
            case 'needs-work': return 'amber';
            default: return 'slate';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'mastered': return CheckCircle;
            case 'in-progress': return Clock;
            case 'needs-work': return AlertCircle;
            default: return Target;
        }
    };

    const formatTime = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        if (hours > 0) return `${hours}h ${minutes}m`;
        return `${minutes}m`;
    };

    if (loading) {
        return (
            <Card className="p-8">
                <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                    <div className="h-20 bg-slate-200 rounded"></div>
                    <div className="h-20 bg-slate-200 rounded"></div>
                </div>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="p-4 text-center">
                    <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Clock className="text-blue-600" size={24} />
                    </div>
                    <p className="text-2xl font-black text-slate-900">{formatTime(stats.totalTimeSpent)}</p>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Time Spent</p>
                </Card>

                <Card className="p-4 text-center">
                    <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-2">
                        <TrendingUp className="text-emerald-600" size={24} />
                    </div>
                    <p className="text-2xl font-black text-slate-900">{stats.averageScore}%</p>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Avg Score</p>
                </Card>

                <Card className="p-4 text-center">
                    <div className="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Award className="text-purple-600" size={24} />
                    </div>
                    <p className="text-2xl font-black text-slate-900">{stats.chaptersCompleted}</p>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Completed</p>
                </Card>

                <Card className="p-4 text-center">
                    <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Target className="text-amber-600" size={24} />
                    </div>
                    <p className="text-2xl font-black text-slate-900">{stats.totalChapters}</p>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Chapters</p>
                </Card>
            </div>

            {/* Timeline */}
            <Card className="p-6">
                <h3 className="text-xl font-bold text-slate-900 mb-6">Your Learning Journey</h3>

                {journey.length > 0 ? (
                    <div className="relative">
                        {/* Timeline Line */}
                        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-slate-200"></div>

                        <div className="space-y-6">
                            {journey.map((item, index) => {
                                const StatusIcon = getStatusIcon(item.status);
                                const color = getStatusColor(item.status);

                                return (
                                    <div key={index} className="relative flex items-start gap-4 group">
                                        {/* Timeline Dot */}
                                        <div className={`relative z-10 w-12 h-12 rounded-full bg-${color}-100 flex items-center justify-center shrink-0 ring-4 ring-white group-hover:scale-110 transition-transform`}>
                                            <StatusIcon className={`text-${color}-600`} size={20} />
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 bg-slate-50 rounded-xl p-4 group-hover:bg-slate-100 transition-colors">
                                            <div className="flex items-start justify-between mb-2">
                                                <div>
                                                    <h4 className="font-bold text-slate-900">{item.title}</h4>
                                                    <p className="text-xs text-slate-400 mt-1">
                                                        Last practiced: {new Date(item.lastPracticed).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <div className={`px-3 py-1 rounded-full text-xs font-bold bg-${color}-100 text-${color}-700`}>
                                                    {item.mastery}% Mastery
                                                </div>
                                            </div>

                                            {/* Progress Bar */}
                                            <div className="h-2 bg-white rounded-full overflow-hidden mb-2">
                                                <div
                                                    className={`h-full bg-${color}-500 transition-all duration-500`}
                                                    style={{ width: `${item.mastery}%` }}
                                                />
                                            </div>

                                            <div className="flex items-center gap-4 text-xs text-slate-500">
                                                <span className="flex items-center gap-1">
                                                    <Clock size={12} />
                                                    {formatTime(item.timeSpent)}
                                                </span>
                                                <span className="capitalize">{item.status.replace('-', ' ')}</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <Target size={48} className="mx-auto text-slate-300 mb-4" />
                        <p className="text-slate-500">Start learning to see your journey!</p>
                    </div>
                )}
            </Card>
        </div>
    );
}
