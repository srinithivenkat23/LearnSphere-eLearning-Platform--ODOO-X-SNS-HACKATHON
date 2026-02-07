import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs, addDoc, orderBy, updateDoc } from 'firebase/firestore';
import { db, auth } from '../../lib/firebase';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Reviews from '../../components/learner/Reviews';
import { Search, BookOpen, Clock, Users, Zap, Shield, Globe, ArrowRight, Award, CheckCircle, Star, Lock } from 'lucide-react';

import { useAuth } from '../../context/AuthContext';

export default function CourseDetail() {
    const { userData } = useAuth();
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [lessons, setLessons] = useState([]);
    const [enrollment, setEnrollment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [enrolling, setEnrolling] = useState(false);
    const [activeTab, setActiveTab] = useState('about');
    const [scrolled, setScrolled] = useState(false);
    const [lessonSearch, setLessonSearch] = useState('');

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 400);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        loadCourseData();
    }, [courseId]);

    const loadCourseData = async () => {
        try {
            const courseDoc = await getDoc(doc(db, 'courses', courseId));
            if (!courseDoc.exists()) {
                alert("Course not found");
                navigate('/');
                return;
            }
            setCourse({ id: courseDoc.id, ...courseDoc.data() });

            const qLessons = query(collection(db, 'lessons'), where('courseId', '==', courseId), orderBy('order', 'asc'));
            const lessonsSnap = await getDocs(qLessons);
            setLessons(lessonsSnap.docs.map(d => ({ id: d.id, ...d.data() })));

            if (auth.currentUser) {
                const qEnroll = query(
                    collection(db, 'enrollments'),
                    where('userId', '==', auth.currentUser.uid),
                    where('courseId', '==', courseId)
                );
                const enrollSnap = await getDocs(qEnroll);
                if (!enrollSnap.empty) {
                    setEnrollment({ id: enrollSnap.docs[0].id, ...enrollSnap.docs[0].data() });
                }
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleEnroll = async () => {
        if (!auth.currentUser) {
            navigate('/login');
            return;
        }

        if (course.accessRule === 'paid') {
            const confirmed = window.confirm(`This course costs $${course.price}. Proceed to mock payment?`);
            if (!confirmed) return;
            setEnrolling(true);
            await new Promise(resolve => setTimeout(resolve, 1500));
            alert("Payment successful! You are now enrolled.");
        }

        setEnrolling(true);
        try {
            await addDoc(collection(db, 'enrollments'), {
                userId: auth.currentUser.uid,
                userName: userData?.name || auth.currentUser.displayName || auth.currentUser.email,
                courseId: courseId,
                enrolledAt: new Date(),
                progress: {},
                progressPercent: 0,
                completed: false
            });

            const { increment } = await import('firebase/firestore');
            await updateDoc(doc(db, 'courses', courseId), {
                studentsCount: increment(1)
            });

            const userRef = doc(db, 'users', auth.currentUser.uid);
            await updateDoc(userRef, {
                points: increment(50)
            });

            alert("Successfully enrolled! You earned 50 points.");
            loadCourseData();
        } catch (err) {
            console.error(err);
            alert("Enrollment failed");
        } finally {
            setEnrolling(false);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-500">Loading course...</div>;
    if (!course) return null;

    const completedLessonsCount = lessons.filter(l => enrollment?.progress?.[l.id]?.completed).length;
    const incompleteLessonsCount = lessons.length - completedLessonsCount;
    const progressPercent = enrollment?.progressPercent || 0;

    const filteredLessons = lessons.filter(l =>
        l.title.toLowerCase().includes(lessonSearch.toLowerCase())
    );

    return (
        <div className="bg-slate-50 min-h-screen pb-20">
            {/* Dark Hero Section */}
            <div className="bg-slate-900 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-900 to-slate-900 opacity-90"></div>
                <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 relative z-10 flex flex-col md:flex-row gap-12">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-6 animate-fade-in-up">
                            {course.tags?.map((tag, i) => (
                                <span key={i} className="text-xs font-bold text-blue-100 bg-white/10 px-3 py-1 rounded-full uppercase tracking-wider border border-white/20">
                                    {tag}
                                </span>
                            ))}
                        </div>
                        <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-6 leading-tight animate-fade-in-up animation-delay-100">
                            {course.title}
                        </h1>
                        <p className="text-lg text-blue-100 mb-8 max-w-2xl leading-relaxed animate-fade-in-up animation-delay-200">
                            {course.description}
                        </p>

                        <div className="flex items-center gap-3 mb-8 animate-fade-in-up animation-delay-300">
                            <div className="flex text-yellow-400 gap-0.5">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} size={18} className={i < Math.floor(course.rating || 0) ? "fill-current" : "text-white/20"} />
                                ))}
                            </div>
                            <span className="text-xl font-bold">{course.rating ? Number(course.rating).toFixed(1) : '4.5'}</span>
                            <span className="text-blue-200 text-sm">({course.reviewsCount || 0} reviews)</span>
                        </div>

                        <div className="flex flex-wrap items-center gap-8 text-sm text-blue-200 animate-fade-in-up animation-delay-300">
                            <div className="flex items-center gap-2">
                                <Clock size={18} className="text-blue-400" />
                                <span>{course.lessonsCount} Lessons</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Users size={18} className="text-blue-400" />
                                <span>{course.studentsCount || 0} Students</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Globe size={18} className="text-blue-400" />
                                <span>English</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Award size={18} className="text-blue-400" />
                                <span>Certificate of Completion</span>
                            </div>
                        </div>

                        {enrollment && (
                            <div className="mt-8 max-w-md animate-fade-in-up animation-delay-400">
                                <div className="flex justify-between items-end mb-2">
                                    <span className="text-xs font-bold uppercase tracking-widest text-blue-300">Overall Progress</span>
                                    <span className="text-lg font-bold text-white">{progressPercent}%</span>
                                </div>
                                <div className="h-2 bg-white/10 rounded-full overflow-hidden border border-white/5">
                                    <div className="h-full bg-blue-500 transition-all duration-1000" style={{ width: `${progressPercent}%` }}></div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Sticky Sub-Navbar */}
            <div className={`sticky top-[68px] z-40 bg-white border-b border-slate-200 transition-all ${scrolled ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14">
                    <div className="flex gap-8 overflow-x-auto no-scrollbar">
                        {['Course Overview', 'syllabus', 'reviews', 'instructor'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => {
                                    setActiveTab(tab === 'Course Overview' ? 'about' : tab);
                                    document.getElementById(tab === 'Course Overview' ? 'about' : tab)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                }}
                                className={`text-sm font-bold capitalize whitespace-nowrap border-b-2 h-14 ${activeTab === (tab === 'Course Overview' ? 'about' : tab) ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500'}`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                    {!enrollment && (
                        <Button size="sm" onClick={handleEnroll} disabled={enrolling}>
                            {enrolling ? 'Enrolling...' : 'Join Now'}
                        </Button>
                    )}
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Content */}
                    <div className="lg:col-span-2 space-y-12">
                        {/* About Section */}
                        <div id="about" className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
                            <h2 className="text-2xl font-bold text-slate-900 mb-6">Course Overview</h2>
                            <p className="text-slate-600 leading-relaxed mb-8">
                                {course.description}
                            </p>
                            <h3 className="text-lg font-bold text-slate-900 mb-6">What you'll learn</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex gap-3">
                                    <CheckCircle size={20} className="text-green-500 shrink-0" />
                                    <span className="text-slate-600">Master the core concepts of this subject</span>
                                </div>
                                <div className="flex gap-3">
                                    <CheckCircle size={20} className="text-green-500 shrink-0" />
                                    <span className="text-slate-600">Build real-world projects</span>
                                </div>
                                <div className="flex gap-3">
                                    <CheckCircle size={20} className="text-green-500 shrink-0" />
                                    <span className="text-slate-600">Advanced techniques and best practices</span>
                                </div>
                                <div className="flex gap-3">
                                    <CheckCircle size={20} className="text-green-500 shrink-0" />
                                    <span className="text-slate-600">Certificate of completion</span>
                                </div>
                            </div>
                        </div>

                        {/* Course Content / Syllabus */}
                        <div id="syllabus" className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                            <div className="p-8 border-b border-slate-100">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                    <div>
                                        <h2 className="text-2xl font-bold text-slate-900">Syllabus</h2>
                                        <div className="flex items-center gap-4 mt-2">
                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{lessons.length} Total Lessons</span>
                                            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest leading-none flex items-center gap-1">
                                                <CheckCircle size={10} /> {completedLessonsCount} Completed
                                            </span>
                                            <span className="text-xs font-bold text-amber-600 uppercase tracking-widest flex items-center gap-1">
                                                <Clock size={10} /> {incompleteLessonsCount} Incomplete
                                            </span>
                                        </div>
                                    </div>
                                    <div className="relative w-full md:w-64">
                                        <PlayCircle size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                                        <input
                                            type="text"
                                            placeholder="Search lesson..."
                                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                            value={lessonSearch}
                                            onChange={(e) => setLessonSearch(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="divide-y divide-slate-100">
                                {filteredLessons.length > 0 ? (
                                    filteredLessons.map((lesson, index) => {
                                        const lessonProgress = enrollment?.progress?.[lesson.id];
                                        const isCompleted = lessonProgress?.completed;
                                        const isInProgress = lessonProgress && !isCompleted;
                                        const isLocked = !enrollment && index > 3;

                                        return (
                                            <div key={lesson.id} className="p-6 flex items-center gap-4 hover:bg-slate-50 transition-colors group cursor-pointer" onClick={() => !isLocked && navigate(`/courses/${courseId}/learn`)}>
                                                <div className="flex items-center justify-center w-10 h-10 rounded-full border border-slate-100 bg-white text-slate-500 font-bold text-sm group-hover:bg-blue-50 group-hover:text-blue-600 group-hover:border-blue-100 transition-all shadow-sm">
                                                    {isCompleted ? (
                                                        <CheckCircle size={20} className="text-blue-600" />
                                                    ) : isInProgress ? (
                                                        <PlayCircle size={20} className="text-blue-600 animate-pulse" />
                                                    ) : (
                                                        index + 1
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className={`font-bold text-base truncate ${isLocked ? 'text-slate-400' : 'text-slate-900 group-hover:text-blue-700'}`}>
                                                        {lesson.title}
                                                    </h4>
                                                    <div className="flex items-center gap-3 mt-1">
                                                        <span className="flex items-center gap-1.5 text-xs text-slate-400 uppercase font-bold tracking-wider">
                                                            {lesson.type === 'video' ? <PlayCircle size={14} className="text-blue-400" /> : <BookOpen size={14} className="text-purple-400" />} {lesson.type}
                                                        </span>
                                                        <span className="text-slate-300">•</span>
                                                        <span className="text-xs text-slate-400 font-medium">15 min</span>
                                                    </div>
                                                </div>
                                                <div>
                                                    {isLocked ? (
                                                        <Lock size={18} className="text-slate-300" />
                                                    ) : (
                                                        <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-widest border ${isCompleted ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-slate-50 text-slate-400 border-slate-100'
                                                            }`}>
                                                            {isCompleted ? 'Finished' : 'Preview'}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="p-12 text-center text-slate-400 text-sm italic">No matching lessons found.</div>
                                )}
                            </div>
                        </div>

                        {/* Instructor */}
                        <div id="instructor" className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
                            <h2 className="text-2xl font-bold text-slate-900 mb-8">Meet your instructor</h2>
                            <div className="flex flex-col md:flex-row items-center md:items-start gap-8 bg-slate-50 p-8 rounded-2xl border border-slate-100">
                                <div className="w-32 h-32 rounded-full ring-4 ring-white shadow-xl overflow-hidden shrink-0">
                                    <img src={`https://i.pravatar.cc/150?u=${course.instructorId}`} alt="Instructor" className="w-full h-full object-cover" />
                                </div>
                                <div className="text-center md:text-left">
                                    <h3 className="font-bold text-2xl text-slate-900 mb-1">{course.instructorName || 'Expert Instructor'}</h3>
                                    <p className="text-blue-600 font-bold text-sm mb-4 uppercase tracking-widest">Master of {course.category || 'Science'}</p>
                                    <p className="text-slate-600 text-base leading-relaxed mb-6">
                                        With over a decade of experience in building enterprise-scale applications and teaching thousands of students globally, our instructor brings deep practical insights and a passion for student success.
                                    </p>
                                    <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto md:mx-0">
                                        <div className="bg-white p-3 rounded-xl border border-slate-200">
                                            <span className="block text-lg font-bold text-slate-900">4.9/5</span>
                                            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-tight">Instructor Rating</span>
                                        </div>
                                        <div className="bg-white p-3 rounded-xl border border-slate-200">
                                            <span className="block text-lg font-bold text-slate-900">12k+</span>
                                            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-tight">Active Students</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div id="reviews">
                            <Reviews courseId={courseId} />
                        </div>
                    </div>

                    {/* Right Column: Sticky Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24 space-y-6">
                            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
                                <div className="aspect-video bg-slate-200 relative group cursor-pointer">
                                    {course.imageUrl ? (
                                        <img src={course.imageUrl} alt={course.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-slate-800 text-white">
                                            <span className="font-bold">Preview Course</span>
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
                                            <PlayCircle size={32} className="text-slate-900 ml-1" />
                                        </div>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <div className="flex items-baseline gap-2 mb-6">
                                        {course.accessRule === 'paid' ? (
                                            <>
                                                <span className="text-3xl font-bold text-slate-900">${course.price}</span>
                                                <span className="text-lg text-slate-400 line-through">${(course.price * 1.5).toFixed(2)}</span>
                                            </>
                                        ) : (
                                            <span className="text-3xl font-bold text-green-600">Free</span>
                                        )}
                                    </div>

                                    {enrollment ? (
                                        <Button
                                            size="lg"
                                            className="w-full h-12 text-lg shadow-lg shadow-blue-500/30 mb-4"
                                            onClick={() => navigate(`/courses/${courseId}/learn`)}
                                        >
                                            {enrollment.completed ? 'Review Course' : 'Continue Learning'}
                                        </Button>
                                    ) : (
                                        <Button
                                            size="lg"
                                            className="w-full h-12 text-lg shadow-lg shadow-blue-500/30 mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transform hover:-translate-y-0.5 transition-all"
                                            onClick={handleEnroll}
                                            disabled={enrolling}
                                        >
                                            {enrolling ? 'Enrolling...' : course.accessRule === 'paid' ? 'Buy Now' : 'Enroll for Free'}
                                        </Button>
                                    )}

                                    <p className="text-center text-xs text-slate-500 mb-6">30-Day Money-Back Guarantee</p>

                                    <div className="space-y-4">
                                        <h4 className="font-bold text-slate-900 text-sm">This course includes:</h4>
                                        <div className="space-y-3 text-sm text-slate-600">
                                            <div className="flex items-center gap-3">
                                                <PlayCircle size={16} className="text-slate-400" />
                                                <span>{course.lessonsCount} on-demand video lessons</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Shield size={16} className="text-slate-400" />
                                                <span>Access on mobile and TV</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Award size={16} className="text-slate-400" />
                                                <span>Certificate of completion</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
