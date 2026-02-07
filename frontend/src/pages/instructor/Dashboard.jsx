import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db, auth } from '../../lib/firebase';
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
    const { userData } = useAuth();
    const [stats, setStats] = useState({
        students: 0,
        courses: 0,
        completions: 0,
        hours: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (userData) fetchStats();
    }, [userData]);

    const fetchStats = async () => {
        try {
            let coursesCount = 0;
            let studentsCount = 0; // Simplified

            if (userData?.role === 'admin') {
                const coursesSnap = await getDocs(collection(db, 'courses'));
                coursesCount = coursesSnap.size;

                const usersSnap = await getDocs(query(collection(db, 'users'), where('role', '==', 'learner')));
                studentsCount = usersSnap.size;
            } else {
                const coursesQ = query(collection(db, 'courses'), where('instructorId', '==', auth.currentUser?.uid));
                const coursesSnap = await getDocs(coursesQ);
                coursesCount = coursesSnap.size;

                // Mock student count for instructor for now or fetch enrollments
                // const enrollmentsQ = query(collection(db, 'enrollments')...
                studentsCount = 42; // Placeholder for instructor specific student count
            }

            setStats({
                students: studentsCount,
                courses: coursesCount,
                completions: 15, // Mock
                hours: 120 // Mock
            });
        } catch (error) {
            console.error("Error fetching dashboard stats:", error);
        } finally {
            setLoading(false);
        }
    };
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
                        {[1, 2, 3].map((_, i) => (
                            <div key={i} className="flex items-center gap-4 py-2 border-b border-slate-50 last:border-0">
                                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                <div>
                                    <p className="text-sm font-medium text-slate-900">New student enrolled in "React Mastery"</p>
                                    <p className="text-xs text-slate-500">2 hours ago</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                <Card className="p-6">
                    <h3 className="font-bold text-slate-900 mb-4">Top Performing Courses</h3>
                    <div className="space-y-4">
                        {['React Fundamentals', 'Advanced Node.js', 'UI/UX Design Principles'].map((course, i) => (
                            <div key={i} className="flex items-center justify-between py-2">
                                <span className="text-sm font-medium text-slate-700">{course}</span>
                                <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-medium">Top Rated</span>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
}
