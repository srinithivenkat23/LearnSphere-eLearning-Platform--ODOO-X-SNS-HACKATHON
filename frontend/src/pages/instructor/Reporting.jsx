import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, getDoc, updateDoc, orderBy } from 'firebase/firestore';
import { db, auth } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { Search, Users, CheckCircle, Clock, BarChart3, TrendingUp } from 'lucide-react';

export default function InstructorReporting() {
    const { userData } = useAuth();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalStudents: 0,
        activeStudents: 0,
        completions: 0,
        avgProgress: 0,
        avgQuizScore: 0,
        mostActiveCourse: 'N/A'
    });
    const [enrollments, setEnrollments] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [studentLessons, setStudentLessons] = useState([]);

    useEffect(() => {
        if (userData) loadData();
    }, [userData]);

    const loadData = async () => {
        try {
            const coursesMap = {};
            let myEnrollments = [];

            if (userData?.role === 'admin') {
                const allCoursesSnap = await getDocs(collection(db, 'courses'));
                allCoursesSnap.docs.forEach(d => coursesMap[d.id] = d.data());
                const allEnrollmentsSnap = await getDocs(collection(db, 'enrollments'));
                myEnrollments = allEnrollmentsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
            } else {
                const coursesQ = query(collection(db, 'courses'), where('instructorId', '==', auth.currentUser?.uid));
                const coursesSnap = await getDocs(coursesQ);
                const myCourseIds = coursesSnap.docs.map(d => d.id);
                coursesSnap.docs.forEach(d => coursesMap[d.id] = d.data());

                if (myCourseIds.length > 0) {
                    const enrollmentsRef = collection(db, 'enrollments');
                    const enrollmentsSnap = await getDocs(enrollmentsRef);
                    myEnrollments = enrollmentsSnap.docs
                        .map(d => ({ id: d.id, ...d.data() }))
                        .filter(e => myCourseIds.includes(e.courseId));
                }
            }

            let completed = 0;
            let inProgress = 0;
            let totalProgress = 0;
            const courseEngagement = {};

            myEnrollments.forEach(e => {
                if (e.completed) completed++;
                else inProgress++;
                totalProgress += e.progressPercent || 0;

                e.courseTitle = coursesMap[e.courseId]?.title || 'Unknown Course';
                e.studentName = e.userName || 'Student';
                e.enrolledDate = e.enrolledAt?.toDate?.().toLocaleDateString() || 'N/A';
                e.completedDate = e.completedAt?.toDate?.().toLocaleDateString() || '-';
                e.lastActiveDate = e.lastActive?.toDate?.().toLocaleDateString() || e.enrolledDate;
                e.status = e.completed ? 'Completed' : 'In Progress';

                courseEngagement[e.courseTitle] = (courseEngagement[e.courseTitle] || 0) + 1;
            });

            // 5. Fetch Quiz Attempts
            let attempts = [];
            if (userData?.role === 'admin') {
                const allAttemptsSnap = await getDocs(collection(db, 'attempts'));
                attempts = allAttemptsSnap.docs.map(d => d.data());
            } else {
                if (Object.keys(coursesMap).length > 0) {
                    const attemptsSnap = await getDocs(collection(db, 'attempts'));
                    attempts = attemptsSnap.docs
                        .map(d => d.data())
                        .filter(a => coursesMap[a.courseId]);
                }
            }

            const totalScore = attempts.reduce((acc, curr) => acc + (curr.total > 0 ? (curr.score / curr.total) * 100 : 0), 0);
            const avgQuiz = attempts.length ? Math.round(totalScore / attempts.length) : 0;

            // Map last attempt to enrollments
            myEnrollments.forEach(enroll => {
                const studentAttempts = attempts
                    .filter(a => a.userId === enroll.userId && a.courseId === enroll.courseId)
                    .sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));

                const last = studentAttempts[0];
                enroll.lastQuizScore = (last && last.total > 0) ? `${Math.round((last.score / last.total) * 100)}%` : '-';
            });

            const mostActive = Object.entries(courseEngagement).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

            setStats({
                totalStudents: myEnrollments.length,
                activeStudents: inProgress,
                completions: completed,
                avgProgress: myEnrollments.length ? Math.round(totalProgress / myEnrollments.length) : 0,
                avgQuizScore: avgQuiz,
                mostActiveCourse: mostActive
            });

            setEnrollments(myEnrollments);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleViewProgress = async (enrollment) => {
        setSelectedStudent(enrollment);
        try {
            const qLessons = query(collection(db, 'lessons'), where('courseId', '==', enrollment.courseId), orderBy('order', 'asc'));
            const lessonsSnap = await getDocs(qLessons);
            const lessons = lessonsSnap.docs.map(d => ({
                id: d.id,
                ...d.data(),
                isCompleted: enrollment.progress?.[d.id]?.completed,
                completedAt: enrollment.progress?.[d.id]?.completedAt?.toDate?.().toLocaleDateString() || '-'
            }));
            setStudentLessons(lessons);
        } catch (err) {
            console.error(err);
        }
    };

    const filteredEnrollments = enrollments.filter(e =>
        e.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.courseTitle.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="p-20 text-center text-slate-500">Loading reports...</div>;

    return (
        <div className="p-6 md:p-10 max-w-7xl mx-auto bg-slate-50 min-h-screen">
            <div className="mb-10">
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Analytics & Reporting</h1>
                <p className="text-slate-500 mt-1">Deep dive into learner progress and course performance metrics.</p>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <Card className="p-6 bg-white border-slate-200">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-blue-50 text-blue-600"><Users size={24} /></div>
                        <div>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">Total Learners</p>
                            <h3 className="text-3xl font-bold text-slate-900">{stats.totalStudents}</h3>
                        </div>
                    </div>
                </Card>
                <Card className="p-6 bg-white border-slate-200">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-amber-50 text-amber-600"><Clock size={24} /></div>
                        <div>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">Avg. Progress</p>
                            <h3 className="text-3xl font-bold text-slate-900">{stats.avgProgress}%</h3>
                        </div>
                    </div>
                </Card>
                <Card className="p-6 bg-white border-slate-200">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600"><CheckCircle size={24} /></div>
                        <div>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">Completions</p>
                            <h3 className="text-3xl font-bold text-slate-900">{stats.completions}</h3>
                        </div>
                    </div>
                </Card>
                <Card className="p-6 bg-white border-slate-200">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-purple-50 text-purple-600"><TrendingUp size={24} /></div>
                        <div>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">Avg. Quiz Score</p>
                            <h3 className="text-3xl font-bold text-slate-900">{stats.avgQuizScore}%</h3>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Main Table Section */}
            <Card className="overflow-hidden border-slate-200 shadow-xl shadow-slate-200/50">
                <div className="p-6 border-b border-slate-100 bg-white flex flex-col md:flex-row justify-between items-center gap-6">
                    <h3 className="font-bold text-slate-900 text-lg">Enrolled Learners</h3>
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by name or course..."
                            className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Learner</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Course</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Progress</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Last Quiz</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Last Active</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                            {filteredEnrollments.map((row) => (
                                <tr key={row.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-slate-900">{row.studentName}</div>
                                        <div className="text-[10px] text-zinc-400 font-medium">Joined {row.enrolledDate}</div>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-slate-600">{row.courseTitle}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden w-24">
                                                <div
                                                    className={`h-full rounded-full transition-all duration-1000 ${row.progressPercent === 100 ? 'bg-emerald-500' : 'bg-blue-500'}`}
                                                    style={{ width: `${row.progressPercent || 0}%` }}
                                                ></div>
                                            </div>
                                            <span className="text-[11px] font-bold text-slate-400">{row.progressPercent || 0}%</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm font-medium text-slate-600">{row.lastQuizScore}</span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-500 font-medium">{row.lastActiveDate}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => handleViewProgress(row)}
                                            className="text-blue-600 hover:text-blue-800 font-bold text-xs underline underline-offset-4"
                                        >
                                            Details
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Student Progress Modal */}
            {selectedStudent && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <Card className="w-full max-w-2xl bg-white shadow-2xl rounded-3xl overflow-hidden border-none transform transition-all scale-100">
                        <div className="p-8 border-b border-slate-100 flex justify-between items-start">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900 mb-1">{selectedStudent.studentName}'s Progress</h2>
                                <p className="text-sm text-slate-500 font-medium">{selectedStudent.courseTitle}</p>
                            </div>
                            <button
                                onClick={() => setSelectedStudent(null)}
                                className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
                            >
                                <Users size={20} />
                            </button>
                        </div>
                        <div className="p-8 max-h-[60vh] overflow-y-auto">
                            <div className="space-y-4">
                                {studentLessons.map((lesson, idx) => (
                                    <div key={idx} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${lesson.isCompleted ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-400'}`}>
                                            {lesson.isCompleted ? <CheckCircle size={16} /> : <span className="text-xs font-bold">{idx + 1}</span>}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm font-bold truncate ${lesson.isCompleted ? 'text-slate-900' : 'text-slate-500'}`}>{lesson.title}</p>
                                            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-tighter">{lesson.type} • 15:00</p>
                                        </div>
                                        {lesson.isCompleted && (
                                            <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 uppercase tracking-widest">
                                                Done {lesson.completedAt}
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
                            <Button onClick={() => setSelectedStudent(null)} className="px-8">Close Details</Button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}
