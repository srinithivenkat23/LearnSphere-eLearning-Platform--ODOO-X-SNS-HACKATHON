import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, documentId, doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { PlayCircle, CheckCircle, Clock, Trophy, Star, BookOpen, ChevronRight, LayoutGrid, List, Award, Shield, Users, Search } from 'lucide-react';

export default function MyCourses() {
    const { userData } = useAuth();
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [enrollments, setEnrollments] = useState({});
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('grid');
    const [searchTerm, setSearchTerm] = useState('');
    const [avgCompletion, setAvgCompletion] = useState(0);

    useEffect(() => {
        if (auth.currentUser) {
            fetchMyCourses();
        }
    }, []);

    const fetchMyCourses = async () => {
        const userId = auth.currentUser?.uid;
        try {
            const enrollmentsQ = query(collection(db, 'enrollments'), where('userId', '==', userId));
            const enrollmentsSnap = await getDocs(enrollmentsQ);

            if (enrollmentsSnap.empty) {
                setLoading(false);
                return;
            }

            const enrollmentsMap = {};
            const courseIds = [];
            let totalProgress = 0;
            enrollmentsSnap.forEach(doc => {
                const data = { id: doc.id, ...doc.data() };
                enrollmentsMap[data.courseId] = data;
                courseIds.push(data.courseId);
                totalProgress += data.progressPercent || 0;
            });
            setEnrollments(enrollmentsMap);
            setAvgCompletion(enrollmentsSnap.size > 0 ? Math.round(totalProgress / enrollmentsSnap.size) : 0);

            const coursesData = [];
            for (const cid of courseIds) {
                const cSnap = await getDoc(doc(db, 'courses', cid));
                if (cSnap.exists()) {
                    coursesData.push({ id: cSnap.id, ...cSnap.data() });
                }
            }
            setCourses(coursesData);
        } catch (error) {
            console.error("Error fetching my courses:", error);
        } finally {
            setLoading(false);
        }
    };

    const getBadge = (points) => {
        if (points >= 120) return { name: 'Master', color: 'text-purple-600 bg-purple-50 border-purple-100', icon: Trophy };
        if (points >= 100) return { name: 'Expert', color: 'text-rose-600 bg-rose-50 border-rose-100', icon: Award };
        if (points >= 80) return { name: 'Specialist', color: 'text-amber-600 bg-amber-50 border-amber-100', icon: Shield };
        if (points >= 60) return { name: 'Achiever', color: 'text-emerald-600 bg-emerald-50 border-emerald-100', icon: Star };
        if (points >= 40) return { name: 'Explorer', color: 'text-blue-600 bg-blue-50 border-blue-100', icon: BookOpen };
        if (points >= 20) return { name: 'Newbie', color: 'text-slate-600 bg-slate-50 border-slate-100', icon: Users };
        return { name: 'Beginner', color: 'text-slate-400 bg-slate-50 border-slate-100', icon: Users };
    };

    const filteredCourses = courses.filter(c =>
        c.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const badge = getBadge(userData?.points || 0);
    const BadgeIcon = badge.icon;

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-white font-sans">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
                    {/* Left Side: Profile Panel */}
                    <div className="lg:col-span-1 space-y-8">
                        <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100 text-center sticky top-24">
                            <div className="w-24 h-24 bg-white rounded-full mx-auto mb-6 shadow-xl flex items-center justify-center text-blue-600 border-4 border-blue-100">
                                <span className="text-3xl font-bold uppercase">{userData?.name ? userData.name[0] : 'U'}</span>
                            </div>
                            <h2 className="text-xl font-bold text-slate-900 mb-1">{userData?.name || 'User'}</h2>
                            <p className="text-sm text-slate-500 mb-6">{userData?.email || auth.currentUser?.email}</p>

                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                                    <span className="block text-xl font-bold text-blue-600">{userData?.points || 0}</span>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Points</span>
                                </div>
                                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                                    <span className="block text-xl font-bold text-emerald-600">{avgCompletion}%</span>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Avg Completion</span>
                                </div>
                            </div>

                            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm mb-8">
                                <span className="block text-xl font-bold text-indigo-600">{courses.length}</span>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Enrolled Courses</span>
                            </div>

                            <div className={`p-4 rounded-2xl border ${badge.color} flex flex-col items-center gap-2`}>
                                <BadgeIcon size={24} />
                                <span className="text-xs font-bold uppercase tracking-widest">{badge.name} Level</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Side: Courses */}
                    <div className="lg:col-span-3">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                            <div>
                                <h1 className="text-3xl font-bold text-slate-900">Student Dashboard</h1>
                                <p className="text-slate-500">Track your progress and continue learning</p>
                            </div>
                            <div className="flex gap-4 w-full md:w-auto">
                                <div className="relative flex-1 md:w-64">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="text"
                                        placeholder="Search your courses..."
                                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <div className="flex gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200">
                                    <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-white shadow text-blue-600' : 'text-slate-400'}`}><LayoutGrid size={18} /></button>
                                    <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-white shadow text-blue-600' : 'text-slate-400'}`}><List size={18} /></button>
                                </div>
                            </div>
                        </div>

                        {filteredCourses.length === 0 ? (
                            <div className="bg-slate-50 rounded-3xl p-16 text-center border border-dashed border-slate-200">
                                <BookOpen size={48} className="mx-auto text-slate-300 mb-4" />
                                <h3 className="text-xl font-bold text-slate-900 mb-2">No courses found</h3>
                                <p className="text-slate-500 mb-8 max-w-sm mx-auto">Try a different search term or explore our catalog for more courses.</p>
                                <Button onClick={() => navigate('/')}>Explore Catalog</Button>
                            </div>
                        ) : (
                            <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 gap-8" : "space-y-4"}>
                                {filteredCourses.map(course => {
                                    const enrollment = enrollments[course.id];
                                    const progress = enrollment?.progressPercent || 0;
                                    const isCompleted = enrollment?.completed;
                                    const hasStarted = Object.keys(enrollment?.progress || {}).length > 0;

                                    if (viewMode === 'grid') {
                                        return (
                                            <div key={course.id} className="group bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col">
                                                <div className="aspect-video bg-slate-200 relative overflow-hidden">
                                                    {course.imageUrl ? (
                                                        <img src={course.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-slate-300"><BookOpen size={40} /></div>
                                                    )}
                                                </div>
                                                <div className="p-6 flex-1 flex flex-col">
                                                    <div className="flex flex-wrap gap-2 mb-4">
                                                        {course.tags?.slice(0, 2).map((tag, i) => (
                                                            <span key={i} className="px-2 py-0.5 bg-blue-50 text-[10px] font-bold text-blue-600 uppercase tracking-widest rounded">{tag}</span>
                                                        ))}
                                                    </div>
                                                    <h3 className="font-bold text-slate-900 mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">{course.title}</h3>
                                                    <p className="text-xs text-slate-500 mb-6 line-clamp-2 leading-relaxed">{course.description || course.shortDescription}</p>

                                                    <div className="mt-auto space-y-4">
                                                        <div className="space-y-2">
                                                            <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                                                                <span className="text-slate-400">{progress}% Completed</span>
                                                                <span className="text-slate-400 italic">
                                                                    {enrollment.lastActive ? `Active ${new Date(enrollment.lastActive.toDate()).toLocaleDateString()}` : 'Not started'}
                                                                </span>
                                                            </div>
                                                            <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                                                                <div className={`h-full transition-all duration-1000 ${isCompleted ? 'bg-emerald-500' : 'bg-blue-600'}`} style={{ width: `${progress}%` }}></div>
                                                            </div>
                                                        </div>

                                                        <Button
                                                            className="w-full font-bold"
                                                            variant={isCompleted ? "outline" : "primary"}
                                                            onClick={() => navigate(`/courses/${course.id}/learn`)}
                                                        >
                                                            {isCompleted ? 'Review' : hasStarted ? 'Continue' : 'Start'}
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    }

                                    return (
                                        <div key={course.id} className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center gap-6 group hover:border-blue-200 transition-all">
                                            <div className="w-40 aspect-video bg-slate-100 rounded-xl overflow-hidden shrink-0">
                                                <img src={course.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-bold text-slate-900 truncate mb-1 group-hover:text-blue-600 transition-colors uppercase text-sm">{course.title}</h3>
                                                <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
                                                    <span className="flex items-center gap-1"><BookOpen size={12} /> {course.lessonsCount || 0} Lessons</span>
                                                    <span className="flex items-center gap-1"><Clock size={12} /> 4h 30m</span>
                                                </div>
                                                <div className="w-full h-1 bg-slate-50 rounded-full overflow-hidden">
                                                    <div className={`h-full transition-all duration-1000 ${isCompleted ? 'bg-emerald-500' : 'bg-blue-600'}`} style={{ width: `${progress}%` }}></div>
                                                </div>
                                            </div>
                                            <Button size="sm" onClick={() => navigate(`/courses/${course.id}/learn`)}>
                                                {isCompleted ? 'Review' : hasStarted ? 'Continue' : 'Start'}
                                            </Button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
