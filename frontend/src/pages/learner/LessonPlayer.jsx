import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    ChevronLeft,
    ChevronRight,
    Menu,
    X,
    PlayCircle,
    FileText,
    Image as ImageIcon,
    HelpCircle,
    CheckCircle,
    ArrowLeft,
    Download,
    ExternalLink
} from 'lucide-react';
import Button from '../../components/ui/Button';
import QuizRunner from '../../components/learner/QuizRunner';
import PointsPopup from '../../components/learner/PointsPopup';
import { useAuth } from '../../context/AuthContext';

const API_URL = 'http://localhost:5000/api';

export default function LessonPlayer() {
    const { courseId, lessonId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [course, setCourse] = useState(null);
    const [lessons, setLessons] = useState([]);
    const [currentLesson, setCurrentLesson] = useState(null);
    const [enrollment, setEnrollment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [lessonSearch, setLessonSearch] = useState('');
    const [showPointsPopup, setShowPointsPopup] = useState(false);
    const [earnedPoints, setEarnedPoints] = useState(0);
    const [userPoints, setUserPoints] = useState(0);

    useEffect(() => {
        loadData();
    }, [courseId, lessonId]);

    const loadData = async () => {
        try {
            const [courseRes, lessonsRes, enrollmentRes] = await Promise.all([
                axios.get(`${API_URL}/courses/${courseId}`),
                axios.get(`${API_URL}/lessons/course/${courseId}`),
                axios.get(`${API_URL}/enrollments/my-courses`)
            ]);

            setCourse(courseRes.data);
            setLessons(lessonsRes.data);

            const enroll = enrollmentRes.data.find(e => e.courseId?._id === courseId);
            setEnrollment(enroll);

            if (!enroll) {
                alert("You are not enrolled in this course");
                navigate(`/courses/${courseId}`);
                return;
            }

            // Set current lesson
            if (lessonId) {
                const lesson = lessonsRes.data.find(l => l._id === lessonId);
                setCurrentLesson(lesson);
            } else if (lessonsRes.data.length > 0) {
                // Default to first lesson if none specified
                setCurrentLesson(lessonsRes.data[0]);
                navigate(`/courses/${courseId}/learn/${lessonsRes.data[0]._id}`, { replace: true });
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleNext = () => {
        const currentIndex = lessons.findIndex(l => l._id === currentLesson?._id);
        if (currentIndex < lessons.length - 1) {
            const nextLesson = lessons[currentIndex + 1];
            navigate(`/courses/${courseId}/learn/${nextLesson._id}`);
        }
    };

    const handleCompleteLesson = async (points = 10, attempts = 1) => {
        if (!enrollment || !currentLesson) return;

        try {
            const lessonId = currentLesson._id;

            // Calculate new percentage locally for the UI
            const currentProgressMap = enrollment.progress ? (enrollment.progress instanceof Map ? Object.fromEntries(enrollment.progress) : enrollment.progress) : {};
            const isActuallyNewlyCompleted = !currentProgressMap[lessonId]?.completed;

            const response = await axios.put(`${API_URL}/enrollments/${enrollment._id}/progress`, {
                lessonId: lessonId,
                completed: true,
                attempts: attempts,
                pointsReward: points,
                progressPercent: isActuallyNewlyCompleted
                    ? Math.round(((Object.values(currentProgressMap).filter(p => p.completed).length + 1) / lessons.length) * 100)
                    : enrollment.progressPercent
            });

            // Update local state with response data
            setEnrollment(response.data.enrollment);
            setUserPoints(response.data.userPoints);
            setEarnedPoints(points);
            setShowPointsPopup(true);

        } catch (err) {
            console.error(err);
            alert("Failed to update progress.");
        }
    };

    const handleCompleteCourse = async () => {
        if (!enrollment) return;
        try {
            await axios.put(`${API_URL}/enrollments/${enrollment._id}/progress`, {
                progressPercent: 100,
                completed: true
            });
            alert("Congratulations! You have officially completed this course.");
            navigate('/my-courses');
        } catch (err) {
            console.error(err);
            alert("Failed to complete course.");
        }
    };

    const isCurrentLessonCompleted = enrollment?.progress?.[currentLesson?._id]?.completed;

    const filteredLessons = lessons.filter(l =>
        l.title.toLowerCase().includes(lessonSearch.toLowerCase())
    );

    if (loading) return <div className="h-screen bg-slate-900 flex items-center justify-center text-white">Loading player...</div>;
    if (!course || !currentLesson) return null;

    const progressPercent = enrollment?.progressPercent || 0;

    return (
        <div className="h-screen flex bg-slate-900 text-white overflow-hidden font-sans">
            {/* Left Sidebar */}
            <div className={`fixed inset-y-0 left-0 z-50 w-80 bg-slate-800 border-r border-slate-700 transition-transform duration-300 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 flex flex-col`}>
                <div className="p-6 border-b border-slate-700">
                    <div className="flex items-center justify-between mb-4">
                        <Button variant="ghost" size="sm" onClick={() => navigate('/my-courses')} className="text-slate-400 hover:text-white -ml-2">
                            <ArrowLeft size={16} className="mr-2" /> My Courses
                        </Button>
                        <button onClick={() => setSidebarOpen(false)} className="md:hidden text-slate-400 hover:text-white">
                            <X size={20} />
                        </button>
                    </div>
                    <h2 className="font-bold text-lg leading-tight mb-2">{course.title}</h2>
                    <div className="flex items-center gap-3">
                        <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${progressPercent}%` }}></div>
                        </div>
                        <span className="text-xs font-bold text-blue-400">{progressPercent}%</span>
                    </div>
                </div>

                <div className="p-4 border-b border-slate-700">
                    <div className="relative">
                        <Menu size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Search lessons..."
                            className="w-full bg-slate-900/50 border border-slate-700 rounded-lg py-2 pl-10 pr-4 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                            value={lessonSearch}
                            onChange={(e) => setLessonSearch(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto py-4">
                    {filteredLessons.map((lesson, idx) => {
                        const isActive = lesson._id === currentLesson._id;
                        const isCompleted = enrollment?.progress?.[lesson._id]?.completed;

                        return (
                            <div key={lesson._id} className="px-2 mb-1">
                                <button
                                    onClick={() => navigate(`/courses/${courseId}/learn/${lesson._id}`)}
                                    className={`w-full text-left p-3 rounded-xl transition-all ${isActive ? 'bg-blue-600/20 text-blue-400 ring-1 ring-blue-500/50' : 'hover:bg-slate-700/50 text-slate-400'}`}
                                >
                                    <div className="flex gap-3">
                                        <div className="pt-1">
                                            {isCompleted ? <CheckCircle size={16} className="text-emerald-500" /> : <PlayCircle size={16} />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm font-bold ${isActive ? 'text-white' : ''} truncate`}>{lesson.title}</p>
                                            <p className="text-[10px] opacity-60 mt-0.5 uppercase tracking-widest">{lesson.duration || '5:00'} • {lesson.type}</p>

                                            {/* Attachments */}
                                            {lesson.attachments?.length > 0 && (
                                                <div className="mt-2 space-y-1">
                                                    {lesson.attachments.map((at, i) => (
                                                        <div key={i} className="flex items-center gap-1.5 text-[10px] text-blue-400/80 hover:text-blue-400 bg-blue-500/5 px-2 py-1 rounded w-fit">
                                                            <Download size={10} /> {at.name}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Main Area */}
            <div className="flex-1 flex flex-col min-w-0 relative">
                {/* Header */}
                <div className="h-16 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-900/50 backdrop-blur-md sticky top-0 z-10">
                    <div className="flex items-center gap-4">
                        {!sidebarOpen && (
                            <button onClick={() => setSidebarOpen(true)} className="text-slate-400 hover:text-white p-2 hover:bg-slate-800 rounded-lg">
                                <Menu size={20} />
                            </button>
                        )}
                        <h1 className="font-bold text-lg truncate max-w-md">{currentLesson.title}</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="outline" size="sm" className="hidden sm:flex border-slate-700 text-slate-300 hover:bg-slate-800">
                            <ExternalLink size={16} className="mr-2" /> Resource
                        </Button>
                        {progressPercent === 100 && !enrollment.completed && (
                            <Button variant="primary" size="sm" onClick={handleCompleteCourse} className="bg-emerald-600 hover:bg-emerald-700 border-none animate-pulse">
                                Complete Course
                            </Button>
                        )}
                        {!isCurrentLessonCompleted && currentLesson.type !== 'quiz' && (
                            <Button variant="primary" size="sm" onClick={() => handleCompleteLesson(false)} className="bg-emerald-600 hover:bg-emerald-700 border-none">
                                Complete Lesson
                            </Button>
                        )}
                        <Button
                            variant="ghost"
                            onClick={handleNext}
                            disabled={lessons.findIndex(l => l._id === currentLesson._id) === lessons.length - 1}
                            className="text-slate-400 hover:text-white"
                        >
                            Next <ChevronRight size={16} className="ml-2" />
                        </Button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto">
                    <div className="max-w-5xl mx-auto p-6 md:p-10">
                        {/* Description at top */}
                        <div className="mb-8 p-6 bg-slate-800/50 border border-slate-700 rounded-2xl">
                            <h3 className="text-blue-400 text-xs font-bold uppercase tracking-widest mb-2">Lesson Description</h3>
                            <p className="text-slate-300 leading-relaxed italic">"{currentLesson.description}"</p>
                        </div>

                        {/* Viewer Area */}
                        <div className="bg-black rounded-2xl overflow-hidden shadow-2xl aspect-video relative group border border-slate-700">
                            {currentLesson.type === 'video' ? (
                                <video
                                    className="w-full h-full"
                                    controls
                                    key={currentLesson.contentUrl}
                                    src={currentLesson.contentUrl}
                                >
                                    Your browser does not support the video tag.
                                </video>
                            ) : currentLesson.type === 'document' ? (
                                <iframe
                                    src={currentLesson.contentUrl}
                                    className="w-full h-full bg-white"
                                    title="Lesson Document"
                                />
                            ) : currentLesson.type === 'image' ? (
                                <img
                                    src={currentLesson.contentUrl}
                                    alt="Lesson Content"
                                    className="w-full h-full object-contain"
                                />
                            ) : (
                                <div className="w-full h-full bg-white overflow-y-auto">
                                    <QuizRunner
                                        lesson={currentLesson}
                                        enrollmentId={enrollment?._id}
                                        onComplete={handleCompleteLesson}
                                        onNext={handleNext}
                                    />
                                </div>
                            )}
                        </div>

                        <div className="mt-10 mb-20">
                            <h3 className="text-xl font-bold mb-6">About this lesson</h3>
                            <p className="text-slate-400 leading-relaxed">
                                Explore the details of this module and complete any associated tasks or quizzes to proceed to the next content.
                                Successful completion of all modules will award you dedicated points toward your next badge level.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Mobile Bottom Nav */}
                <div className="md:hidden h-16 border-t border-slate-800 bg-slate-900 sticky bottom-0 flex items-center justify-around px-4">
                    <button className="flex flex-col items-center text-slate-400">
                        <ChevronLeft size={20} />
                        <span className="text-[10px]">Prev</span>
                    </button>
                    <button onClick={() => setSidebarOpen(true)} className="flex flex-col items-center text-slate-400">
                        <Menu size={20} />
                        <span className="text-[10px]">Syllabus</span>
                    </button>
                    <button onClick={handleNext} className="flex flex-col items-center text-blue-500">
                        <ChevronRight size={20} />
                        <span className="text-[10px]">Next</span>
                    </button>
                </div>

                {/* Points Popup */}
                <PointsPopup
                    show={showPointsPopup}
                    points={earnedPoints}
                    nextRank="Achiever" // Simplified for now
                    progress={Math.min(100, (userPoints % 100))} // Simplified rank progress
                    onClose={() => {
                        setShowPointsPopup(false);
                        handleNext();
                    }}
                />
            </div>
        </div>
    );
}
