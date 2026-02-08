import { useState, useEffect } from 'react';
import axios from 'axios';
import {
    HelpCircle,
    ArrowRight,
    CheckCircle,
    AlertCircle,
    RotateCcw,
    Award,
    ChevronRight,
    Loader2
} from 'lucide-react';
import Button from '../ui/Button';

const API_URL = 'http://localhost:5000/api';

export default function QuizRunner({ lesson, enrollmentId, onComplete }) {
    const [quiz, setQuiz] = useState(null);
    const [loading, setLoading] = useState(true);
    const [gameState, setGameState] = useState('intro'); // intro, playing, result
    const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
    const [selectedOption, setSelectedOption] = useState(null);
    const [score, setScore] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [attempts, setAttempts] = useState(0);

    useEffect(() => {
        if (lesson?._id) {
            loadQuiz();
        }
    }, [lesson?._id]);

    const loadQuiz = async () => {
        setLoading(true);
        try {
            const [quizRes, enrollmentRes] = await Promise.all([
                axios.get(`${API_URL}/quizzes/lesson/${lesson._id}`),
                axios.get(`${API_URL}/enrollments/my-courses`)
            ]);

            setQuiz(quizRes.data);

            const enrollment = enrollmentRes.data.find(e => e._id === enrollmentId);
            if (enrollment) {
                const lessonProgress = enrollment.progress?.[lesson._id];
                setAttempts(lessonProgress?.attempts || 0);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleStart = () => {
        setGameState('playing');
        setCurrentQuestionIdx(0);
        setSelectedOption(null);
        setScore(0);
    };

    const handleNext = () => {
        if (selectedOption === null) return;

        // Check answer
        const isCorrect = selectedOption === quiz.questions[currentQuestionIdx].correctAnswer;
        if (isCorrect) setScore(s => s + 1);

        if (currentQuestionIdx < quiz.questions.length - 1) {
            setCurrentQuestionIdx(idx => idx + 1);
            setSelectedOption(null);
        } else {
            handleFinish(isCorrect ? score + 1 : score);
        }
    };

    const handleFinish = async (finalScore) => {
        setGameState('result');
        const scorePercent = Math.round((finalScore / quiz.questions.length) * 100);
        const passed = scorePercent >= quiz.passingScore;
        const newAttemptNum = attempts + 1;

        if (passed) {
            // Calculate reward points based on attempt
            let points = quiz.rewards?.attempt1 || 100;
            if (newAttemptNum === 2) points = quiz.rewards?.attempt2 || 50;
            else if (newAttemptNum === 3) points = quiz.rewards?.attempt3 || 25;
            else if (newAttemptNum >= 4) points = quiz.rewards?.attempt4Plus || 10;

            if (onComplete) onComplete(points, newAttemptNum);
        } else {
            // Update attempt count even if failed
            try {
                await axios.put(`${API_URL}/enrollments/${enrollmentId}/progress`, {
                    lessonId: lesson._id,
                    attempts: newAttemptNum,
                    completed: false
                });
                setAttempts(newAttemptNum);
            } catch (err) {
                console.error("Failed to update attempts:", err);
            }
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-20 text-slate-400">
            <Loader2 className="animate-spin mb-4" />
            <p>Loading Quiz...</p>
        </div>
    );

    if (!quiz) return (
        <div className="flex flex-col items-center justify-center p-20 text-slate-400">
            <AlertCircle className="mb-4" />
            <p>Multiple choice questions are coming soon for this lesson.</p>
        </div>
    );

    const currentReward = () => {
        const nextAttempt = attempts + 1;
        if (nextAttempt === 1) return { points: quiz.rewards?.attempt1 || 100, label: 'First try' };
        if (nextAttempt === 2) return { points: quiz.rewards?.attempt2 || 50, label: 'Second try' };
        if (nextAttempt === 3) return { points: quiz.rewards?.attempt3 || 25, label: 'Third try' };
        return { points: quiz.rewards?.attempt4Plus || 10, label: 'Retry reward' };
    };

    if (gameState === 'intro') {
        const reward = currentReward();
        return (
            <div className="p-8 md:p-12 text-center max-w-2xl mx-auto animate-in fade-in zoom-in duration-300">
                <div className="w-20 h-20 bg-blue-500/10 text-blue-500 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                    <HelpCircle size={40} />
                </div>
                <h2 className="text-3xl font-black text-slate-900 mb-4">{quiz.title}</h2>
                <p className="text-slate-500 mb-10 leading-relaxed font-medium">{quiz.description || "Test your understanding of the concepts covered in this module."}</p>

                <div className="grid grid-cols-2 gap-6 mb-10">
                    <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mb-2">Questions</p>
                        <p className="text-2xl font-black text-slate-900">{quiz.questions.length}</p>
                    </div>
                    <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mb-2">Attempts Made</p>
                        <p className="text-2xl font-black text-slate-900">{attempts}</p>
                    </div>
                </div>

                <div className="bg-emerald-50 text-emerald-700 p-6 rounded-3xl text-sm font-bold flex items-center gap-4 mb-10 border border-emerald-100">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shrink-0 shadow-sm text-emerald-600">
                        <Award size={24} />
                    </div>
                    <div className="text-left">
                        <p className="text-xs opacity-60 uppercase tracking-widest">{reward.label}</p>
                        <p className="text-lg">Pass to earn <span className="text-emerald-600">{reward.points} Points</span></p>
                    </div>
                </div>

                <Button size="lg" className="w-full h-16 text-xl font-bold shadow-xl shadow-blue-500/20 rounded-[1.5rem]" onClick={handleStart}>
                    Start Quiz
                </Button>
            </div>
        );
    }

    if (gameState === 'playing') {
        const question = quiz.questions[currentQuestionIdx];
        const isLastQuestion = currentQuestionIdx === quiz.questions.length - 1;

        return (
            <div className="p-8 md:p-12 flex flex-col h-full min-h-[500px] animate-in slide-in-from-right duration-300">
                <div className="flex justify-between items-center mb-10">
                    <span className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Step {currentQuestionIdx + 1} of {quiz.questions.length}</span>
                    <div className="h-2 w-32 bg-slate-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-blue-500 transition-all duration-500"
                            style={{ width: `${((currentQuestionIdx + 1) / quiz.questions.length) * 100}%` }}
                        ></div>
                    </div>
                </div>

                <h3 className="text-2xl font-black text-slate-900 mb-10 leading-snug">{question.questionText}</h3>

                <div className="space-y-4 flex-1">
                    {question.options.map((option, idx) => (
                        <button
                            key={idx}
                            onClick={() => setSelectedOption(idx)}
                            className={`w-full text-left p-6 rounded-3xl border-2 transition-all flex items-center justify-between group ${selectedOption === idx
                                ? 'bg-blue-50 border-blue-500 text-blue-700 ring-4 ring-blue-500/10'
                                : 'bg-white border-slate-100 text-slate-600 hover:border-slate-300'
                                }`}
                        >
                            <span className="font-bold text-lg">{option}</span>
                            <div className={`w-8 h-8 rounded-2xl border-2 flex items-center justify-center transition-all ${selectedOption === idx ? 'bg-blue-500 border-blue-500' : 'border-slate-200'
                                }`}>
                                {selectedOption === idx && <CheckCircle size={18} className="text-white" />}
                            </div>
                        </button>
                    ))}
                </div>

                <div className="mt-10 pt-10 border-t border-slate-100 flex justify-end">
                    <Button
                        size="lg"
                        disabled={selectedOption === null}
                        onClick={handleNext}
                        className="px-12 h-16 rounded-2xl text-lg font-bold shadow-lg"
                    >
                        {isLastQuestion ? 'Complete Quiz' : 'Next Question'} <ChevronRight size={20} className="ml-2" />
                    </Button>
                </div>
            </div>
        );
    }

    if (gameState === 'result') {
        const scorePercent = Math.round((score / quiz.questions.length) * 100);
        const passed = scorePercent >= quiz.passingScore;
        const reward = currentReward();

        return (
            <div className="p-8 md:p-12 text-center max-w-2xl mx-auto animate-in zoom-in duration-500">
                <div className={`w-24 h-24 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-xl ${passed ? 'bg-emerald-500 text-white shadow-emerald-500/20' : 'bg-rose-500 text-white shadow-rose-500/20'
                    }`}>
                    {passed ? <Award size={48} /> : <RotateCcw size={48} />}
                </div>

                <h2 className="text-3xl font-black text-slate-900 mb-4">
                    {passed ? 'Epic Victory!' : 'Not Quite There'}
                </h2>
                <p className="text-slate-500 mb-10 text-lg font-medium">You scored <span className="text-slate-900 font-black">{score}</span> out of <span className="text-slate-900 font-black">{quiz.questions.length}</span> ({scorePercent}%)</p>

                <div className={`p-8 rounded-[2rem] mb-10 border-2 ${passed ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-rose-50 border-rose-100 text-rose-800'}`}>
                    {passed ? (
                        <div className="space-y-2">
                            <p className="text-lg font-black">Passed on attempt #{attempts + 1}!</p>
                            <p className="font-medium opacity-80">You've successfully completed this module and earned <span className="font-bold underline">{reward.points} points</span>.</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <p className="text-lg font-black">Passing score is {quiz.passingScore}%</p>
                            <p className="font-medium opacity-80">Don't give up! You can retry and still earn points for your persistence.</p>
                        </div>
                    )}
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                    <Button
                        variant="outline"
                        size="lg"
                        className="flex-1 h-16 rounded-2xl border-slate-200 text-slate-600 hover:bg-slate-50 font-bold"
                        onClick={handleStart}
                    >
                        {passed ? 'Try for 100%' : 'Retry Quiz'}
                    </Button>
                    <Button
                        size="lg"
                        className="flex-1 h-16 rounded-2xl font-bold shadow-xl shadow-blue-500/20"
                        onClick={() => window.location.reload()} // Quick way to trigger parent refresh
                    >
                        Finish & Continue
                    </Button>
                </div>
            </div>
        );
    }
}
