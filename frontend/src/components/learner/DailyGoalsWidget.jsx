import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
const API_URL = 'http://localhost:5000/api';
import { useAuth } from '../../context/AuthContext';
import Card from '../ui/Card';
import { Target, TrendingUp, Clock, Award, Flame, Star, ChevronRight, BookOpen, Trophy } from 'lucide-react';

export default function DailyGoalsWidget() {
    const { userData } = useAuth();
    const [goals, setGoals] = useState({
        lessonsToday: 0,
        lessonsTarget: 3,
        minutesToday: 0,
        minutesTarget: 30,
        quizzesToday: 0,
        quizzesTarget: 2
    });
    const [streak, setStreak] = useState(0);
    const [todayProgress, setTodayProgress] = useState([]);

    useEffect(() => {
        if (userData) {
            fetchDailyGoals();
            updateStreak();
        }
    }, [userData]);

    const fetchDailyGoals = async () => {
        try {
            // Fetch today's activity (mock for now)
            const today = new Date().toDateString();
            const lessonsCompleted = 1; // TODO: Get from actual API
            const minutesSpent = 15;
            const quizzesTaken = 0;

            setGoals(prev => ({
                ...prev,
                lessonsToday: lessonsCompleted,
                minutesToday: minutesSpent,
                quizzesToday: quizzesTaken
            }));

            setTodayProgress([
                { time: '9:30 AM', activity: 'Completed: Introduction to React', icon: BookOpen },
                { time: '10:15 AM', activity: 'Watched: State Management', icon: Clock }
            ]);
        } catch (error) {
            console.error('Error fetching daily goals:', error);
        }
    };

    const updateStreak = async () => {
        try {
            const response = await axios.post(`${API_URL}/achievements/${userData._id}/streak`);
            setStreak(response.data.streak);
        } catch (error) {
            console.error('Error updating streak:', error);
        }
    };

    const getProgressPercentage = (current, target) => {
        return Math.min((current / target) * 100, 100);
    };

    return (
        <div className="space-y-6">
            {/* Streak Card */}
            <Card className="p-6 bg-gradient-to-br from-orange-500 to-red-500 text-white border-none">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-widest opacity-90 mb-1">Daily Streak</p>
                        <h3 className="text-4xl font-black">{streak} Days</h3>
                        <p className="text-sm opacity-90 mt-2">Keep it going! 🔥</p>
                    </div>
                    <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                        <Flame size={40} />
                    </div>
                </div>
            </Card>

            {/* Today's Goals */}
            <Card className="p-6">
                <div className="flex items-center gap-2 mb-6">
                    <Target className="text-blue-600" size={24} />
                    <h3 className="text-xl font-bold text-slate-900">Today's Goals</h3>
                </div>

                <div className="space-y-4">
                    {/* Lessons Goal */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <BookOpen size={16} className="text-blue-600" />
                                <span className="text-sm font-bold text-slate-700">Complete Lessons</span>
                            </div>
                            <span className="text-sm font-black text-slate-900">
                                {goals.lessonsToday}/{goals.lessonsTarget}
                            </span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-blue-600 transition-all duration-500"
                                style={{ width: `${getProgressPercentage(goals.lessonsToday, goals.lessonsTarget)}%` }}
                            />
                        </div>
                    </div>

                    {/* Study Time Goal */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <Clock size={16} className="text-emerald-600" />
                                <span className="text-sm font-bold text-slate-700">Study Time</span>
                            </div>
                            <span className="text-sm font-black text-slate-900">
                                {goals.minutesToday}/{goals.minutesTarget} min
                            </span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-emerald-600 transition-all duration-500"
                                style={{ width: `${getProgressPercentage(goals.minutesToday, goals.minutesTarget)}%` }}
                            />
                        </div>
                    </div>

                    {/* Quizzes Goal */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <Trophy size={16} className="text-amber-600" />
                                <span className="text-sm font-bold text-slate-700">Take Quizzes</span>
                            </div>
                            <span className="text-sm font-black text-slate-900">
                                {goals.quizzesToday}/{goals.quizzesTarget}
                            </span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-amber-600 transition-all duration-500"
                                style={{ width: `${getProgressPercentage(goals.quizzesToday, goals.quizzesTarget)}%` }}
                            />
                        </div>
                    </div>
                </div>
            </Card>

            {/* Today's Activity */}
            <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="text-blue-600" size={20} />
                    <h4 className="font-bold text-slate-900">Recent Activity</h4>
                </div>

                {todayProgress.length > 0 ? (
                    <div className="space-y-3">
                        {todayProgress.map((item, i) => {
                            const Icon = item.icon;
                            return (
                                <div key={i} className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                                        <Icon size={14} className="text-blue-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-slate-900">{item.activity}</p>
                                        <p className="text-xs text-slate-400">{item.time}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <p className="text-sm text-slate-400 text-center py-4">No activity yet today. Start learning!</p>
                )}
            </Card>
        </div>
    );
}
