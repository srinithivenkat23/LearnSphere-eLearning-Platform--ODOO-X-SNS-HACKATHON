import { useState, useEffect } from 'react';
import {
    Plus, GripVertical, FileText, Video, Image,
    MoreVertical, Edit, Trash2, HelpCircle,
    PlayCircle, BookOpen, FileDigit
} from 'lucide-react';
import axios from 'axios';
const API_URL = 'http://localhost:5000/api';
import Button from '../../../components/ui/Button';
import LessonEditor from '../../../components/instructor/LessonEditor';

const ContentTab = ({ course, onChange }) => {
    const [lessons, setLessons] = useState([]);
    const [quizzes, setQuizzes] = useState([]);
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [editingLesson, setEditingLesson] = useState(null);
    const [activeMenu, setActiveMenu] = useState(null);

    const courseId = course._id || course.id;

    useEffect(() => {
        if (courseId) {
            loadLessons();
            loadQuizzes();
        }
    }, [courseId]);

    const loadLessons = async () => {
        try {
            const response = await axios.get(`${API_URL}/lessons/course/${courseId}`);
            setLessons(response.data || []);
        } catch (err) {
            console.error("Error loading lessons:", err);
        }
    };

    const loadQuizzes = async () => {
        try {
            const response = await axios.get(`${API_URL}/quizzes/course/${courseId}`);
            setQuizzes(response.data || []);
        } catch (err) {
            console.error("Error loading quizzes:", err);
        }
    };

    const handleSaveLesson = async (lessonData) => {
        try {
            if (editingLesson) {
                const id = editingLesson._id || editingLesson.id;
                await axios.put(`${API_URL}/lessons/${id}`, lessonData);
            } else {
                await axios.post(`${API_URL}/lessons`, {
                    ...lessonData,
                    courseId: courseId,
                    order: lessons.length,
                    completed: false
                });

                // Update course stats
                const newCount = (course.lessonsCount || 0) + 1;
                await axios.put(`${API_URL}/courses/${courseId}`, {
                    lessonsCount: newCount
                });
                // Local sync
                onChange('lessonsCount', newCount);
            }
            loadLessons();
            setEditingLesson(null);
        } catch (err) {
            console.error(err);
            alert("Failed to save lesson");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this content? This action cannot be undone.")) {
            setActiveMenu(null);
            try {
                await axios.delete(`${API_URL}/lessons/${id}`);
                const newCount = Math.max(0, (course.lessonsCount || 0) - 1);
                await axios.put(`${API_URL}/courses/${courseId}`, {
                    lessonsCount: newCount
                });
                onChange('lessonsCount', newCount);
                loadLessons();
            } catch (err) {
                console.error(err);
            }
        }
    };

    const getIcon = (type) => {
        const iconSize = 20;
        switch (type) {
            case 'video': return <PlayCircle size={iconSize} className="text-blue-500" />;
            case 'doc':
            case 'document': return <BookOpen size={iconSize} className="text-emerald-500" />;
            case 'image': return <Image size={iconSize} className="text-purple-500" />;
            case 'quiz': return <HelpCircle size={iconSize} className="text-orange-500" />;
            default: return <FileDigit size={iconSize} className="text-slate-500" />;
        }
    };

    return (
        <div className="p-8 animate-fade-in relative h-full flex flex-col">
            <div className="flex justify-between items-center mb-10 pb-6 border-b border-slate-50">
                <div>
                    <h3 className="text-xl font-bold text-slate-900">Course Syllabus</h3>
                    <p className="text-sm text-slate-500 mt-1">Organize your modules and interactive content.</p>
                </div>
                <Button onClick={() => { setEditingLesson(null); setIsEditorOpen(true); }} className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20 px-6">
                    <Plus size={20} className="mr-2" />
                    Add Content
                </Button>
            </div>

            <div className="flex-1 space-y-4">
                {lessons.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-slate-100 rounded-[2rem] bg-slate-50/50">
                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-4">
                            <BookOpen className="text-slate-300" size={32} />
                        </div>
                        <h4 className="text-lg font-bold text-slate-900">No content yet</h4>
                        <p className="text-slate-500 mb-6 text-sm">Start by adding your first lesson or quiz.</p>
                        <Button variant="outline" onClick={() => { setEditingLesson(null); setIsEditorOpen(true); }}>
                            Create Lesson
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {lessons.map((lesson, index) => {
                            const lessonId = lesson._id || lesson.id;
                            return (
                                <div key={lessonId} className="group flex items-center gap-4 bg-white border border-slate-100 p-4 rounded-2xl hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/5 transition-all">
                                    <div className="cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-500 px-2">
                                        <GripVertical size={20} />
                                    </div>

                                    <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center shrink-0 transition-colors group-hover:bg-blue-50">
                                        {getIcon(lesson.type)}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <span className="text-[10px] font-bold text-slate-400 font-mono tracking-tighter">MOD {index + 1}</span>
                                            <h4 className="font-bold text-slate-900 truncate tracking-tight">{lesson.title}</h4>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-500 rounded uppercase font-bold tracking-tighter group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                                                {lesson.type}
                                            </span>
                                            {lesson.duration && (
                                                <span className="text-xs text-slate-400 font-medium">• {lesson.duration}</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="relative">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setActiveMenu(activeMenu === lessonId ? null : lessonId);
                                            }}
                                            className={`p-2 rounded-xl transition-all ${activeMenu === lessonId ? 'bg-slate-900 text-white' : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50'}`}
                                        >
                                            <MoreVertical size={20} />
                                        </button>

                                        {activeMenu === lessonId && (
                                            <>
                                                <div className="fixed inset-0 z-40" onClick={() => setActiveMenu(null)}></div>
                                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-2xl border border-slate-100 z-50 overflow-hidden animate-fade-in-up">
                                                    <button
                                                        onClick={() => { setEditingLesson(lesson); setIsEditorOpen(true); setActiveMenu(null); }}
                                                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                                                    >
                                                        <Edit size={16} /> Edit Lesson
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(lessonId)}
                                                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 transition-colors"
                                                    >
                                                        <Trash2 size={16} /> Delete
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <LessonEditor
                isOpen={isEditorOpen}
                onClose={() => setIsEditorOpen(false)}
                onSave={handleSaveLesson}
                lesson={editingLesson}
                quizzes={quizzes}
            />
        </div>
    );
};

export default ContentTab;
