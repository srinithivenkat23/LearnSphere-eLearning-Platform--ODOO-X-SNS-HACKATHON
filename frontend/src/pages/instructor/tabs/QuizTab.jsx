import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, HelpCircle, GraduationCap, Clock } from 'lucide-react';
import axios from 'axios';
const API_URL = 'http://localhost:5000/api';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '../../../components/ui/Button';

const QuizTab = ({ course }) => {
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const courseId = course._id || course.id;

    useEffect(() => {
        if (courseId) {
            loadQuizzes();
        }
    }, [courseId]);

    const loadQuizzes = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_URL}/quizzes/course/${courseId}`);
            setQuizzes(response.data || []);
        } catch (err) {
            console.error("Error loading quizzes:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this quiz? This will remove all questions and scores.")) {
            try {
                await axios.delete(`${API_URL}/quizzes/${id}`);
                loadQuizzes();
            } catch (err) {
                console.error(err);
            }
        }
    };

    return (
        <div className="p-8 animate-fade-in relative h-full flex flex-col">
            <div className="flex justify-between items-center mb-10 pb-6 border-b border-slate-50">
                <div>
                    <h3 className="text-xl font-bold text-slate-900">Knowledge Checks</h3>
                    <p className="text-sm text-slate-500 mt-1">Manage quizzes and assessment criteria.</p>
                </div>
                <Button
                    onClick={() => {
                        const searchParams = new URLSearchParams(window.location.search);
                        const lessonId = searchParams.get('lessonId');
                        navigate(`/instructor/courses/${course.id}/quiz/new${lessonId ? `?lessonId=${lessonId}` : ''}`);
                    }}
                    className="bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 px-6"
                >
                    <Plus size={20} className="mr-2" />
                    Create Quiz
                </Button>
            </div>

            <div className="flex-1 space-y-4">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    </div>
                ) : quizzes.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-slate-100 rounded-[2rem] bg-slate-50/50">
                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-4">
                            <GraduationCap className="text-slate-300" size={32} />
                        </div>
                        <h4 className="text-lg font-bold text-slate-900">No quizzes yet</h4>
                        <p className="text-slate-500 mb-6 text-sm">Add a quiz to test your students' knowledge.</p>
                        <Button variant="outline" onClick={() => navigate(`/instructor/courses/${course.id}/quiz/new`)}>
                            Add First Quiz
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {quizzes.map((quiz) => {
                            const quizId = quiz._id || quiz.id;
                            return (
                                <div key={quizId} className="group bg-white border border-slate-100 p-6 rounded-2xl hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-500/5 transition-all">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                            <HelpCircle size={24} />
                                        </div>
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => navigate(`/instructor/courses/${courseId}/quiz/${quizId}/results`)}
                                                className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-slate-50 rounded-lg transition-colors"
                                                title="View Student Results"
                                            >
                                                <GraduationCap size={18} />
                                            </button>
                                            <button
                                                onClick={() => navigate(`/instructor/courses/${courseId}/quiz/${quizId}`)}
                                                className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition-colors"
                                                title="Edit Quiz"
                                            >
                                                <Edit size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(quizId)}
                                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Delete Quiz"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>

                                    <h4 className="font-bold text-slate-900 text-lg mb-2">{quiz.title}</h4>

                                    <div className="flex items-center gap-4 text-slate-500">
                                        <div className="flex items-center gap-1.5">
                                            <GraduationCap size={14} className="text-slate-400" />
                                            <span className="text-xs font-bold">{quiz.questions?.length || 0} Qs</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Clock size={14} className="text-slate-400" />
                                            <span className="text-xs font-bold">{quiz.passingScore || 70}% Pass</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default QuizTab;
