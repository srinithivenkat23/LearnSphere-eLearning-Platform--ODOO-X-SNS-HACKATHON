import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, setDoc, addDoc, collection, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import { ArrowLeft, Save, Plus, Trash2, CheckCircle } from 'lucide-react';

export default function QuizBuilder() {
    const { courseId, quizId } = useParams();
    const navigate = useNavigate();
    const isNew = quizId === 'new';
    const [loading, setLoading] = useState(!isNew);
    const [saving, setSaving] = useState(false);

    const [quiz, setQuiz] = useState({
        title: 'New Quiz',
        questions: [],
        rewards: {
            attempt1: 10,
            attempt2: 5,
            attempt3: 2,
            attempt4: 0
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
            const docRef = doc(db, 'quizzes', quizId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setQuiz({ id: docSnap.id, ...docSnap.data() });
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            if (isNew) {
                await addDoc(collection(db, 'quizzes'), {
                    ...quiz,
                    courseId,
                    createdAt: new Date()
                });
            } else {
                await updateDoc(doc(db, 'quizzes', quizId), {
                    ...quiz,
                    updatedAt: new Date()
                });
            }
            navigate(`/instructor/courses/${courseId}`); // Go back to course editor
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
            text: 'New Question',
            options: ['Option 1', 'Option 2'],
            correctIndex: 0
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
        // Adjust correct index if needed
        if (newQuestions[qIndex].correctIndex >= oIndex && newQuestions[qIndex].correctIndex > 0) {
            newQuestions[qIndex].correctIndex--;
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
        <div className="flex flex-col h-screen bg-slate-50">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(`/instructor/courses/${courseId}`)} className="text-slate-400 hover:text-slate-600">
                        <ArrowLeft size={24} />
                    </button>
                    <Input
                        value={quiz.title}
                        onChange={(e) => setQuiz({ ...quiz, title: e.target.value })}
                        className="w-64 font-bold border-transparent hover:border-slate-200 focus:border-blue-500"
                    />
                </div>
                <Button onClick={handleSave} disabled={saving}>
                    <Save size={18} className="mr-2" />
                    {saving ? 'Saving...' : 'Save Quiz'}
                </Button>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Left Panel: Question List */}
                <div className="w-64 bg-white border-r border-slate-200 flex flex-col p-4 overflow-y-auto">
                    <h3 className="text-sm font-bold text-slate-500 uppercase mb-4">Questions</h3>
                    <div className="space-y-2 mb-6">
                        {quiz.questions.map((q, i) => (
                            <button
                                key={q.id}
                                onClick={() => setActiveQuestionIndex(i)}
                                className={`w-full text-left px-3 py-2 rounded-lg text-sm truncate flex justify-between items-center group ${activeQuestionIndex === i
                                        ? 'bg-blue-50 text-blue-700 font-medium'
                                        : 'text-slate-600 hover:bg-slate-50'
                                    }`}
                            >
                                <span>{i + 1}. {q.text}</span>
                                <Trash2
                                    size={14}
                                    className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500"
                                    onClick={(e) => { e.stopPropagation(); deleteQuestion(i); }}
                                />
                            </button>
                        ))}
                    </div>
                    <Button variant="outline" onClick={addQuestion} className="w-full text-sm">
                        <Plus size={16} className="mr-2" /> Add Question
                    </Button>

                    <hr className="my-6 border-slate-100" />

                    <h3 className="text-sm font-bold text-slate-500 uppercase mb-4">Rewards (Points)</h3>
                    <div className="space-y-2">
                        {[1, 2, 3, 4].map(attempt => (
                            <div key={attempt} className="flex items-center justify-between text-sm">
                                <span className="text-slate-600">Attempt {attempt}+</span>
                                <input
                                    type="number"
                                    className="w-16 px-2 py-1 border border-slate-200 rounded text-right"
                                    value={quiz.rewards[`attempt${attempt}`] || 0}
                                    onChange={(e) => setQuiz(prev => ({
                                        ...prev,
                                        rewards: { ...prev.rewards, [`attempt${attempt}`]: parseInt(e.target.value) || 0 }
                                    }))}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Main Editor */}
                <div className="flex-1 overflow-y-auto p-8 bg-slate-50">
                    {currentQuestion ? (
                        <div className="max-w-2xl mx-auto space-y-6">
                            <Card>
                                <h3 className="text-lg font-bold text-slate-900 mb-4">Question {activeQuestionIndex + 1}</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Question Text</label>
                                        <textarea
                                            rows={3}
                                            className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                            value={currentQuestion.text}
                                            onChange={(e) => updateQuestion(activeQuestionIndex, 'text', e.target.value)}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Options</label>
                                        <div className="space-y-3">
                                            {currentQuestion.options.map((option, oIndex) => (
                                                <div key={oIndex} className="flex items-center gap-3">
                                                    <button
                                                        onClick={() => updateQuestion(activeQuestionIndex, 'correctIndex', oIndex)}
                                                        className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${currentQuestion.correctIndex === oIndex
                                                                ? 'border-green-500 bg-green-50 text-green-500'
                                                                : 'border-slate-300 text-transparent hover:border-slate-400'
                                                            }`}
                                                    >
                                                        <CheckCircle size={16} fill="currentColor" className={currentQuestion.correctIndex === oIndex ? "opacity-100" : "opacity-0"} />
                                                    </button>

                                                    <input
                                                        type="text"
                                                        className="flex-1 px-3 py-2 rounded border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                                        value={option}
                                                        onChange={(e) => {
                                                            const newOptions = [...currentQuestion.options];
                                                            newOptions[oIndex] = e.target.value;
                                                            updateQuestion(activeQuestionIndex, 'options', newOptions);
                                                        }}
                                                    />

                                                    <button
                                                        onClick={() => removeOption(activeQuestionIndex, oIndex)}
                                                        className="text-slate-400 hover:text-red-500"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                        <button
                                            onClick={() => addOption(activeQuestionIndex)}
                                            className="mt-3 text-sm text-blue-600 font-medium hover:underline flex items-center"
                                        >
                                            <Plus size={14} className="mr-1" /> Add Option
                                        </button>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-slate-400">
                            <p>No question selected</p>
                            <Button onClick={addQuestion} variant="outline" className="mt-4">
                                Create First Question
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
