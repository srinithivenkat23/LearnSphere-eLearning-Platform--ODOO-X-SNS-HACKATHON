import { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import {
    FileText, Image as ImageIcon, Video,
    Link as LinkIcon, Upload, HelpCircle,
    PlayCircle, BookOpen, FileDigit, X, Check, Layout, Loader2
} from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

const LessonEditor = ({ isOpen, onClose, onSave, lesson = null, quizzes = [] }) => {
    const [activeTab, setActiveTab] = useState('content');
    const [backofficeUsers, setBackofficeUsers] = useState([]);
    const [formData, setFormData] = useState({
        title: '',
        type: 'video', // video, document, image, quiz
        contentUrl: '',
        description: '',
        duration: '',
        responsibleId: '',
        responsibleName: '',
        allowDownload: false,
        attachments: []
    });
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchBackofficeUsers();
            if (lesson) {
                setFormData({
                    ...lesson,
                    attachments: lesson.attachments || []
                });
            } else {
                setFormData({
                    title: '',
                    type: 'video',
                    contentUrl: '',
                    description: '',
                    duration: '',
                    responsibleId: '',
                    responsibleName: '',
                    allowDownload: false,
                    attachments: []
                });
            }
            setActiveTab('content');
        }
    }, [lesson, isOpen]);

    const fetchBackofficeUsers = async () => {
        try {
            const response = await axios.get(`${API_URL}/users/backoffice-users`);
            setBackofficeUsers(response.data || []);
        } catch (err) {
            console.error("Error fetching backoffice users:", err);
        }
    };

    const handleFileUpload = async (e, type, attachmentIndex = null) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        const formDataUpload = new FormData();
        formDataUpload.append('file', file);

        try {
            let response;

            // Choose the correct upload function based on type
            if (type === 'video') {
                // For main lesson video
                const { uploadLessonVideo } = await import('../../services/uploadAPI');
                response = await uploadLessonVideo(file);
            } else if (type === 'document') {
                // For main lesson document
                const { uploadLessonDocument } = await import('../../services/uploadAPI');
                response = await uploadLessonDocument(file);
            } else if (type === 'image') {
                // For main lesson image (not currently supported in API but can use generic or add one)
                // For now, let's use course image upload as a fallback or add a generic file upload
                // NOTE: Using course image upload might put it in course folder, but it works for now. 
                // Better approach: Add lesson-image endpoint. For now, assuming generic file upload or course-image
                const { uploadCourseImage } = await import('../../services/uploadAPI');
                response = await uploadCourseImage(file);
            } else if (type === 'file' || attachmentIndex !== null) {
                // For attachments (files/images)
                // If it's an attachment, we can use the document upload as it's the most generic 'file' storage
                const { uploadLessonDocument } = await import('../../services/uploadAPI'); // Re-using document upload for attachments
                response = await uploadLessonDocument(file);
            } else {
                // Fallback for unknown types
                throw new Error("Unsupported file type");
            }

            // Standardize response format if needed, but API usually returns { url: ... }
            const fileUrl = response.url || response.data?.url;

            if (fileUrl) {
                if (attachmentIndex !== null) {
                    updateAttachment(attachmentIndex, 'url', fileUrl);
                    if (!formData.attachments[attachmentIndex].name) {
                        updateAttachment(attachmentIndex, 'name', file.name);
                    }
                } else {
                    setFormData(prev => ({ ...prev, contentUrl: fileUrl }));
                }
            }
        } catch (err) {
            console.error("Upload error:", err);
            alert("Upload failed. Please try again.");
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
        onClose();
    };

    const addAttachment = (type) => {
        setFormData(prev => ({
            ...prev,
            attachments: [...prev.attachments, { name: '', url: '', type }]
        }));
    };

    const updateAttachment = (index, field, value) => {
        const newAttachments = [...formData.attachments];
        newAttachments[index][field] = value;
        setFormData({ ...formData, attachments: newAttachments });
    };

    const removeAttachment = (index) => {
        setFormData({
            ...formData,
            attachments: formData.attachments.filter((_, i) => i !== index)
        });
    };

    const typeOptions = [
        { id: 'video', icon: PlayCircle, color: 'text-blue-500', bg: 'bg-blue-50' },
        { id: 'document', icon: BookOpen, color: 'text-emerald-500', bg: 'bg-emerald-50' },
        { id: 'image', icon: ImageIcon, color: 'text-purple-500', bg: 'bg-purple-50' },
        { id: 'quiz', icon: HelpCircle, color: 'text-orange-500', bg: 'bg-orange-50' },
    ];

    const tabs = [
        { id: 'content', label: 'Content', icon: Layout },
        { id: 'description', label: 'Description', icon: FileText },
        { id: 'attachments', label: 'Attachments', icon: LinkIcon },
    ];

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={lesson ? "Edit Content" : "Add New Content"} maxWidth="max-w-3xl">
            <div className="flex border-b border-slate-100 mb-6">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest transition-all border-b-2 ${activeTab === tab.id ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {activeTab === 'content' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Lesson Title *</label>
                            <Input
                                placeholder="e.g. Introduction to React Hooks"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                required
                                className="text-lg font-bold border-slate-200 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Lesson Type</label>
                            <div className="grid grid-cols-4 gap-2">
                                {typeOptions.map(opt => {
                                    const Icon = opt.icon;
                                    const isActive = formData.type === opt.id;
                                    return (
                                        <button
                                            key={opt.id}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, type: opt.id, contentUrl: '' })}
                                            className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all ${isActive
                                                ? `border-blue-500 bg-blue-50 ${opt.color}`
                                                : 'border-slate-100 bg-white text-slate-400 hover:border-slate-200'
                                                }`}
                                        >
                                            <Icon size={24} className="mb-1" />
                                            <span className="text-[10px] font-bold uppercase tracking-tighter">{opt.id}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="space-y-4">
                            {formData.type === 'video' && (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Video URL (YouTube/Google Drive)</label>
                                        <div className="relative">
                                            <PlayCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                            <input
                                                type="text"
                                                placeholder="https://youtube.com/watch?v=..."
                                                className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all"
                                                value={formData.contentUrl}
                                                onChange={(e) => setFormData({ ...formData, contentUrl: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Duration</label>
                                        <Input
                                            placeholder="e.g. 15:00"
                                            value={formData.duration}
                                            onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                        />
                                    </div>
                                </div>
                            )}

                            {(formData.type === 'document' || formData.type === 'image') && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                                            {formData.type === 'image' ? 'Image' : 'Document'} URL / Upload
                                        </label>
                                        <div className="relative group">
                                            <label className="w-full p-8 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 flex flex-col items-center justify-center group-hover:bg-white group-hover:border-blue-400 transition-all cursor-pointer">
                                                {uploading ? (
                                                    <Loader2 className="animate-spin text-blue-500 mb-2" size={32} />
                                                ) : (
                                                    <Upload className="text-slate-300 mb-2" size={32} />
                                                )}
                                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center">
                                                    {uploading ? 'Uploading your file...' : `Select ${formData.type} or drop here`}
                                                </span>
                                                <input
                                                    type="file"
                                                    className="hidden"
                                                    onChange={(e) => handleFileUpload(e, formData.type)}
                                                    accept={formData.type === 'image' ? "image/*" : ".pdf,.docx,.doc,.zip,.ppt,.pptx"}
                                                    disabled={uploading}
                                                />
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="Or paste public URL here..."
                                                className="mt-4 w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all"
                                                value={formData.contentUrl}
                                                onChange={(e) => setFormData({ ...formData, contentUrl: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <label className="flex items-center gap-3 p-4 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer w-fit">
                                        <input
                                            type="checkbox"
                                            checked={formData.allowDownload}
                                            onChange={(e) => setFormData({ ...formData, allowDownload: e.target.checked })}
                                            className="rounded text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="text-sm font-bold text-slate-700">Allow Download</span>
                                    </label>
                                </div>
                            )}

                            {formData.type === 'quiz' && (
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Link Knowledge Check</label>
                                    {quizzes.length > 0 ? (
                                        <select
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-bold text-slate-700 bg-slate-50"
                                            value={formData.contentUrl}
                                            onChange={(e) => setFormData({ ...formData, contentUrl: e.target.value })}
                                            required
                                        >
                                            <option value="">Choose a quiz...</option>
                                            {quizzes.map(q => {
                                                const quizId = q._id || q.id;
                                                return (
                                                    <option key={quizId} value={quizId}>{q.title}</option>
                                                );
                                            })}
                                        </select>
                                    ) : (
                                        <div className="p-4 rounded-xl border border-orange-100 bg-orange-50/50 flex flex-col items-center">
                                            <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center mb-3">
                                                <HelpCircle size={20} />
                                            </div>
                                            <p className="text-xs font-bold text-orange-700 text-center mb-2">No Quizzes Found</p>
                                            <p className="text-[10px] text-orange-600 text-center mb-0 opacity-80">You need to create a quiz in the "Quiz" tab first.</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Responsible (Optional)</label>
                            <select
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white"
                                value={formData.responsibleId || ''}
                                onChange={(e) => {
                                    const selectedId = e.target.value;
                                    const selectedUser = backofficeUsers.find(u => u._id === selectedId);
                                    setFormData({
                                        ...formData,
                                        responsibleId: selectedId,
                                        responsibleName: selectedUser?.name || ''
                                    });
                                }}
                            >
                                <option value="">Select a responsible person</option>
                                {backofficeUsers.map(u => (
                                    <option key={u._id} value={u._id}>{u.name} ({u.role})</option>
                                ))}
                            </select>
                        </div>
                    </div>
                )}

                {activeTab === 'description' && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Lesson Description</label>
                        <textarea
                            rows={12}
                            placeholder="Provide details about what learners will achieve in this lesson..."
                            className="w-full px-4 py-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>
                )}

                {activeTab === 'attachments' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                        <div className="flex items-center justify-between mb-2">
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Additional Resources</label>
                            <div className="flex gap-2">
                                <Button size="sm" variant="outline" type="button" onClick={() => addAttachment('file')}>
                                    <Upload size={14} className="mr-2" /> Add File
                                </Button>
                                <Button size="sm" variant="outline" type="button" onClick={() => addAttachment('link')}>
                                    <LinkIcon size={14} className="mr-2" /> Add Link
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {formData.attachments?.length === 0 ? (
                                <div className="p-12 border-2 border-dashed border-slate-100 rounded-[2rem] flex flex-col items-center justify-center text-slate-300">
                                    <FileDigit size={48} className="mb-4 opacity-50" />
                                    <p className="text-sm font-bold uppercase tracking-widest">No attachments</p>
                                    <p className="text-xs">Add resources like PDFs, ZIPs, or external articles.</p>
                                </div>
                            ) : (
                                formData.attachments.map((att, idx) => (
                                    <div key={idx} className="flex gap-3 items-start p-4 bg-slate-50 rounded-2xl border border-slate-100 relative group">
                                        <div className="flex-1 space-y-3">
                                            <Input
                                                placeholder="Attachment Name (e.g. Cheat Sheet PDF)"
                                                value={att.name}
                                                onChange={(e) => updateAttachment(idx, 'name', e.target.value)}
                                                className="h-10 text-sm font-bold"
                                            />
                                            <div className="relative">
                                                {att.type === 'file' ? (
                                                    <label className="flex items-center gap-2 p-3 bg-white border border-slate-200 rounded-xl cursor-pointer hover:border-blue-400 transition-colors">
                                                        {uploading ? <Loader2 size={14} className="animate-spin text-blue-500" /> : <Upload className="text-slate-400" size={14} />}
                                                        <span className="text-[10px] font-bold text-slate-500 uppercase flex-1 truncate">
                                                            {att.url ? att.url.split('/').pop() : "Choose file to upload..."}
                                                        </span>
                                                        <input
                                                            type="file"
                                                            className="hidden"
                                                            onChange={(e) => handleFileUpload(e, 'file', idx)}
                                                            disabled={uploading}
                                                        />
                                                    </label>
                                                ) : (
                                                    <>
                                                        <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                                                        <input
                                                            type="text"
                                                            placeholder="https://..."
                                                            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                                                            value={att.url}
                                                            onChange={(e) => updateAttachment(idx, 'url', e.target.value)}
                                                        />
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeAttachment(idx)}
                                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <X size={18} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                <div className="flex gap-3 pt-6 border-t border-slate-100">
                    <Button variant="outline" type="button" onClick={onClose} className="flex-1 h-12 rounded-xl">Cancel</Button>
                    <Button type="submit" className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-500/20 rounded-xl" disabled={uploading || (formData.type === 'quiz' && !formData.contentUrl)}>
                        <Check size={18} className="mr-2" />
                        {lesson ? 'Update Content' : 'Create Content'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default LessonEditor;
