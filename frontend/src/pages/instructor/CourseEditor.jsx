import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
const API_URL = 'http://localhost:5000/api';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import {
    ArrowLeft, Save, Layout, FileText, Settings, HelpCircle,
    Eye, Users, Mail, Image as ImageIcon, Upload, Check, X,
    Globe, Shield, ExternalLink
} from 'lucide-react';

// Tab Components
import ContentTab from './tabs/ContentTab';
import QuizTab from './tabs/QuizTab';
import DescriptionTab from './tabs/DescriptionTab';
import OptionsTab from './tabs/OptionsTab';

// Wizards
import { AddAttendeeModal, ContactAttendeesModal } from './wizards/AttendeeWizards';

export default function CourseEditor() {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const { userData, user } = useAuth();

    // UI State
    const [activeTab, setActiveTab] = useState('content');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isAddAttendeeOpen, setIsAddAttendeeOpen] = useState(false);
    const [isContactAttendeesOpen, setIsContactAttendeesOpen] = useState(false);
    const [backofficeUsers, setBackofficeUsers] = useState([]);

    // Form State
    const [course, setCourse] = useState({
        title: '',
        description: '',
        shortDescription: '',
        imageUrl: '',
        published: false,
        accessRule: 'open',
        price: 0,
        tags: [],
        websiteUrl: '',
        responsibleId: '',
        responsibleName: '',
        visibility: 'public',
        studentsCount: 0,
        lessonsCount: 0
    });

    useEffect(() => {
        if (courseId) {
            loadCourse();
            fetchBackofficeUsers();
        }
    }, [courseId]);

    const fetchBackofficeUsers = async () => {
        try {
            const response = await axios.get(`${API_URL}/users/backoffice-users`);
            setBackofficeUsers(response.data || []);
        } catch (err) {
            console.error("Error fetching backoffice users:", err);
        }
    };

    const loadCourse = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_URL}/courses/${courseId}`);
            if (response.data) {
                setCourse(response.data);
            } else {
                alert('Course not found');
                navigate('/instructor/courses');
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (field, value) => {
        setCourse(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        if (!course.title.trim()) {
            alert("Course title is required");
            return;
        }

        setSaving(true);
        try {
            await axios.put(`${API_URL}/courses/${courseId}`, {
                ...course,
                updatedAt: new Date()
            });
            alert("Changes saved successfully!");
        } catch (err) {
            console.error(err);
            alert('Failed to save course');
        } finally {
            setSaving(false);
        }
    };

    const togglePublish = async () => {
        const newState = !course.published;

        try {
            setCourse(prev => ({ ...prev, published: newState }));
            await axios.put(`${API_URL}/courses/${courseId}`, {
                published: newState,
                updatedAt: new Date()
            });
        } catch (err) {
            console.error(err);
            alert("Failed to toggle publish status");
        }
    };

    const handleAddTag = (e) => {
        if (e.key === 'Enter' && e.target.value.trim()) {
            const newTag = e.target.value.trim();
            if (!course.tags.includes(newTag)) {
                setCourse(prev => ({ ...prev, tags: [...prev.tags, newTag] }));
            }
            e.target.value = '';
        }
    };

    const removeTag = (tagToRemove) => {
        setCourse(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tagToRemove) }));
    };

    const tabs = [
        { id: 'content', label: 'Content', icon: Layout },
        { id: 'description', label: 'Description', icon: FileText },
        { id: 'options', label: 'Options', icon: Settings },
        { id: 'quiz', label: 'Quiz', icon: HelpCircle },
    ];

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );

    return (
        <div className="flex flex-col h-screen bg-slate-50 overflow-hidden">
            {/* --- TOP HEADER --- */}
            <div className="bg-white border-b border-slate-200 px-8 py-3 flex items-center justify-between shadow-sm z-30">
                <div className="flex items-center gap-6">
                    <button onClick={() => navigate('/instructor/courses')} className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500">
                        <ArrowLeft size={20} />
                    </button>
                    <div className="h-8 w-px bg-slate-200"></div>
                    <div className="flex items-center gap-3">
                        <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border shadow-sm transition-all ${course.published ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-amber-50 text-amber-600 border-amber-200'}`}>
                            {course.published ? 'Course is Live' : 'Draft Mode'}
                        </span>
                        <div className="h-6 w-px bg-slate-200 mx-1"></div>
                        <Button
                            variant={course.published ? "outline" : "primary"}
                            size="sm"
                            className={`h-9 px-4 text-xs font-bold ${course.published ? 'border-slate-200 text-slate-600 hover:bg-slate-50' : 'bg-blue-600 shadow-blue-500/20'}`}
                            onClick={togglePublish}
                        >
                            {course.published ? (
                                <><Globe size={14} className="mr-2" /> Unpublish</>
                            ) : (
                                <><Globe size={14} className="mr-2" /> Publish Course</>
                            )}
                        </Button>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Button variant="outline" className="text-xs h-9 px-4" onClick={() => window.open(`/courses/${courseId}`, '_blank')}>
                        <Eye size={16} className="mr-2" /> Preview
                    </Button>
                    <Button variant="outline" className="text-xs h-9 px-4" onClick={() => setIsAddAttendeeOpen(true)}>
                        <Users size={16} className="mr-2" /> Add Attendees
                    </Button>
                    <Button variant="outline" className="text-xs h-9 px-4" onClick={() => setIsContactAttendeesOpen(true)}>
                        <Mail size={16} className="mr-2" /> Contact
                    </Button>
                    <div className="h-8 w-px bg-slate-200 mx-2"></div>
                    <Button onClick={handleSave} disabled={saving} className="h-9 px-6 bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20">
                        <Save size={18} className="mr-2" />
                        {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </div>

            {/* --- METADATA SECTION --- */}
            <div className="bg-white border-b border-slate-200 px-8 py-6 z-20">
                <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row gap-8">
                    {/* Image Upload Area */}
                    <div className="shrink-0">
                        <div className="relative group w-full lg:w-48 h-32 rounded-2xl bg-white border-2 border-dashed border-slate-200 overflow-hidden flex flex-col items-center justify-center transition-all hover:bg-slate-50 hover:border-blue-400 cursor-pointer shadow-sm">
                            {course.imageUrl ? (
                                <>
                                    <img src={course.imageUrl} className="w-full h-full object-cover" alt="" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <Upload className="text-white" size={24} />
                                    </div>
                                </>
                            ) : (
                                <>
                                    <ImageIcon className="text-slate-300 mb-2" size={32} />
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Course image</span>
                                </>
                            )}
                            <input
                                type="text"
                                placeholder="Paste image URL..."
                                className="absolute bottom-2 left-2 right-2 px-2 py-1 text-[10px] bg-white border border-slate-200 rounded opacity-0 group-hover:opacity-100 transition-opacity outline-none focus:ring-1 focus:ring-blue-500 shadow-lg"
                                value={course.imageUrl || ''}
                                onChange={(e) => handleChange('imageUrl', e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Metadata Fields */}
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Course Title</label>
                            <input
                                type="text"
                                className="w-full text-2xl font-bold text-slate-900 border-none p-0 focus:ring-0 placeholder:text-slate-200"
                                placeholder="e.g. Mastering Modern Frontend"
                                value={course.title}
                                onChange={(e) => handleChange('title', e.target.value)}
                            />

                            <div className="flex flex-wrap gap-2 mt-4 items-center">
                                {course.tags?.map(tag => (
                                    <span key={tag} className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold border border-blue-100">
                                        {tag}
                                        <button onClick={() => removeTag(tag)} className="hover:text-blue-800"><X size={12} /></button>
                                    </span>
                                ))}
                                <div className="relative">
                                    <input
                                        type="text"
                                        className="border-none bg-slate-50 rounded-full px-4 py-1 text-xs focus:ring-2 focus:ring-blue-500 outline-none w-28 placeholder:text-slate-400"
                                        placeholder="+ Add Tag"
                                        onKeyDown={handleAddTag}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Responsible Admin</label>
                                <select
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={course.responsibleId || ''}
                                    onChange={(e) => {
                                        const selectedId = e.target.value;
                                        const selectedUser = backofficeUsers.find(u => u._id === selectedId);
                                        handleChange('responsibleId', selectedId);
                                        handleChange('responsibleName', selectedUser?.name || '');
                                    }}
                                >
                                    <option value="">Select an admin</option>
                                    {backofficeUsers.map(u => (
                                        <option key={u._id} value={u._id}>{u.name} ({u.role})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex items-center gap-4 pt-1">
                                <div className="flex items-center gap-1.5 text-slate-500">
                                    <Users size={14} />
                                    <span className="text-xs font-bold">{course.studentsCount || 0} Students</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-slate-500">
                                    <Layout size={14} />
                                    <span className="text-xs font-bold">{course.lessonsCount || 0} Lessons</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- MAIN TABS AREA --- */}
            <div className="flex flex-1 overflow-hidden">
                {/* Vertical Sidebar Tabs */}
                <div className="w-56 bg-white border-r border-slate-200 py-4 shrink-0 shadow-[4px_0_10px_-5px_rgba(0,0,0,0.05)]">
                    <div className="space-y-1 px-3">
                        {tabs.map(tab => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${isActive
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20 translate-x-1'
                                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                                        }`}
                                >
                                    <Icon size={18} />
                                    <span>{tab.label}</span>
                                    {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white opacity-80" />}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Content Panel */}
                <main className="flex-1 overflow-auto bg-slate-50/50 relative">
                    <div className="max-w-5xl mx-auto py-10 px-8">
                        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/50 min-h-[600px] overflow-hidden">
                            {activeTab === 'content' && <ContentTab course={course} onChange={handleChange} />}
                            {activeTab === 'description' && <DescriptionTab course={course} onChange={handleChange} />}
                            {activeTab === 'options' && <OptionsTab course={course} onChange={handleChange} />}
                            {activeTab === 'quiz' && <QuizTab course={course} onChange={handleChange} />}
                        </div>
                    </div>
                </main>
            </div>

            {/* --- MODALS --- */}
            <AddAttendeeModal
                isOpen={isAddAttendeeOpen}
                onClose={() => setIsAddAttendeeOpen(false)}
                onAdd={async (data) => {
                    try {
                        const res = await axios.post(`${API_URL}/attendees/add`, {
                            ...data,
                            courseId
                        });
                        alert(`Learner ${data.name} invited successfully!`);
                        setCourse(prev => ({ ...prev, studentsCount: (prev.studentsCount || 0) + 1 }));
                    } catch (err) {
                        alert(err.response?.data?.message || "Failed to add attendee");
                    }
                }}
            />
            <ContactAttendeesModal
                isOpen={isContactAttendeesOpen}
                onClose={() => setIsContactAttendeesOpen(false)}
                attendeesCount={course.studentsCount || 0}
                onSend={async (data) => {
                    try {
                        await axios.post(`${API_URL}/attendees/contact`, {
                            ...data,
                            courseId
                        });
                        alert(`Message sent to attendees!`);
                    } catch (err) {
                        alert("Failed to send message");
                    }
                }}
            />
        </div>
    );
}
