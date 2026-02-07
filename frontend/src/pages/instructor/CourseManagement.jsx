import { useState, useEffect } from 'react';
import { Plus, Search, MoreVertical, Edit, Share, Trash2, Eye, LayoutGrid, List, Clock, BookOpen, Link as LinkIcon, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, deleteDoc, doc, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import Modal from '../../components/ui/Modal';

export default function InstructorCourses() {
    const [viewMode, setViewMode] = useState('kanban'); // 'list' or 'kanban'
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'published', 'draft'
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newCourseTitle, setNewCourseTitle] = useState('');
    const [creating, setCreating] = useState(false);

    const navigate = useNavigate();
    const { userData } = useAuth();

    useEffect(() => {
        if (userData) {
            fetchCourses();
        }
    }, [userData]);

    const fetchCourses = async () => {
        setLoading(true);
        try {
            let q;
            if (userData?.role === 'admin') {
                q = query(collection(db, 'courses'));
            } else {
                q = query(
                    collection(db, 'courses'),
                    where('instructorId', '==', auth.currentUser?.uid)
                );
            }
            const querySnapshot = await getDocs(q);
            const coursesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setCourses(coursesData);
        } catch (error) {
            console.error("Error fetching courses:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCourse = async (e) => {
        e.preventDefault();
        if (!newCourseTitle.trim()) return;

        setCreating(true);
        try {
            const courseRef = await addDoc(collection(db, 'courses'), {
                title: newCourseTitle,
                instructorId: auth.currentUser?.uid,
                instructorName: userData?.name || auth.currentUser?.email,
                instructorEmail: auth.currentUser?.email,
                createdAt: serverTimestamp(),
                published: false,
                studentsCount: 0,
                lessonsCount: 0,
                viewsCount: 0,
                tags: [],
                price: 0,
                accessRule: 'free',
                description: '',
                category: 'Uncategorized'
            });

            navigate(`/instructor/courses/${courseRef.id}`);
        } catch (err) {
            console.error("Error creating course:", err);
            alert("Failed to create course");
        } finally {
            setCreating(false);
            setIsCreateModalOpen(false);
            setNewCourseTitle('');
        }
    };

    const handleDelete = async (course) => {
        if (window.confirm(`Are you sure you want to delete "${course.title}"? This action cannot be undone.`)) {
            try {
                await deleteDoc(doc(db, 'courses', course.id));
                setCourses(courses.filter(c => c.id !== course.id));
            } catch (err) {
                console.error("Error deleting course:", err);
                alert("Failed to delete course");
            }
        }
    };

    const handleTogglePublish = async (course) => {
        const newStatus = !course.published;
        try {
            await updateDoc(doc(db, 'courses', course.id), {
                published: newStatus,
                updatedAt: serverTimestamp()
            });
            setCourses(courses.map(c => c.id === course.id ? { ...c, published: newStatus } : c));
        } catch (err) {
            console.error("Error updating course status:", err);
            alert("Failed to update course status");
        }
    };

    const handleShare = (courseId) => {
        const link = `${window.location.origin}/courses/${courseId}`;
        navigator.clipboard.writeText(link);
        alert("Course link copied to clipboard!");
    };

    const filteredCourses = courses.filter(c => {
        const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' ||
            (statusFilter === 'published' && c.published) ||
            (statusFilter === 'draft' && !c.published);
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-[1400px] mx-auto p-4 sm:p-6 lg:p-10">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Courses Dashboard</h1>
                        <p className="text-slate-500 mt-1">Manage, track performance, and create new learning experiences.</p>
                    </div>
                    <Button onClick={() => setIsCreateModalOpen(true)} className="shadow-lg shadow-blue-500/20 px-6 py-2.5">
                        <Plus size={20} className="mr-2" />
                        Create New Course
                    </Button>
                </div>

                {/* Filters and View Toggles */}
                <div className="flex flex-col gap-6 mb-8">
                    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                            {['all', 'published', 'draft'].map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setStatusFilter(status)}
                                    className={`px-6 py-2 rounded-lg text-sm font-bold capitalize transition-all ${statusFilter === status ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>

                        <div className="relative w-full md:max-w-md">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search by course name..."
                                className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                            <button
                                onClick={() => setViewMode('kanban')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'kanban' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                <LayoutGrid size={16} /> Kanban
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                <List size={16} /> List
                            </button>
                        </div>
                    </div>
                </div>

                {/* Course Grid/List */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 bg-white rounded-3xl border border-slate-100">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4"></div>
                        <p className="text-slate-500 font-medium">Loading your catalog...</p>
                    </div>
                ) : filteredCourses.length === 0 ? (
                    <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-slate-200">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <BookOpen size={40} className="text-slate-300" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">No courses found</h3>
                        <p className="text-slate-500 mb-8 max-w-sm mx-auto">
                            {searchTerm || statusFilter !== 'all'
                                ? "Try adjusting your search or filters to find what you're looking for."
                                : "Start fresh by creating your very first course today."}
                        </p>
                        <Button variant="outline" onClick={() => setIsCreateModalOpen(true)}>
                            {searchTerm || statusFilter !== 'all' ? 'Clear Filters' : 'Start Your First Course'}
                        </Button>
                    </div>
                ) : viewMode === 'kanban' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredCourses.map(course => (
                            <CourseKanbanCard
                                key={course.id}
                                course={course}
                                onEdit={() => navigate(`/instructor/courses/${course.id}`)}
                                onDelete={() => handleDelete(course)}
                                onShare={handleShare}
                                onTogglePublish={() => handleTogglePublish(course)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Course</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest hidden lg:table-cell">Details</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest hidden lg:table-cell">Duration</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest hidden md:table-cell">Status</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredCourses.map(course => (
                                    <CourseListRow
                                        key={course.id}
                                        course={course}
                                        onEdit={() => navigate(`/instructor/courses/${course.id}`)}
                                        onDelete={() => handleDelete(course)}
                                        onShare={handleShare}
                                        onTogglePublish={() => handleTogglePublish(course)}
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Create Course Modal */}
            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                title="Create New Course"
            >
                <form onSubmit={handleCreateCourse} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Course Title</label>
                        <input
                            autoFocus
                            type="text"
                            placeholder="e.g. Master React in 30 Days"
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                            value={newCourseTitle}
                            onChange={(e) => setNewCourseTitle(e.target.value)}
                            required
                        />
                        <p className="mt-2 text-xs text-slate-500">You can change this later in settings.</p>
                    </div>
                    <div className="flex gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            className="flex-1"
                            onClick={() => setIsCreateModalOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="flex-1"
                            disabled={creating}
                        >
                            {creating ? 'Creating...' : 'Create Course'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}

const CourseKanbanCard = ({ course, onEdit, onDelete, onShare, onTogglePublish }) => {
    return (
        <Card className="group flex flex-col h-full bg-white border border-slate-200 hover:border-blue-400 hover:shadow-2xl hover:shadow-blue-500/5 transition-all duration-300 rounded-3xl overflow-hidden p-0">
            <div className="h-44 bg-slate-100 relative overflow-hidden shrink-0">
                {course.imageUrl ? (
                    <img src={course.imageUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <BookOpen size={40} />
                    </div>
                )}
                <div className="absolute top-4 left-4 right-4 flex justify-between">
                    <button
                        onClick={(e) => { e.preventDefault(); onTogglePublish(); }}
                        className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm border transition-colors ${course.published ? 'bg-emerald-500 text-white border-emerald-400 hover:bg-emerald-600' : 'bg-slate-900/80 text-white border-slate-700 hover:bg-slate-900'}`}
                    >
                        {course.published ? 'Published' : 'Draft'}
                    </button>
                    <button onClick={(e) => { e.preventDefault(); onShare(course.id); }} className="p-2 bg-white/20 backdrop-blur-md rounded-lg text-white hover:bg-white hover:text-slate-900 transition-colors">
                        <Share size={14} />
                    </button>
                </div>
            </div>

            <div className="p-6 flex flex-col flex-1">
                <div className="flex flex-wrap gap-1.5 mb-3">
                    {course.tags?.length > 0 ? course.tags.map((t, i) => (
                        <span key={i} className="px-2 py-0.5 bg-blue-50 text-[10px] text-blue-600 font-bold rounded uppercase tracking-tighter">{t}</span>
                    )) : (
                        <span className="px-2 py-0.5 bg-slate-50 text-[10px] text-slate-400 font-bold rounded uppercase tracking-tighter">No Tags</span>
                    )}
                </div>

                <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">{course.title}</h3>

                <div className="grid grid-cols-2 gap-4 mt-auto pt-6 border-t border-slate-50">
                    <div className="flex items-center gap-2 text-slate-500">
                        <Eye size={14} className="text-slate-400" />
                        <span className="text-xs font-medium">{course.viewsCount || 0} Views</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500">
                        <BookOpen size={14} className="text-slate-400" />
                        <span className="text-xs font-medium">{course.lessonsCount || 0} Lessons</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500">
                        <Clock size={14} className="text-slate-400" />
                        <span className="text-xs font-medium">{course.totalDuration || '2.5h'}</span>
                    </div>
                </div>

                <div className="flex gap-2 mt-6">
                    <Button onClick={onEdit} className="flex-1 py-1.5 text-xs font-bold">
                        <Edit size={14} className="mr-2" /> Edit Course
                    </Button>
                    <button
                        onClick={onDelete}
                        className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>
        </Card>
    );
};

const CourseListRow = ({ course, onEdit, onDelete, onShare, onTogglePublish }) => {
    return (
        <tr className="hover:bg-slate-50 transition-colors group">
            <td className="px-6 py-4">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-10 bg-slate-100 rounded-lg overflow-hidden shrink-0 border border-slate-200">
                        {course.imageUrl ? (
                            <img src={course.imageUrl} className="w-full h-full object-cover" alt="" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300"><BookOpen size={16} /></div>
                        )}
                    </div>
                    <div>
                        <div className="font-bold text-slate-900 mb-0.5 truncate max-w-xs">{course.title}</div>
                        <div className="flex gap-1.5">
                            {course.tags?.slice(0, 2).map((t, i) => (
                                <span key={i} className="text-[9px] font-bold text-blue-500 uppercase tracking-tighter">{t}</span>
                            ))}
                        </div>
                    </div>
                </div>
            </td>
            <td className="px-6 py-4 hidden lg:table-cell">
                <div className="flex items-center gap-6 text-slate-500">
                    <div className="flex items-center gap-1.5">
                        <Eye size={14} />
                        <span className="text-sm">{course.viewsCount || 0}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <BookOpen size={14} />
                        <span className="text-sm">{course.lessonsCount || 0}</span>
                    </div>
                </div>
            </td>
            <td className="px-6 py-4 hidden lg:table-cell">
                <div className="flex items-center gap-1.5 text-slate-500">
                    <Clock size={14} />
                    <span className="text-sm">{course.totalDuration || '2.5h'}</span>
                </div>
            </td>
            <td className="px-6 py-4 hidden md:table-cell">
                <button
                    onClick={onTogglePublish}
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors border ${course.published ? 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100' : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'}`}
                >
                    {course.published ? 'Active' : 'Draft'}
                </button>
            </td>
            <td className="px-6 py-4 text-right">
                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={onEdit} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-slate-200" title="Edit">
                        <Edit size={16} />
                    </button>
                    <button onClick={() => onShare(course.id)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-slate-200" title="Share">
                        <Share size={16} />
                    </button>
                    <button onClick={onDelete} className="p-2 text-slate-400 hover:text-red-500 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-slate-200" title="Delete">
                        <Trash2 size={16} />
                    </button>
                </div>
            </td>
        </tr>
    );
};
