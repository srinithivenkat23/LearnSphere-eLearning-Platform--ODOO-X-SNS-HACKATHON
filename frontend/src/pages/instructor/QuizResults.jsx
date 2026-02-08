import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
const API_URL = 'http://localhost:5000/api';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { ArrowLeft, GraduationCap, CheckCircle, XCircle, Search, Clock, Award, AlertTriangle, Eye } from 'lucide-react';

export default function QuizResults() {
    const { courseId, quizId } = useParams();
    const navigate = useNavigate();
    const [attempts, setAttempts] = useState([]);
    const [quiz, setQuiz] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadData();
    }, [quizId]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [quizRes, attemptsRes] = await Promise.all([
                axios.get(`${API_URL}/quizzes/${quizId}`),
                axios.get(`${API_URL}/attempts/quiz/${quizId}`)
            ]);
            setQuiz(quizRes.data);
            setAttempts(attemptsRes.data || []);
        } catch (err) {
            console.error("Error loading quiz results:", err);
        } finally {
            setLoading(false);
        }
    };

    const filteredAttempts = attempts.filter(a =>
        a.userId?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.userId?.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="p-8 text-center text-slate-500">Loading results...</div>;

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center gap-6 mb-8">
                    <button onClick={() => navigate(`/instructor/courses/${courseId}`)} className="p-2 hover:bg-white rounded-lg transition-colors text-slate-400 hover:text-slate-600 shadow-sm border border-transparent hover:border-slate-200">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">{quiz?.title || 'Quiz'} Results</h1>
                        <p className="text-sm text-slate-500 font-medium">Tracking student performance and engagement.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Card className="p-6">
                        <div className="flex items-center gap-4 text-emerald-600 mb-2">
                            <GraduationCap size={20} />
                            <span className="text-xs font-bold uppercase tracking-widest">Total Attempts</span>
                        </div>
                        <h3 className="text-3xl font-black text-slate-900">{attempts.length}</h3>
                    </Card>
                    <Card className="p-6">
                        <div className="flex items-center gap-4 text-blue-600 mb-2">
                            <Award size={20} />
                            <span className="text-xs font-bold uppercase tracking-widest">Pass Rate</span>
                        </div>
                        <h3 className="text-3xl font-black text-slate-900">
                            {attempts.length > 0 ? Math.round((attempts.filter(a => a.passed).length / attempts.length) * 100) : 0}%
                        </h3>
                    </Card>
                    <Card className="p-6">
                        <div className="flex items-center gap-4 text-amber-600 mb-2">
                            <Clock size={20} />
                            <span className="text-xs font-bold uppercase tracking-widest">Avg. Score</span>
                        </div>
                        <h3 className="text-3xl font-black text-slate-900">
                            {attempts.length > 0 ? Math.round(attempts.reduce((acc, current) => acc + current.score, 0) / attempts.length) : 0}%
                        </h3>
                    </Card>
                </div>

                <Card className="p-0 overflow-hidden border-slate-200 shadow-xl shadow-slate-200/50">
                    <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 bg-white">
                        <h3 className="font-bold text-slate-900">Student Breakdown</h3>
                        <div className="relative w-full md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                type="text"
                                placeholder="Search students..."
                                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 text-left border-b border-slate-100">
                                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Student</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Score</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Proctoring</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                                {filteredAttempts.length > 0 ? (
                                    filteredAttempts.map((attempt) => (
                                        <tr key={attempt._id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                                                        {attempt.userId?.name[0].toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-900">{attempt.userId?.name}</p>
                                                        <p className="text-[10px] text-slate-400 font-medium">{attempt.userId?.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-sm font-black ${attempt.passed ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                        {attempt.score}/{attempt.total}
                                                    </span>
                                                    <span className="text-[10px] text-slate-300 font-bold">({Math.round((attempt.score / attempt.total) * 100)}%)</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {attempt.passed ? (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                                                        <CheckCircle size={10} /> Pass
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 text-rose-600 text-[10px] font-black uppercase tracking-widest border border-rose-100">
                                                        <XCircle size={10} /> Fail
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    {(attempt.proctoring?.tabSwitches > 0 || attempt.proctoring?.fullScreenExits > 0) ? (
                                                        <>
                                                            <AlertTriangle size={14} className="text-amber-500" />
                                                            <div className="text-xs">
                                                                {attempt.proctoring?.tabSwitches > 0 && (
                                                                    <span className="text-amber-600 font-bold">{attempt.proctoring.tabSwitches} switches</span>
                                                                )}
                                                                {attempt.proctoring?.fullScreenExits > 0 && (
                                                                    <span className="text-red-600 font-bold ml-2">{attempt.proctoring.fullScreenExits} exits</span>
                                                                )}
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <span className="text-emerald-600 text-xs font-bold flex items-center gap-1">
                                                            <CheckCircle size={12} /> Clean
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold text-slate-700">{new Date(attempt.createdAt).toLocaleDateString()}</span>
                                                    <span className="text-[10px] text-zinc-400 font-medium">{new Date(attempt.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-slate-400 italic text-sm">
                                            No student attempts found for this search.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </div>
    );
}
