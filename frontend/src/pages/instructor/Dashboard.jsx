import { useState, useEffect } from 'react';
import axios from 'axios';
const API_URL = 'http://localhost:5000/api';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/ui/Card';
import { Users, BookOpen, CheckCircle, Clock } from 'lucide-react';

const StatCard = ({ label, value, icon: Icon, color }) => (
    <Card className="p-6 flex items-center gap-4">
        <div className={`p-3 rounded-full ${color} bg-opacity-10 text-opacity-100`}>
            <Icon size={24} className={color.replace('bg-', 'text-')} />
        </div>
        <div>
            <p className="text-sm text-slate-500 font-medium">{label}</p>
            <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
        </div>
    </Card>
);

export default function InstructorDashboard() {
    const { userData, user } = useAuth();
    const [stats, setStats] = useState({
        students: 0,
        courses: 0,
        completions: 0,
        hours: 0
    });
    const [recentActivity, setRecentActivity] = useState([]);
    const [topCourses, setTopCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const isAdmin = userData?.role === 'admin';
            const reqId = user.uid;

            const statsRes = await axios.get(`${API_URL}/users/stats/${reqId}`, {
                params: { role: userData?.role }
            });
            if (statsRes.data) setStats(statsRes.data);

            const activityRes = await axios.get(`${API_URL}/users/activity/${reqId}`, {
                params: { role: userData?.role }
            });
            if (activityRes.data) setRecentActivity(activityRes.data);

            // Fetch top courses
            const coursesParams = { all: 'true' };
            if (!isAdmin) coursesParams.instructorId = reqId;

            const coursesRes = await axios.get(`${API_URL}/courses`, {
                params: coursesParams
            });
            const sortedCourses = (coursesRes.data || [])
                .sort((a, b) => (b.studentsCount || 0) - (a.studentsCount || 0))
                .slice(0, 3);
            setTopCourses(sortedCourses);

        } catch (error) {
            console.error("Error fetching dashboard data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user?.uid) fetchDashboardData();
    }, [user, userData]);
    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
                <p className="text-slate-500">Overview of your courses and students</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    label={userData?.role === 'admin' ? "Total Learners" : "My Students"}
                    value={loading ? "..." : stats.students}
                    icon={Users}
                    color="bg-blue-500 text-blue-600"
                />
                <StatCard
                    label={userData?.role === 'admin' ? "Total Courses" : "Active Courses"}
                    value={loading ? "..." : stats.courses}
                    icon={BookOpen}
                    color="bg-blue-500 text-blue-600"
                />
                <StatCard
                    label="Completions"
                    value={loading ? "..." : stats.completions}
                    icon={BookOpen}
                    color="bg-indigo-500 text-indigo-600"
                />
                <StatCard
                    label="Total Hours"
                    value={loading ? "..." : stats.hours}
                    icon={CheckCircle}
                    color="bg-emerald-500 text-emerald-600"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="p-6">
                    <h3 className="font-bold text-slate-900 mb-4">Recent Activity</h3>
                    <div className="space-y-4">
                        {recentActivity.length > 0 ? (
                            recentActivity.map((act) => (
                                <div key={act.id} className="flex items-center gap-4 py-2 border-b border-slate-50 last:border-0">
                                    <div className={`w-2 h-2 rounded-full ${act.type === 'enrollment' ? 'bg-blue-500' : 'bg-amber-500'}`}></div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-slate-900 truncate">{act.message}</p>
                                        <p className="text-xs text-slate-500">{act.timeAgo}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-slate-400 py-4 text-center italic">No recent activity found.</p>
                        )}
                    </div>
                </Card>

                <Card className="p-6">
                    <h3 className="font-bold text-slate-900 mb-4">Top Performing Courses</h3>
                    <div className="space-y-4">
                        {topCourses.length > 0 ? (
                            topCourses.map((course) => (
                                <div key={course._id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-slate-700 truncate">{course.title}</p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{course.studentsCount || 0} Learners</p>
                                    </div>
                                    <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-bold ml-4">
                                        {course.rating} ★
                                    </span>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-slate-400 py-4 text-center italic">No courses created yet.</p>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
}
