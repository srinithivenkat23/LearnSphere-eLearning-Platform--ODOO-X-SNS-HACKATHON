import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs, updateDoc, orderBy, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../../lib/firebase';
import Button from '../../components/ui/Button';
import QuizRunner from '../../components/learner/QuizRunner';
import { Menu, ArrowLeft, CheckCircle, Circle, PlayCircle, FileText, Image, ChevronRight, Check, X, ArrowRight, Download, ChevronLeft } from 'lucide-react';
import PointsPopup from '../../components/learner/PointsPopup';

export default function CoursePlayer() {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [lessons, setLessons] = useState([]);
    const [activeLesson, setActiveLesson] = useState(null);
    const [enrollment, setEnrollment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'resources', 'notes'
    const [showPointsPopup, setShowPointsPopup] = useState(false);
    const [earnedPoints, setEarnedPoints] = useState(0);
    const [userPoints, setUserPoints] = useState(0);

    useEffect(() => {
        loadCourseData();
    }, [courseId]);

    const loadCourseData = async () => {
        try {
            // Fetch Course, Lessons, Enrollment
            const courseDoc = await getDoc(doc(db, 'courses', courseId));
            if (!courseDoc.exists()) { navigate('/'); return; }
            setCourse({ id: courseDoc.id, ...courseDoc.data() });

            const qLessons = query(collection(db, 'lessons'), where('courseId', '==', courseId), orderBy('order', 'asc'));
            const lessonsSnap = await getDocs(qLessons);
            const lessonsData = lessonsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
            setLessons(lessonsData);

            if (auth.currentUser) {
                const qEnroll = query(
                    collection(db, 'enrollments'),
                    where('userId', '==', auth.currentUser.uid),
                    where('courseId', '==', courseId)
                );
                const enrollSnap = await getDocs(qEnroll);
                if (!enrollSnap.empty) {
                    setEnrollment({ id: enrollSnap.docs[0].id, ...enrollSnap.docs[0].data() });
                    // Track activity
                    await updateDoc(doc(db, 'enrollments', enrollSnap.docs[0].id), {
                        lastActive: serverTimestamp()
                    });
                    // Auto select first incomplete lesson
                    const enrollmentData = enrollSnap.docs[0].data();
                    const firstIncomplete = lessonsData.find(l => !enrollmentData.progress?.[l.id]?.completed);
                    setActiveLesson(firstIncomplete || lessonsData[0]);
                } else {
                    navigate(`/courses/${courseId}`); // Not enrolled
                }
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCompleteLesson = async (points = 0) => {
        if (!enrollment || !activeLesson) return;

        try {
            const lessonId = activeLesson.id;
            const newProgress = {
                ...enrollment.progress,
                [lessonId]: { completed: true, completedAt: new Date() }
            };

            const completedCount = Object.values(newProgress).filter(p => p.completed).length;
            const progressPercent = Math.round((completedCount / lessons.length) * 100);
            const isCourseCompleted = completedCount === lessons.length;

            await updateDoc(doc(db, 'enrollments', enrollment.id), {
                progress: newProgress,
                progressPercent,
                completed: isCourseCompleted,
                lastActive: serverTimestamp(),
                ...(isCourseCompleted ? { completedAt: new Date() } : {})
            });

            setEnrollment(prev => ({
                ...prev,
                progress: newProgress,
                progressPercent,
                completed: isCourseCompleted
            }));

            if (points > 0) {
                const userRef = doc(db, 'users', auth.currentUser.uid);
                const userSnap = await getDoc(userRef);
                if (userSnap.exists()) {
                    const currentPoints = userSnap.data().points || 0;
                    const newPoints = currentPoints + points;
                    await updateDoc(userRef, { points: newPoints });

                    setUserPoints(newPoints);
                    setEarnedPoints(points);
                    setShowPointsPopup(true);
                }
            }

            // Move to next lesson
            const currentIndex = lessons.findIndex(l => l.id === lessonId);
            if (currentIndex < lessons.length - 1) {
                setActiveLesson(lessons[currentIndex + 1]);
            }

        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return <div className="text-center p-20 bg-slate-900 text-white h-screen flex items-center justify-center">Loading Studio...</div>;
    if (!activeLesson) return <div className="text-center p-20">No lessons found.</div>;

    return (
        <div className="flex h-screen bg-slate-900 overflow-hidden font-sans">
            {/* Dark Sidebar */}
            <div className={`bg-slate-950 border-r border-slate-800 flex flex-col transition-all duration-300 relative z-20 ${sidebarOpen ? 'w-80' : 'w-0'}`}>
                <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link to="/my-courses" className="text-slate-400 hover:text-white transition-colors">
                            <ChevronLeft size={20} />
                        </Link>
                        <div>
                            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">Course Content</div>
                            <h2 className="font-bold text-slate-100 truncate text-xs max-w-[150px]">{course.title}</h2>
                        </div>
                    </div>
                    <button onClick={() => setSidebarOpen(false)} className="text-slate-400 hover:text-white transition-colors p-1 hover:bg-slate-800 rounded-lg">
                        <ArrowLeft size={18} />
                    </button>
                </div>

                <div className="p-4 bg-slate-900/50">
                    <div className="flex justify-between text-xs text-slate-400 mb-2">
                        <span>Your Progress</span>
                        <span className="text-white font-bold">{enrollment?.progressPercent}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${enrollment?.progressPercent || 0}%` }}></div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {lessons.map((lesson, i) => {
                        const isCompleted = enrollment?.progress?.[lesson.id]?.completed;
                        const isActive = activeLesson.id === lesson.id;
                        return (
                            <button
                                key={lesson.id}
                                onClick={() => setActiveLesson(lesson)}
                                className={`w-full flex items-start gap-3 p-4 text-left transition-colors border-l-2 ${isActive
                                    ? 'bg-slate-800/80 border-blue-500'
                                    : 'border-transparent hover:bg-slate-900'
                                    }`}
                            >
                                <div className="mt-0.5">
                                    {isCompleted ? (
                                        <CheckCircle size={16} className="text-green-500" />
                                    ) : (
                                        <div className={`w-4 h-4 rounded-full border-2 ${isActive ? 'border-blue-500' : 'border-slate-600'}`}></div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className={`text-sm font-medium mb-1 ${isActive ? 'text-white' : 'text-slate-400'}`}>
                                        {i + 1}. {lesson.title}
                                    </p>
                                    <div className="flex items-center gap-2 text-xs text-slate-500">
                                        {lesson.type === 'video' && <PlayCircle size={10} />}
                                        {lesson.type === 'document' && <FileText size={10} />}
                                        {lesson.duration || '5m'}
                                        {lesson.hasAttachment && (
                                            <span className="flex items-center gap-1 text-[10px] text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded ml-2">
                                                <Download size={8} /> Attachment
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </button>
                        )
                    })}
                </div>

                <div className="p-4 border-t border-slate-800">
                    <Link to="/my-courses" className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
                        <ArrowLeft size={16} /> Back to Dashboard
                    </Link>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col h-full relative bg-slate-900 text-slate-100">
                <main className="flex-1 overflow-y-auto">
                    {/* Top Bar inside main content to handle full width */}
                    <div className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-sm border-b border-slate-800 px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            {!sidebarOpen && (
                                <button onClick={() => setSidebarOpen(true)} className="text-slate-400 hover:text-white transition-colors">
                                    <Menu size={20} />
                                </button>
                            )}
                            <h1 className="text-lg font-bold text-white">{activeLesson.title}</h1>
                        </div>
                        <div className="flex items-center gap-4">
                            {enrollment?.progressPercent === 100 && !enrollment?.completedCourse && (
                                <Button
                                    onClick={() => handleCompleteLesson(50)} // Extra points for completion
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white border-none shadow-lg shadow-emerald-500/20 font-bold"
                                >
                                    Complete Course
                                </Button>
                            )}

                            <Button
                                variant="outline"
                                className="border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800"
                                onClick={() => navigate('/my-courses')}
                            >
                                <ArrowLeft size={16} className="mr-2" /> Back
                            </Button>

                            {activeLesson.type !== 'quiz' && (
                                <Button
                                    onClick={() => handleCompleteLesson(10)}
                                    className={enrollment?.progress?.[activeLesson.id]?.completed
                                        ? "bg-emerald-600 hover:bg-emerald-700 text-white border-none"
                                        : "bg-blue-600 hover:bg-blue-700 text-white border-none shadow-lg shadow-blue-500/20"}
                                >
                                    {enrollment?.progress?.[activeLesson.id]?.completed ? (
                                        <><Check size={16} className="mr-2" /> Finished</>
                                    ) : (
                                        <>Complete & Proceed <ArrowRight size={16} className="ml-2" /></>
                                    )}
                                </Button>
                            )}
                        </div>
                    </div>

                    <div className="max-w-5xl mx-auto px-6 py-8">
                        {/* Lesson Info Header B5 */}
                        <div className="mb-8">
                            <h2 className="text-3xl font-bold text-white mb-4 animate-in fade-in slide-in-from-top-4 duration-500">
                                {activeLesson.title}
                            </h2>
                            <p className="text-slate-400 text-lg leading-relaxed max-w-3xl animate-in fade-in slide-in-from-top-4 delay-100 duration-500">
                                {activeLesson.description || "In this lesson, we'll dive deep into the core concepts and practical applications of this topic."}
                            </p>
                        </div>
                        {activeLesson.type === 'video' && (
                            <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-2xl mb-8 ring-1 ring-white/10">
                                <iframe
                                    src={activeLesson.contentUrl?.replace('watch?v=', 'embed/')}
                                    className="w-full h-full"
                                    title={activeLesson.title}
                                    allowFullScreen
                                ></iframe>
                            </div>
                        )}

                        {activeLesson.type === 'image' && (
                            <div className="rounded-xl overflow-hidden shadow-2xl mb-8 ring-1 ring-white/10">
                                <img src={activeLesson.contentUrl} alt={activeLesson.title} className="w-full h-auto" />
                            </div>
                        )}

                        {activeLesson.type === 'document' && (
                            <div className="bg-slate-800 p-12 rounded-xl shadow-lg mb-8 text-center border border-slate-700">
                                <FileText size={64} className="mx-auto text-blue-500 mb-6" />
                                <h3 className="text-2xl font-bold mb-3 text-white">{activeLesson.title}</h3>
                                <p className="text-slate-400 mb-8 max-w-lg mx-auto">
                                    This lesson resource is available for download. Click the button below to access the file.
                                </p>
                                {activeLesson.allowDownload ? (
                                    <a href={activeLesson.contentUrl} target="_blank" rel="noopener noreferrer">
                                        <Button className="h-12 px-8 text-base">Download Resource</Button>
                                    </a>
                                ) : (
                                    <p className="text-xs text-red-400">Download not available for this resource.</p>
                                )}
                            </div>
                        )}

                        {activeLesson.type === 'quiz' && (
                            <div className="bg-white rounded-xl shadow-xl overflow-hidden text-slate-900 min-h-[400px]">
                                <QuizRunner
                                    lesson={activeLesson}
                                    courseId={course.id}
                                    onComplete={handleCompleteLesson}
                                />
                            </div>
                        )}

                        <div className="mt-12">
                            <div className="flex gap-8 border-b border-slate-800 mb-8">
                                {['overview', 'resources', 'notes'].map(tab => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`pb-4 text-sm font-bold uppercase tracking-widest border-b-2 transition-all ${activeTab === tab ? 'border-blue-500 text-blue-500' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>

                            {activeTab === 'overview' && (
                                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    <h3 className="text-xl font-bold text-white mb-4">Lesson Overview</h3>
                                    <p className="text-slate-400 leading-relaxed text-lg mb-8">{activeLesson.description || "No description provided for this lesson."}</p>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700">
                                            <h4 className="font-bold text-white mb-2 flex items-center gap-2">
                                                <Trophy size={18} className="text-orange-400" /> Lesson Rewards
                                            </h4>
                                            <p className="text-sm text-slate-400 tracking-tight">Complete this lesson to earn 10 Learning Points and progress towards your certificate.</p>
                                        </div>
                                        <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700">
                                            <h4 className="font-bold text-white mb-2 flex items-center gap-2">
                                                <Shield size={18} className="text-blue-400" /> Certified Content
                                            </h4>
                                            <p className="text-sm text-slate-400 tracking-tight">This content is verified by LearnSphere's academic review board for accuracy and quality.</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'resources' && (
                                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    <h3 className="text-xl font-bold text-white mb-6">Course Resources</h3>
                                    <div className="space-y-4">
                                        {activeLesson.contentUrl && (
                                            <div className="flex items-center justify-between p-4 bg-slate-800 rounded-xl border border-slate-700 hover:border-blue-500 transition-colors group">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-blue-500/10 text-blue-500 rounded-lg flex items-center justify-center">
                                                        <FileText size={20} />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-white text-sm">Main Resource Bundle</p>
                                                        <p className="text-xs text-slate-500 tracking-tight">PDF • 2.4 MB</p>
                                                    </div>
                                                </div>
                                                <a href={activeLesson.contentUrl} target="_blank" rel="noopener noreferrer">
                                                    <Button size="sm" variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-700">Download</Button>
                                                </a>
                                            </div>
                                        )}
                                        <p className="text-slate-500 text-sm mt-4 italic">More resources are available in the course repository.</p>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'notes' && (
                                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    <h3 className="text-xl font-bold text-white mb-4">My Study Notes</h3>
                                    <textarea
                                        placeholder="Type your notes here... They will be saved to your profile."
                                        className="w-full h-40 bg-slate-800 border-slate-700 rounded-xl p-4 text-slate-100 placeholder:text-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                                    ></textarea>
                                    <div className="flex justify-end mt-4">
                                        <Button size="sm">Save Notes</Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>

            {/* Points Popup */}
            {(() => {
                const ranks = [
                    { name: 'Newbie', min: 0 },
                    { name: 'Explorer', min: 100 },
                    { name: 'Achiever', min: 500 },
                    { name: 'Specialist', min: 1000 },
                    { name: 'Expert', min: 2500 },
                    { name: 'Master', min: 5000 }
                ];
                const currentRankIndex = ranks.findIndex((r, i) => userPoints >= r.min && (i === ranks.length - 1 || userPoints < ranks[i + 1].min));
                const nextRank = ranks[currentRankIndex + 1] || ranks[currentRankIndex];
                const prevRankMin = ranks[currentRankIndex].min;
                const nextRankMin = nextRank.min;
                const range = nextRankMin - prevRankMin || 1;
                const progress = Math.min(100, Math.round(((userPoints - prevRankMin) / range) * 100));

                return (
                    <PointsPopup
                        show={showPointsPopup}
                        points={earnedPoints}
                        nextRank={nextRank.name}
                        progress={progress}
                        onClose={() => setShowPointsPopup(false)}
                    />
                );
            })()}
        </div>
    );
}
