import { useState, useEffect } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
const API_URL = 'http://localhost:5000/api';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import Modal from '../../components/ui/Modal';
import { ArrowLeft, Save, Plus, Trash2, CheckCircle, HelpCircle, Trophy, Settings2, GripVertical, Sparkles } from 'lucide-react';

export default function QuizBuilder() {
    const { courseId, quizId } = useParams();
    const { search } = useLocation();
    const navigate = useNavigate();

    // Get lessonId from URL if present (useful for AI context when creating new)
    const queryParams = new URLSearchParams(search);
    const lessonIdFromUrl = queryParams.get('lessonId');

    const isNew = quizId === 'new';
    const [loading, setLoading] = useState(!isNew);
    const [saving, setSaving] = useState(false);
    const [isRewardsOpen, setIsRewardsOpen] = useState(false);

    const [quiz, setQuiz] = useState({
        title: 'New Quiz',
        questions: [],
        lessonId: lessonIdFromUrl || null,
        rewards: {
            attempt1: 100,
            attempt2: 50,
            attempt3: 25,
            attempt4Plus: 10
        }
    });

    const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);

    useEffect(() => {
        if (!isNew && quizId) {
            loadQuiz();
        }
    }, [quizId]);

    const loadQuiz = async () => {
        try {
            const response = await axios.get(`${API_URL}/quizzes/${quizId}`);
            if (response.data) {
                setQuiz(response.data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const [generatingAI, setGeneratingAI] = useState(false);

    const handleAIGenerate = async () => {
        if (quiz.questions.length > 0) {
            if (!window.confirm("This will overwrite existing questions. Continue?")) return;
        }

        setGeneratingAI(true);
        try {
            // Use lessonId from state or URL
            const targetLessonId = quiz.lessonId || lessonIdFromUrl;

            const response = await axios.post(`${API_URL}/ai/generate`, {
                lessonId: targetLessonId
            });

            if (response.data?.questions) {
                setQuiz(prev => ({
                    ...prev,
                    questions: response.data.questions
                }));
                setActiveQuestionIndex(0);
                // No alert needed, visual update is enough or use a toast if available
            }
        } catch (err) {
            console.error(err);
            alert("AI Magic failed. But you're still a great teacher!");
        } finally {
            setGeneratingAI(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            if (isNew) {
                await axios.post(`${API_URL}/quizzes`, {
                    ...quiz,
                    courseId,
                    createdAt: new Date()
                });
            } else {
                await axios.put(`${API_URL}/quizzes/${quizId}`, {
                    ...quiz,
                    updatedAt: new Date()
                });
            }
            navigate(`/instructor/courses/${courseId}`);
        } catch (err) {
            console.error(err);
            alert('Failed to save quiz');
        } finally {
            setSaving(false);
        }
    };

    const addQuestion = () => {
        const newQuestion = {
            id: Date.now(),
            questionText: 'New Question',
            options: ['Option 1', 'Option 2'],
            correctAnswer: 0
        };
        setQuiz(prev => ({
            ...prev,
            questions: [...prev.questions, newQuestion]
        }));
        setActiveQuestionIndex(quiz.questions.length);
    };

    const updateQuestion = (index, field, value) => {
        const newQuestions = [...quiz.questions];
        newQuestions[index] = { ...newQuestions[index], [field]: value };
        setQuiz(prev => ({ ...prev, questions: newQuestions }));
    };

    const addOption = (qIndex) => {
        const newQuestions = [...quiz.questions];
        newQuestions[qIndex].options.push(`Option ${newQuestions[qIndex].options.length + 1}`);
        setQuiz(prev => ({ ...prev, questions: newQuestions }));
    };

    const removeOption = (qIndex, oIndex) => {
        const newQuestions = [...quiz.questions];
        newQuestions[qIndex].options = newQuestions[qIndex].options.filter((_, i) => i !== oIndex);
        if (newQuestions[qIndex].correctAnswer >= oIndex && newQuestions[qIndex].correctAnswer > 0) {
            newQuestions[qIndex].correctAnswer--;
        }
        setQuiz(prev => ({ ...prev, questions: newQuestions }));
    };

    const deleteQuestion = (index) => {
        const newQuestions = quiz.questions.filter((_, i) => i !== index);
        setQuiz(prev => ({ ...prev, questions: newQuestions }));
        if (activeQuestionIndex >= newQuestions.length) {
            setActiveQuestionIndex(Math.max(0, newQuestions.length - 1));
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-500">Loading quiz...</div>;

    const currentQuestion = quiz.questions[activeQuestionIndex];

    return (
        <div className="flex flex-col h-screen bg-slate-50 overflow-hidden">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between shadow-sm z-30">
                <div className="flex items-center gap-6">
                    <button onClick={() => navigate(`/instructor/courses/${courseId}`)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-600">
                        <ArrowLeft size={20} />
                    </button>
                    <div className="h-8 w-px bg-slate-200"></div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Editing Quiz</span>
                        <input
                            value={quiz.title}
                            onChange={(e) => setQuiz({ ...quiz, title: e.target.value })}
                            className="bg-transparent font-bold text-slate-900 border-none p-0 focus:ring-0 text-xl"
                            placeholder="Quiz Title"
                        />
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        onClick={handleAIGenerate}
                        disabled={generatingAI}
                        variant="outline"
                        className="h-10 px-6 border-blue-200 text-blue-600 hover:bg-blue-50 bg-white group"
                    >
                        {generatingAI ? (
                            <><Sparkles size={18} className="mr-2 animate-pulse" /> Thinking...</>
                        ) : (
                            <><Sparkles size={18} className="mr-2 group-hover:rotate-12 transition-transform" /> AI Magic</>
                        )}
                    </Button>
                    <Button onClick={handleSave} disabled={saving} className="h-10 px-8 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20">
                        <Save size={18} className="mr-2" />
                        {saving ? 'Saving...' : 'Save Quiz'}
                    </Button>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Left Panel: Question List */}
                <div className="w-80 bg-white border-r border-slate-200 flex flex-col shadow-[4px_0_10px_-5px_rgba(0,0,0,0.05)] z-20 overflow-hidden">
                    <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Question List</h3>
                        <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-full font-bold text-slate-500">{quiz.questions.length} Items</span>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-2">
                        {quiz.questions.map((q, i) => (
                            <button
                                key={q.id || i}
                                onClick={() => setActiveQuestionIndex(i)}
                                className={`w-full text-left p-4 rounded-2xl flex items-start gap-4 transition-all group border-2 ${activeQuestionIndex === i
                                    ? 'bg-blue-50/50 border-blue-500 text-blue-700'
                                    : 'bg-white border-transparent text-slate-600 hover:bg-slate-50'
                                    }`}
                            >
                                <div className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${activeQuestionIndex === i ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                    {i + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className={`text-sm font-bold truncate ${activeQuestionIndex === i ? 'text-blue-900' : 'text-slate-700'}`}>
                                        {q.questionText || 'Enter question...'}
                                    </p>
                                    <p className="text-[10px] text-zinc-400 font-medium uppercase tracking-tighter mt-0.5">
                                        {q.options?.length || 0} Options • Multiple Choice
                                    </p>
                                </div>
                                <Trash2
                                    size={14}
                                    className={`opacity-0 group-hover:opacity-100 transition-opacity ${activeQuestionIndex === i ? 'text-blue-400 hover:text-red-500' : 'text-slate-300 hover:text-red-500'}`}
                                    onClick={(e) => { e.stopPropagation(); deleteQuestion(i); }}
                                />
                            </button>
                        ))}
                    </div>

                    <div className="p-4 bg-slate-50/80 border-t border-slate-100 space-y-3">
                        <Button variant="outline" onClick={addQuestion} className="w-full bg-white border-dashed border-2 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600 font-bold h-12">
                            <Plus size={18} className="mr-2" /> Add Question
                        </Button>
                        <Button variant="outline" onClick={() => setIsRewardsOpen(true)} className="w-full bg-white border-dashed border-2 hover:border-amber-500 hover:bg-amber-50 hover:text-amber-600 font-bold h-12">
                            <Trophy size={18} className="mr-2 text-amber-500" /> Rewards
                        </Button>
                    </div>
                </div>

                {/* Main Editor */}
                <div className="flex-1 overflow-y-auto p-12 bg-slate-50/50 relative">
                    {currentQuestion ? (
                        <div className="max-w-3xl mx-auto animate-fade-in-up">
                            <Card className="p-10 shadow-2xl shadow-slate-200/50 border-slate-200">
                                <div className="mb-10 flex items-center justify-between">
                                    <div>
                                        <h2 className="text-2xl font-bold text-slate-900 mb-1">Question {activeQuestionIndex + 1}</h2>
                                        <p className="text-sm text-slate-500 font-medium">Define the question and possible answers.</p>
                                    </div>
                                    <div className="p-3 bg-blue-50 rounded-2xl text-blue-600"><Settings2 size={24} /></div>
                                </div>

                                <div className="space-y-8">
                                    <div className="space-y-3">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Question Text</label>
                                        <textarea
                                            rows={4}
                                            className="w-full px-6 py-4 rounded-[1.5rem] border border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:outline-none transition-all text-lg font-medium shadow-inner"
                                            placeholder="e.g. What is the primary purpose of React 'hooks'?"
                                            value={currentQuestion.questionText}
                                            onChange={(e) => updateQuestion(activeQuestionIndex, 'questionText', e.target.value)}
                                        />
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between pl-1">
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Answer Options</label>
                                            <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-tighter">Mark correct answer on the left</span>
                                        </div>

                                        <div className="space-y-3">
                                            {currentQuestion.options.map((option, oIndex) => (
                                                <div key={oIndex} className="flex items-center gap-4 animate-fade-in group">
                                                    <button
                                                        onClick={() => updateQuestion(activeQuestionIndex, 'correctAnswer', oIndex)}
                                                        className={`shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${currentQuestion.correctAnswer === oIndex
                                                            ? 'border-emerald-500 bg-emerald-50 text-emerald-600 scale-110 shadow-lg shadow-emerald-500/10'
                                                            : 'border-slate-200 bg-white text-transparent hover:border-slate-300'
                                                            }`}
                                                    >
                                                        <CheckCircle size={18} fill="currentColor" className={currentQuestion.correctAnswer === oIndex ? "opacity-100" : "opacity-0"} />
                                                    </button>

                                                    <div className="flex-1 relative">
                                                        <GripVertical className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-200 cursor-grab active:cursor-grabbing" size={16} />
                                                        <input
                                                            type="text"
                                                            className={`w-full pl-10 pr-12 py-4 rounded-2xl border transition-all text-sm font-medium ${currentQuestion.correctAnswer === oIndex ? 'border-emerald-200 bg-emerald-50/20 text-emerald-900' : 'border-slate-200 bg-white focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500'}`}
                                                            value={option}
                                                            onChange={(e) => {
                                                                const newOptions = [...currentQuestion.options];
                                                                newOptions[oIndex] = e.target.value;
                                                                updateQuestion(activeQuestionIndex, 'options', newOptions);
                                                            }}
                                                        />
                                                        <button
                                                            onClick={() => removeOption(activeQuestionIndex, oIndex)}
                                                            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <button
                                            onClick={() => addOption(activeQuestionIndex)}
                                            className="w-full py-4 border-2 border-dashed border-slate-100 rounded-2xl text-slate-400 font-bold text-sm hover:border-blue-200 hover:bg-blue-50/30 hover:text-blue-500 transition-all flex items-center justify-center"
                                        >
                                            <Plus size={18} className="mr-2" /> Add Option
                                        </button>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            <div className="w-24 h-24 bg-white rounded-[2rem] flex items-center justify-center shadow-xl border border-slate-50 mb-6">
                                <HelpCircle className="text-slate-200" size={48} />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-2">Build Your Quiz</h3>
                            <p className="text-slate-500 max-w-sm mb-8 font-medium">Create engaging questions to test your learners' understanding of the course material.</p>
                            <Button onClick={addQuestion} className="px-10 h-14 bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-500/20 rounded-2xl">
                                <Plus size={20} className="mr-2" />
                                Create First Question
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Rewards Modal */}
            <Modal
                isOpen={isRewardsOpen}
                onClose={() => setIsRewardsOpen(false)}
                title="Quiz Rewards"
            >
                <div className="p-6 space-y-6">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="p-4 bg-amber-50 rounded-[2rem] text-amber-500 shadow-lg shadow-amber-500/10">
                            <Trophy size={40} />
                        </div>
                        <div>
                            <h4 className="text-xl font-bold text-slate-900">Set Performance Rewards</h4>
                            <p className="text-xs text-slate-500 font-medium">Learners earn points based on their accuracy.</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                                { key: 'attempt1', label: 'First try', color: 'bg-emerald-50 text-emerald-600', sub: 'The expert move' },
                                { key: 'attempt2', label: 'Second try', color: 'bg-blue-50 text-blue-600', sub: 'Persistence pays' },
                                { key: 'attempt3', label: 'Third try', color: 'bg-amber-50 text-amber-600', sub: 'The learner\'s path' },
                                { key: 'attempt4Plus', label: 'Fourth try +', color: 'bg-slate-50 text-slate-600', sub: 'Keep at it!' }
                            ].map(item => (
                                <div key={item.key} className="p-4 rounded-3xl border border-slate-100 bg-white shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <p className="text-sm font-bold text-slate-900">{item.label}</p>
                                            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-tighter">{item.sub}</p>
                                        </div>
                                        <div className={`p-1.5 rounded-lg ${item.color}`}>
                                            <Trophy size={14} />
                                        </div>
                                    </div>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-right font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                                            value={quiz.rewards[item.key]}
                                            onChange={(e) => setQuiz({
                                                ...quiz,
                                                rewards: { ...quiz.rewards, [item.key]: parseInt(e.target.value) || 0 }
                                            })}
                                        />
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Points</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="pt-6 border-t border-slate-100">
                        <Button onClick={() => setIsRewardsOpen(false)} className="w-full h-12">
                            Save Reward Settings
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
