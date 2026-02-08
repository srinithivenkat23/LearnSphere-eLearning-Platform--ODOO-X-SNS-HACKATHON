import { useState, useEffect } from 'react';
import axios from 'axios';
const API_URL = 'http://localhost:5000/api';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { Search, Users, CheckCircle, Clock, Layout, Filter, Settings, X, ChevronRight, BarChart2, TrendingUp } from 'lucide-react';

export default function InstructorReporting() {
    const { userData, user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [enrollments, setEnrollments] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all'); // all, yet-to-start, in-progress, completed
    const [isColumnPickerOpen, setIsColumnPickerOpen] = useState(false);

    // Column Visibility State
    const [visibleColumns, setVisibleColumns] = useState({
        srNo: true,
        courseName: true,
        participantName: true,
        enrolledDate: true,
        startDate: true,
        timeSpent: true,
        progressPercent: true,
        completedDate: true,
        status: true
    });

    const [stats, setStats] = useState({
        total: 0,
        yetToStart: 0,
        inProgress: 0,
        completed: 0
    });

    useEffect(() => {
        if (userData && user) loadData();
    }, [userData, user]);

    const loadData = async () => {
        try {
            setLoading(true);
            const instructorId = user?.uid;
            const role = userData?.role;

            let res;
            if (role === 'admin') {
                res = await axios.get(`${API_URL}/enrollments/all`);
            } else {
                res = await axios.get(`${API_URL}/enrollments/instructor/${instructorId}`);
            }

            const data = res.data || [];

            // Generate stats
            const s = { total: data.length, yetToStart: 0, inProgress: 0, completed: 0 };
            const processed = data.map((e, idx) => {
                const status = e.completed ? 'Completed' : (e.progressPercent > 0 ? 'In Progress' : 'Yet to Start');
                if (status === 'Completed') s.completed++;
                else if (status === 'In Progress') s.inProgress++;
                else s.yetToStart++;

                return {
                    ...e,
                    srNo: idx + 1,
                    courseName: e.courseId?.title || 'Unknown Course',
                    participantName: e.userId?.name || 'Learner',
                    enrolledDate: e.enrolledAt ? new Date(e.enrolledAt).toLocaleDateString() : '-',
                    startDate: e.startedAt ? new Date(e.startedAt).toLocaleDateString() : 'Not Started',
                    timeSpent: `${e.timeSpent || 0}m`,
                    progressPercent: `${e.progressPercent || 0}%`,
                    completedDate: e.completedAt ? new Date(e.completedAt).toLocaleDateString() : '-',
                    status: status
                };
            });

            setStats(s);
            setEnrollments(processed);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const filteredEnrollments = enrollments.filter(e => {
        const matchesSearch = e.participantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            e.courseName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || e.status.toLowerCase().replace(/ /g, '-') === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const toggleColumn = (col) => {
        setVisibleColumns(prev => ({ ...prev, [col]: !prev[col] }));
    };

    if (loading) return <div className="p-20 text-center text-slate-500 font-bold">Generating reports...</div>;

    return (
        <div className="p-8 max-w-[1600px] mx-auto bg-slate-50 min-h-screen relative overflow-hidden">
            <div className="mb-10 flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Reporting Dashboard</h1>
                    <p className="text-slate-500 mt-1 font-medium">Detailed course-wise learner progress analytics.</p>
                </div>
                <Button variant="outline" onClick={() => setIsColumnPickerOpen(true)} className="h-11 shadow-sm border-slate-200">
                    <Settings size={18} className="mr-2" />
                    Customize Columns
                </Button>
            </div>

            {/* Analytics Visualization Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
                {/* Growth Trend Line Chart */}
                <Card className="p-8 shadow-xl shadow-blue-900/5 border-slate-100">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-bold text-slate-900">Enrollment Growth</h3>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Last 7 Months</p>
                        </div>
                        <div className="flex items-center gap-1.5 text-blue-600 bg-blue-50 px-3 py-1.5 rounded-xl font-bold text-xs">
                            <TrendingUp size={14} /> +24% increase
                        </div>
                    </div>
                    <div className="h-64 w-full bg-slate-50/50 rounded-2xl relative overflow-hidden group">
                        <svg className="w-full h-full p-4" viewBox="0 0 400 200">
                            <defs>
                                <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#2563eb" stopOpacity="0.2" />
                                    <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
                                </linearGradient>
                            </defs>
                            <path
                                d="M 0 160 Q 50 140 100 150 T 200 80 T 300 100 T 400 40"
                                fill="none" stroke="#2563eb" strokeWidth="4"
                                className="animate-draw"
                            />
                            <path
                                d="M 0 160 Q 50 140 100 150 T 200 80 T 300 100 T 400 40 L 400 200 L 0 200 Z"
                                fill="url(#lineGrad)"
                            />
                            {/* Dots */}
                            {[
                                { x: 0, y: 160 }, { x: 100, y: 150 }, { x: 200, y: 80 }, { x: 300, y: 100 }, { x: 400, y: 40 }
                            ].map((p, i) => (
                                <circle key={i} cx={p.x} cy={p.y} r="4" fill="white" stroke="#2563eb" strokeWidth="2" className="hover:r-6 transition-all cursor-pointer" />
                            ))}
                        </svg>
                        <div className="absolute bottom-4 left-4 right-4 flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            <span>Jan</span><span>Mar</span><span>May</span><span>Jul</span>
                        </div>
                    </div>
                </Card>

                {/* Category Bar Chart */}
                <Card className="p-8 shadow-xl shadow-blue-900/5 border-slate-100">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-bold text-slate-900">Category Popularity</h3>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Platform-wide Distribution</p>
                        </div>
                        <BarChart2 size={24} className="text-blue-500" />
                    </div>
                    <div className="h-64 flex items-end gap-6 px-4">
                        {[
                            { h: 40, label: 'Design' },
                            { h: 90, label: 'Code' },
                            { h: 65, label: 'Business' },
                            { h: 30, label: 'Music' },
                            { h: 80, label: 'AI' }
                        ].map((bar, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-4">
                                <div className="w-full bg-slate-100 rounded-t-2xl relative group overflow-hidden" style={{ height: '180px' }}>
                                    <div
                                        className="absolute bottom-0 left-0 right-0 bg-blue-600 rounded-t-2xl transition-all duration-1000 ease-out group-hover:bg-blue-700"
                                        style={{ height: `${bar.h}%` }}
                                    >
                                        <div className="absolute top-2 left-1/2 -translate-x-1/2 text-[10px] font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                            {bar.h}%
                                        </div>
                                    </div>
                                </div>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{bar.label}</span>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>

            {/* Filter & Search Bar */}
            <div className="mb-6 flex gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search by participant or course..."
                        className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium text-slate-700 bg-white"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Button variant="outline" className="h-[60px] px-6 rounded-2xl border-slate-200" onClick={() => { setSearchTerm(''); setStatusFilter('all'); }}>
                    Reset Filters
                </Button>
            </div>

            {/* Users Table */}
            <Card className="overflow-hidden border-slate-100 shadow-2xl shadow-slate-200/40">
                <div className="overflow-x-auto">
                    <table className="w-full text-left whitespace-nowrap">
                        <thead className="bg-slate-50/80 border-b border-slate-100">
                            <tr>
                                {visibleColumns.srNo && <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Sr No.</th>}
                                {visibleColumns.courseName && <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Course Name</th>}
                                {visibleColumns.participantName && <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Participant Name</th>}
                                {visibleColumns.enrolledDate && <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Enrolled Date</th>}
                                {visibleColumns.startDate && <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Start Date</th>}
                                {visibleColumns.timeSpent && <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Time Spent</th>}
                                {visibleColumns.progressPercent && <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Progress</th>}
                                {visibleColumns.completedDate && <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Completed Date</th>}
                                {visibleColumns.status && <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white font-medium">
                            {filteredEnrollments.map((row) => (
                                <tr key={row.id} className="hover:bg-slate-50/50 transition-colors group">
                                    {visibleColumns.srNo && <td className="px-6 py-5 text-slate-500 font-bold">{row.srNo}</td>}
                                    {visibleColumns.courseName && <td className="px-6 py-5 text-slate-900 font-bold">{row.courseName}</td>}
                                    {visibleColumns.participantName && <td className="px-6 py-5 text-blue-600 font-bold">{row.participantName}</td>}
                                    {visibleColumns.enrolledDate && <td className="px-6 py-5 text-slate-500">{row.enrolledDate}</td>}
                                    {visibleColumns.startDate && <td className="px-6 py-5 text-slate-500">{row.startDate}</td>}
                                    {visibleColumns.timeSpent && <td className="px-6 py-5 text-slate-500">{row.timeSpent}</td>}
                                    {visibleColumns.progressPercent && (
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                    <div className="h-full bg-blue-500 rounded-full" style={{ width: row.progressPercent }}></div>
                                                </div>
                                                <span className="text-xs font-black text-slate-400">{row.progressPercent}</span>
                                            </div>
                                        </td>
                                    )}
                                    {visibleColumns.completedDate && <td className="px-6 py-5 text-slate-500">{row.completedDate}</td>}
                                    {visibleColumns.status && (
                                        <td className="px-6 py-5">
                                            <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${row.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                                                row.status === 'In Progress' ? 'bg-amber-100 text-amber-700' :
                                                    'bg-slate-100 text-slate-500'
                                                }`}>
                                                {row.status}
                                            </span>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Column Customizer Panel */}
            {isColumnPickerOpen && (
                <div
                    className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300"
                    onClick={() => setIsColumnPickerOpen(false)}
                >
                    <div
                        className="w-96 bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-500"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                            <div>
                                <h3 className="text-2xl font-black text-slate-900">Custom Columns</h3>
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Show/Hide table data</p>
                            </div>
                            <button onClick={() => setIsColumnPickerOpen(false)} className="p-2 hover:bg-slate-50 rounded-xl transition-all">
                                <X size={24} className="text-slate-400" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-8 space-y-4">
                            {[
                                { id: 'srNo', label: 'Serial Number' },
                                { id: 'courseName', label: 'Course Name' },
                                { id: 'participantName', label: 'Participant Name' },
                                { id: 'enrolledDate', label: 'Enrolled Date' },
                                { id: 'startDate', label: 'Start Date' },
                                { id: 'timeSpent', label: 'Time Spent' },
                                { id: 'progressPercent', label: 'Completion %' },
                                { id: 'completedDate', label: 'Completed Date' },
                                { id: 'status', label: 'Status Badge' },
                            ].map(col => (
                                <label key={col.id} className="flex items-center gap-4 p-4 rounded-2xl border-2 border-slate-50 hover:border-blue-500/20 hover:bg-blue-50/30 transition-all cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={visibleColumns[col.id]}
                                        onChange={() => toggleColumn(col.id)}
                                        className="w-5 h-5 rounded-lg text-blue-600 focus:ring-blue-500 border-slate-200"
                                    />
                                    <span className={`text-sm font-bold ${visibleColumns[col.id] ? 'text-slate-900' : 'text-slate-400'}`}>{col.label}</span>
                                    {visibleColumns[col.id] && <CheckCircle size={16} className="ml-auto text-emerald-500" />}
                                </label>
                            ))}
                        </div>
                        <div className="p-8 bg-slate-50 border-t border-slate-100">
                            <Button className="w-full h-14 bg-blue-600 rounded-2xl font-black" onClick={() => setIsColumnPickerOpen(false)}>
                                Done Customizing
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
