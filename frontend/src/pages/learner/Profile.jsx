import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Award, BookOpen, Star, TrendingUp, Clock, CheckCircle, ChevronRight, Trophy, BarChart3 } from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';

const API_URL = 'http://localhost:5000/api';

export default function Profile() {
    const { userData, user } = useAuth();
    const [stats, setStats] = useState({
        totalPoints: 0,
        coursesEnrolled: 0,
        coursesCompleted: 0,
        badges: []
    });
    const [enrolledCourses, setEnrolledCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (userData) {
            loadProfileData();
        }
    }, [userData]);

    const loadProfileData = async () => {
        try {
            // 1. Fetch Enrollments
            const enrollResponse = await axios.get(`${API_URL}/enrollments/my-courses`);
            const enrollments = enrollResponse.data || [];

            const completed = enrollments.filter(e => e.completed).length;
            const userPoints = userData?.points || 0;

            // 2. Badges (Mock logic for now)
            const badges = [];
            if (userPoints > 0) badges.push({ id: 'pioneer', name: 'First Steps', icon: <TrendingUp size={24} />, color: 'text-blue-500 bg-blue-50' });
            if (completed > 0) badges.push({ id: 'graduate', name: 'Course Graduate', icon: <Award size={24} />, color: 'text-purple-500 bg-purple-50' });
            if (userPoints > 500) badges.push({ id: 'pro', name: 'Power Student', icon: <Trophy size={24} />, color: 'text-orange-500 bg-orange-50' });

            setStats({
                totalPoints: userPoints,
                coursesEnrolled: enrollments.length,
                coursesCompleted: completed,
                badges: badges
            });
            setEnrolledCourses(enrollments);
        } catch (err) {
            console.error("Error loading profile:", err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-400">Loading profile...</div>;

    return (
        <div className="bg-slate-50 min-h-screen font-sans">
            {/* Header / Banner */}
            <div className="bg-white border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
                        <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-3xl font-bold border-4 border-white shadow-lg">
                            {userData?.name ? userData.name[0].toUpperCase() : 'U'}
                        </div>
                        <div className="flex-1">
                            <h1 className="text-3xl font-bold text-slate-900 mb-2">{userData?.name || 'User Name'}</h1>
                            <p className="text-slate-500 mb-4">{userData?.email || user?.email}</p>
                            <div className="flex flex-wrap justify-center md:justify-start gap-4">
                                <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full border border-blue-100">
                                    <Trophy size={16} className="text-blue-600" />
                                    <span className="text-sm font-bold text-blue-700">{stats.totalPoints} Points</span>
                                </div>
                                <div className="flex items-center gap-2 px-4 py-2 bg-green-50 rounded-full border border-green-100">
                                    <CheckCircle size={16} className="text-green-600" />
                                    <span className="text-sm font-bold text-green-700">{stats.coursesCompleted} Courses Finished</span>
                                </div>
                            </div>
                        </div>
                        <Button variant="outline" className="hidden md:flex">Edit Profile</Button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Left: Badges & Progress */}
                    <div className="lg:col-span-2 space-y-8">
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                                <Award className="text-blue-600" /> My Badges
                            </h2>
                            {stats.badges.length > 0 ? (
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                    {stats.badges.map(badge => (
                                        <div key={badge.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm text-center group hover:shadow-md transition-all">
                                            <div className={`w-12 h-12 ${badge.color} rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                                                {badge.icon}
                                            </div>
                                            <h3 className="font-bold text-slate-900 text-sm">{badge.name}</h3>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-white p-12 rounded-2xl border border-dashed border-slate-200 text-center">
                                    <Star size={40} className="text-slate-200 mx-auto mb-4" />
                                    <p className="text-slate-400">Complete lessons and courses to earn your first badge!</p>
                                </div>
                            )}
                        </div>

                        <div>
                            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                                <BookOpen className="text-blue-600" /> My Learning
                            </h2>
                            <div className="space-y-4">
                                {enrolledCourses.length > 0 ? (
                                    enrolledCourses.map(enrollment => (
                                        <Card key={enrollment._id} className="p-4 hover:shadow-md transition-shadow">
                                            <div className="flex flex-col md:flex-row gap-6 items-center">
                                                <div className="w-full md:w-32 aspect-video bg-slate-100 rounded-lg overflow-hidden shrink-0">
                                                    {enrollment.courseId?.imageUrl ? (
                                                        <img src={enrollment.courseId.imageUrl} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-slate-300"><BookOpen /></div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-bold text-slate-900 mb-1 truncate">{enrollment.courseId?.title || 'Unknown Course'}</h3>
                                                    <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
                                                        <span className="flex items-center gap-1"><Clock size={12} /> {enrollment.courseId?.lessons?.length || 0} Lessons</span>
                                                        <span className="flex items-center gap-1"><BarChart3 size={12} className="text-blue-500" /> {enrollment.progressPercent}% Complete</span>
                                                    </div>
                                                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                        <div className="h-full bg-blue-600 rounded-full" style={{ width: `${enrollment.progressPercent}%` }}></div>
                                                    </div>
                                                </div>
                                                <Button size="sm" onClick={() => (window.location.href = `/courses/${enrollment.courseId?._id}/learn`)}>
                                                    Continue
                                                </Button>
                                            </div>
                                        </Card>
                                    ))
                                ) : (
                                    <div className="bg-white p-12 rounded-2xl border border-slate-100 text-center shadow-sm">
                                        <BookOpen size={40} className="text-slate-200 mx-auto mb-4" />
                                        <p className="text-slate-500 mb-6">You haven't enrolled in any courses yet.</p>
                                        <Button onClick={() => (window.location.href = '/')}>Explore Catalog</Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right: Activity Stats */}
                    <div className="space-y-8">
                        <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
                            <h2 className="text-lg font-bold text-slate-900 mb-6">Learning Stats</h2>
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded flex items-center justify-center"><Clock size={16} /></div>
                                        <span className="text-sm text-slate-600">Total Hours</span>
                                    </div>
                                    <span className="font-bold text-slate-900">12.4h</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-purple-50 text-purple-600 rounded flex items-center justify-center"><Star size={16} /></div>
                                        <span className="text-sm text-slate-600">Certificates Earned</span>
                                    </div>
                                    <span className="font-bold text-slate-900">{stats.coursesCompleted}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-orange-50 text-orange-600 rounded flex items-center justify-center"><TrendingUp size={16} /></div>
                                        <span className="text-sm text-slate-600">Points Earned</span>
                                    </div>
                                    <span className="font-bold text-slate-900">{stats.totalPoints}</span>
                                </div>
                            </div>
                            <div className="mt-8 pt-6 border-t border-slate-100">
                                <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                                    <span>Achievement Progress</span>
                                    <span>{Math.min(100, (stats.totalPoints / 1000) * 100).toFixed(0)}%</span>
                                </div>
                                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${Math.min(100, (stats.totalPoints / 1000) * 100)}%` }}></div>
                                </div>
                                <p className="text-xs text-slate-400 mt-2">Earn 1,000 points for 'Master' badge</p>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-2xl text-white shadow-xl shadow-blue-500/20">
                            <h3 className="text-lg font-bold mb-4">Refer a Friend</h3>
                            <p className="text-blue-100 text-sm mb-6 leading-relaxed">
                                Share LearnSphere with your friends and earn 100 bonus points for every new signup!
                            </p>
                            <Button className="w-full bg-white text-blue-600 border-none hover:bg-blue-50 font-bold">Share Link</Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
