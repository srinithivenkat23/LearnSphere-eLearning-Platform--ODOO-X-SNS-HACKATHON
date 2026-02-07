import { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../../lib/firebase';
import Button from '../ui/Button';
import Card from '../ui/Card';
import { CheckCircle, XCircle, Trophy, FileText, PlayCircle } from 'lucide-react';

const QuizRunner = ({ lesson, courseId, onComplete }) => {
    const [quiz, setQuiz] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({}); // questionIndex -> selectedOptionIndex
    const [result, setResult] = useState(null);
    const [attempt, setAttempt] = useState(1);
    const [started, setStarted] = useState(false);

    useEffect(() => {
        loadQuiz();
    }, [lesson]);

    const loadQuiz = async () => {
        setLoading(true);
        setResult(null);
        setAnswers({});
        setActiveQuestionIndex(0);
        try {
            if (lesson.type === 'quiz' && lesson.contentUrl) {
                const quizDoc = await getDoc(doc(db, 'quizzes', lesson.contentUrl));
                if (quizDoc.exists()) {
                    setQuiz({ id: quizDoc.id, ...quizDoc.data() });
                } else {
                    console.error("Quiz not found");
                }
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectOption = (qIndex, oIndex) => {
        setAnswers(prev => ({ ...prev, [qIndex]: oIndex }));
    };

    const handleNext = () => {
        if (activeQuestionIndex < quiz.questions.length - 1) {
            setActiveQuestionIndex(prev => prev + 1);
        } else {
            submitQuiz();
        }
    };

    const submitQuiz = async () => {
        if (!quiz) return;

        // Calculate score
        let correctCount = 0;
        quiz.questions.forEach((q, i) => {
            if (answers[i] === q.correctIndex) {
                correctCount++;
            }
        });

        const isPassed = correctCount === quiz.questions.length;
        const earnedPoints = quiz.rewards?.[`attempt${attempt}`] || quiz.rewards?.attempt4 || 0;

        // Persist attempt
        try {
            await addDoc(collection(db, 'attempts'), {
                courseId,
                quizId: quiz.id,
                userId: auth.currentUser?.uid,
                score: correctCount,
                total: quiz.questions.length,
                passed: isPassed,
                points: isPassed ? earnedPoints : 0,
                attemptNumber: attempt,
                answers: answers,
                createdAt: serverTimestamp()
            });
        } catch (err) {
            console.error("Error saving attempt:", err);
        }

        setResult({
            score: correctCount,
            total: quiz.questions.length,
            points: isPassed ? earnedPoints : 0,
            passed: isPassed
        });

        if (isPassed) {
            onComplete(earnedPoints);
        } else {
            setAttempt(prev => prev + 1);
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-500">Loading quiz...</div>;
    if (!quiz) return <div className="p-8 text-center text-slate-500 text-sm">Quiz not found or invalid configuration.</div>;

    if (!started) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center space-y-6 animate-in fade-in duration-500">
                <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-2">
                    <FileText size={40} />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">{quiz.title}</h2>
                    <p className="text-slate-500 max-w-sm mx-auto">
                        This quiz contains <span className="font-bold text-slate-900">{quiz.questions.length} questions</span>.
                        You can take multiple attempts to master the content.
                    </p>
                </div>
                <div className="flex flex-col gap-3 w-full max-w-xs">
                    <Button onClick={() => setStarted(true)} className="h-12 text-lg font-bold shadow-lg shadow-blue-500/20">
                        Start Quiz
                    </Button>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Multiple Attempts Allowed</p>
                </div>
            </div>
        );
    }

    if (result) {
        return (
            <div className="flex flex-col items-center justify-center p-8 space-y-6">
                <div className="p-4 rounded-full bg-blue-50 text-blue-600">
                    {result.passed ? <Trophy size={48} /> : <XCircle size={48} className="text-red-500" />}
                </div>
                <h2 className="text-2xl font-bold text-slate-900 text-center">
                    {result.passed ? 'Quiz Completed!' : 'Try Again'}
                </h2>
                <p className="text-slate-600 text-center">
                    You scored {result.score} out of {result.total}.
                </p>

                {result.passed && result.points > 0 && (
                    <div className="bg-amber-100 text-amber-800 px-4 py-2 rounded-lg font-bold">
                        +{result.points} Points Earned
                    </div>
                )}

                {!result.passed && (
                    <div className="w-full max-w-md space-y-4">
                        <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wider text-center">Review Answers</h3>
                        {quiz.questions.map((q, i) => {
                            const isCorrect = answers[i] === q.correctIndex;
                            return (
                                <div key={i} className={`p-4 rounded-xl border-l-4 ${isCorrect ? 'bg-emerald-50 border-emerald-500' : 'bg-red-50 border-red-500'}`}>
                                    <p className="font-bold text-slate-800 text-sm mb-2">{i + 1}. {q.text}</p>
                                    <div className="flex flex-col gap-1 text-xs">
                                        <div className="flex items-center gap-2">
                                            <span className="text-slate-500 font-medium w-24">Your answer:</span>
                                            <span className={isCorrect ? 'text-emerald-700 font-bold' : 'text-red-700 font-bold'}>
                                                {q.options[answers[i]] || 'No answer'}
                                            </span>
                                        </div>
                                        {!isCorrect && (
                                            <div className="flex items-center gap-2">
                                                <span className="text-slate-500 font-medium w-24">Correct answer:</span>
                                                <span className="text-emerald-700 font-bold">{q.options[q.correctIndex]}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {result.passed ? (
                    <p className="text-sm text-slate-400 italic">Moving to next lesson...</p>
                ) : (
                    <Button onClick={() => { setResult(null); setActiveQuestionIndex(0); setAnswers({}); }}>
                        Retry Quiz
                    </Button>
                )}
            </div>
        );
    }

    const currentQuestion = quiz.questions[activeQuestionIndex];

    return (
        <div className="max-w-2xl mx-auto p-6">
            <div className="mb-8">
                <h2 className="text-xl font-bold text-slate-900">{quiz.title}</h2>
                <p className="text-sm text-slate-500">Question {activeQuestionIndex + 1} of {quiz.questions.length}</p>
                <div className="w-full bg-slate-200 h-2 rounded-full mt-2">
                    <div className="bg-blue-600 h-2 rounded-full transition-all" style={{ width: `${((activeQuestionIndex + 1) / quiz.questions.length) * 100}%` }}></div>
                </div>
            </div>

            <Card className="p-6 mb-8 border-slate-200">
                <h3 className="text-lg font-medium text-slate-900 mb-6">{currentQuestion?.text}</h3>
                <div className="space-y-3">
                    {currentQuestion?.options.map((option, index) => (
                        <button
                            key={index}
                            onClick={() => handleSelectOption(activeQuestionIndex, index)}
                            className={`w-full text-left p-4 rounded-lg border-2 transition-all ${answers[activeQuestionIndex] === index
                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                : 'border-slate-200 hover:border-blue-300'
                                }`}
                        >
                            {option}
                        </button>
                    ))}
                </div>
            </Card>

            <div className="flex justify-end">
                <Button
                    onClick={handleNext}
                    disabled={answers[activeQuestionIndex] === undefined}
                    className="h-11 px-8 font-bold"
                >
                    {activeQuestionIndex === quiz.questions.length - 1 ? 'Proceed and Complete Quiz' : 'Proceed'}
                </Button>
            </div>
        </div>
    );
};

export default QuizRunner;
