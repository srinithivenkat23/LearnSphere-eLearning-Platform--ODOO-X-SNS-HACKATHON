import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
const API_URL = 'http://localhost:5000/api';
import { PlayCircle, Search, BookOpen, Clock, Users, Zap, Shield, Globe, ArrowRight, Award, CheckCircle, Star, Lock } from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Reviews from '../../components/learner/Reviews';
import EnrollmentModal from '../../components/learner/EnrollmentModal';

import { useAuth } from '../../context/AuthContext';

export default function CourseDetail() {
    const { user, userData } = useAuth();
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
    const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);

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
            const response = await axios.get(`${API_URL}/courses/${courseId}`);
            setCourse(response.data);

            // Fetch separate lessons
            const lessonsRes = await axios.get(`${API_URL}/lessons/course/${courseId}`);
            setLessons(lessonsRes.data || []);

            if (user) {
                const enResponse = await axios.get(`${API_URL}/enrollments/my-courses`);
                const enroll = enResponse.data.find(e => e.courseId?._id === courseId);
                if (enroll) {
                    setEnrollment(enroll);
                }
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleEnroll = () => {
        if (!user) {
            navigate('/login');
            return;
        }
        setIsEnrollModalOpen(true);
    };

    const handleFinalEnroll = async (studentDetails) => {
        setEnrolling(true);
        try {
            await axios.post(`${API_URL}/enrollments/enroll`, {
                courseId,
                studentDetails
            });
            alert("Successfully enrolled!");
            setIsEnrollModalOpen(false);
            loadCourseData();
        } catch (err) {
            console.error(err);
            alert("Enrollment failed: " + (err.response?.data?.message || err.message));
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
                        <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-6 leading-tight animate-fade-in-up">
                            {course.title}
                        </h1>
                        <p className="text-lg text-blue-100 mb-8 max-w-2xl leading-relaxed animate-fade-in-up">
                            {course.shortDescription || course.description?.substring(0, 150) + '...'}
                        </p>

                        <div className="flex items-center gap-3 mb-8 animate-fade-in-up">
                            <div className="flex text-yellow-400 gap-0.5">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} size={18} className={i < Math.floor(course.rating || 0) ? "fill-current" : "text-white/20"} />
                                ))}
                            </div>
                            <span className="text-xl font-bold">{course.rating ? Number(course.rating).toFixed(1) : '4.5'}</span>
                            <span className="text-blue-200 text-sm">({course.reviewsCount || 0} reviews)</span>
                        </div>

                        <div className="flex flex-wrap items-center gap-8 text-sm text-blue-200 animate-fade-in-up">
                            <div className="flex items-center gap-2">
                                <Clock size={18} className="text-blue-400" />
                                <span>{lessons.length} Lessons</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Users size={18} className="text-blue-400" />
                                <span>{course.studentsCount || 0} Students</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Globe size={18} className="text-blue-400" />
                                <span>English</span>
                            </div>
                        </div>

                        {enrollment && (
                            <div className="mt-8 max-w-md animate-fade-in-up">
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

            {/* Tab Navigation */}
            <div className="bg-white border-b border-slate-200 sticky top-[68px] z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex gap-8">
                        {['overview', 'reviews'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`py-4 text-sm font-bold uppercase tracking-widest border-b-2 transition-all ${activeTab === tab ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-20">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Left Column: Content */}
                    <div className="lg:col-span-2 space-y-12">
                        {activeTab === 'overview' ? (
                            <div className="space-y-12">
                                {/* About Section */}
                                <div className="bg-white rounded-3xl p-10 shadow-sm border border-slate-100">
                                    <h2 className="text-2xl font-bold text-slate-900 mb-6">Course Description</h2>
                                    <p className="text-slate-600 leading-relaxed text-lg">
                                        {course.description}
                                    </p>
                                </div>

                                {/* Syllabus */}
                                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                                    <div className="p-10 border-b border-slate-100">
                                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                            <div>
                                                <h2 className="text-2xl font-bold text-slate-900">Syllabus</h2>
                                                <div className="flex items-center gap-4 mt-2">
                                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{lessons.length} Total Lessons</span>
                                                    {enrollment && (
                                                        <span className="text-xs font-bold text-blue-600 uppercase tracking-widest leading-none flex items-center gap-1">
                                                            <CheckCircle size={10} /> {completedLessonsCount} Completed
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="relative w-full md:w-64">
                                                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                                                <input
                                                    type="text"
                                                    placeholder="Search lesson..."
                                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                                    value={lessonSearch}
                                                    onChange={(e) => setLessonSearch(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="divide-y divide-slate-50">
                                        {filteredLessons.length > 0 ? (
                                            filteredLessons.map((lesson, index) => {
                                                const lessonProgress = enrollment?.progress?.[lesson._id];
                                                const isCompleted = lessonProgress?.completed;
                                                const isLocked = !enrollment && index > 1; // Preview only first 2

                                                return (
                                                    <div
                                                        key={lesson._id}
                                                        className={`p-6 flex items-center gap-4 transition-colors group ${isLocked ? 'cursor-not-allowed opacity-60' : 'hover:bg-blue-50/30 cursor-pointer'}`}
                                                        onClick={() => !isLocked && navigate(`/courses/${courseId}/learn/${lesson._id}`)}
                                                    >
                                                        <div className={`flex items-center justify-center w-10 h-10 rounded-2xl border ${isCompleted ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-white border-slate-100 text-slate-400'} font-bold text-sm shadow-sm group-hover:scale-110 transition-transform`}>
                                                            {isCompleted ? <CheckCircle size={20} /> : index + 1}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className={`font-bold text-base truncate ${isLocked ? 'text-slate-400' : 'text-slate-900'}`}>
                                                                {lesson.title}
                                                            </h4>
                                                            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2 mt-0.5">
                                                                {lesson.type === 'video' ? <PlayCircle size={12} /> : <BookOpen size={12} />}
                                                                {lesson.type} • {lesson.duration || '15:00'}
                                                            </p>
                                                        </div>
                                                        {isLocked ? (
                                                            <Lock size={16} className="text-slate-300" />
                                                        ) : (
                                                            <ArrowRight size={16} className="text-slate-300 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                                                        )}
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <div className="p-12 text-center text-slate-400 text-sm italic">No matching lessons found.</div>
                                        )}
                                    </div>
                                </div>

                                {/* Instructor */}
                                <div className="bg-white rounded-3xl p-10 shadow-sm border border-slate-100">
                                    <h2 className="text-2xl font-bold text-slate-900 mb-8">Your Instructor</h2>
                                    <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                                        <div className="w-24 h-24 rounded-3xl object-cover shrink-0 bg-slate-100 overflow-hidden shadow-lg ring-4 ring-white">
                                            <img src={`https://i.pravatar.cc/150?u=${course.instructorId}`} className="w-full h-full object-cover" alt="Instructor" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-xl text-slate-900">{course.instructorName || 'Master Instructor'}</h3>
                                            <p className="text-blue-600 font-bold text-xs uppercase tracking-widest mb-4">Senior Educator</p>
                                            <p className="text-slate-600 text-sm leading-relaxed max-w-lg">
                                                A passionate educator with over 15 years of industry experience, dedicated to making complex topics accessible to everyone.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="animate-fade-in">
                                <Reviews
                                    courseId={courseId}
                                    initialReviews={course.reviews || []}
                                    onReviewAdded={(updatedCourse) => setCourse(updatedCourse)}
                                />
                            </div>
                        )}
                    </div>

                    {/* Right Column: Sticky Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-28 space-y-6">
                            <Card className="overflow-hidden border-none shadow-2xl shadow-blue-900/10 rounded-[2.5rem]">
                                <div className="aspect-video bg-slate-800 relative group overflow-hidden">
                                    <img src={course.imageUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800'} alt={course.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-center justify-center">
                                        <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 text-white animate-pulse">
                                            <PlayCircle size={32} />
                                        </div>
                                    </div>
                                </div>
                                <div className="p-10">
                                    <div className="flex items-baseline gap-2 mb-8">
                                        {course.accessRule === 'payment' ? (
                                            <>
                                                <span className="text-4xl font-black text-slate-900">${course.price}</span>
                                                <span className="text-lg text-slate-400 line-through font-bold">${(course.price * 1.5).toFixed(0)}</span>
                                            </>
                                        ) : (
                                            <span className="text-4xl font-black text-emerald-600">FREE</span>
                                        )}
                                    </div>

                                    {enrollment ? (
                                        <Button
                                            size="lg"
                                            className="w-full h-14 text-lg font-bold shadow-xl shadow-blue-500/20 rounded-2xl mb-4"
                                            onClick={() => navigate(`/courses/${courseId}/learn`)}
                                        >
                                            {enrollment.completed ? 'Review Content' : 'Continue Learning'}
                                        </Button>
                                    ) : (
                                        <Button
                                            size="lg"
                                            className="w-full h-14 text-lg font-bold shadow-xl shadow-blue-600/20 rounded-2xl mb-4 bg-blue-600 hover:bg-blue-700"
                                            onClick={handleEnroll}
                                            disabled={enrolling}
                                        >
                                            {enrolling ? 'Enrolling...' : course.accessRule === 'payment' ? 'Buy this Course' : 'Join for Free'}
                                        </Button>
                                    )}

                                    <div className="space-y-4 pt-6">
                                        <h4 className="font-black text-slate-900 text-[10px] uppercase tracking-[0.2em]">Course Includes:</h4>
                                        <div className="space-y-3">
                                            {[
                                                { icon: PlayCircle, text: `${lessons.length} on-demand lessons` },
                                                { icon: Clock, text: 'Full lifetime access' },
                                                { icon: Globe, text: 'Access on mobile and web' },
                                                { icon: Award, text: 'Certificate of completion' }
                                            ].map((item, i) => (
                                                <div key={i} className="flex items-center gap-3 text-sm text-slate-500 font-bold">
                                                    <item.icon size={16} className="text-blue-500" />
                                                    <span>{item.text}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
            <EnrollmentModal
                isOpen={isEnrollModalOpen}
                onClose={() => setIsEnrollModalOpen(false)}
                onEnroll={handleFinalEnroll}
                courseTitle={course.title}
                isPaid={course.accessRule === 'payment'}
                price={course.price}
            />
        </div>
    );
}
