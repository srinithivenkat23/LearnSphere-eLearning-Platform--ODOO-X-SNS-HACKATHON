import { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import {
    FileText, Image as ImageIcon, Video,
    Link as LinkIcon, Upload, HelpCircle,
    PlayCircle, BookOpen, FileDigit, X, Check
} from 'lucide-react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../lib/firebase';

const LessonEditor = ({ isOpen, onClose, onSave, lesson = null, quizzes = [] }) => {
    const [formData, setFormData] = useState({
        title: '',
        type: 'video', // video, document, image, quiz
        contentUrl: '',
        description: '',
        duration: '',
        allowDownload: false
    });
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (lesson) {
            setFormData(lesson);
        } else {
            setFormData({
                title: '',
                type: 'video',
                contentUrl: '',
                description: '',
                duration: '',
                allowDownload: false
            });
        }
    }, [lesson, isOpen]);

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        try {
            const storageRef = ref(storage, `lessons/${Date.now()}_${file.name}`);
            await uploadBytes(storageRef, file);
            const url = await getDownloadURL(storageRef);
            setFormData(prev => ({ ...prev, contentUrl: url }));
        } catch (error) {
            console.error("Upload failed", error);
            alert("Upload failed. Please check your storage rules.");
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
        onClose();
    };

    const typeOptions = [
        { id: 'video', icon: PlayCircle, color: 'text-blue-500', bg: 'bg-blue-50' },
        { id: 'document', icon: BookOpen, color: 'text-emerald-500', bg: 'bg-emerald-50' },
        { id: 'image', icon: ImageIcon, color: 'text-purple-500', bg: 'bg-purple-50' },
        { id: 'quiz', icon: HelpCircle, color: 'text-orange-500', bg: 'bg-orange-50' },
    ];

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={lesson ? "Edit Content" : "Add New Content"}>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Content Title</label>
                    <Input
                        placeholder="e.g. Introduction to React Hooks"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        required
                        className="text-lg font-bold border-slate-200 focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Content Type</label>
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
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Video URL (YouTube/Vimeo)</label>
                            <div className="relative">
                                <PlayCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                <input
                                    type="text"
                                    placeholder="https://youtube.com/watch?v=..."
                                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all"
                                    value={formData.contentUrl}
                                    onChange={(e) => setFormData({ ...formData, contentUrl: e.target.value })}
                                />
                            </div>
                        </div>
                    )}

                    {(formData.type === 'document' || formData.type === 'image') && (
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Resource File</label>
                            <div className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all ${formData.contentUrl ? 'border-emerald-200 bg-emerald-50/30' : 'border-slate-200 hover:border-blue-400 hover:bg-slate-50'}`}>
                                {formData.contentUrl ? (
                                    <div className="flex flex-col items-center">
                                        <div className="w-12 h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center mb-3">
                                            <Check size={24} />
                                        </div>
                                        <div className="text-sm font-bold text-emerald-800 break-all mb-1">Uploaded Successfully</div>
                                        <div className="text-[10px] text-emerald-600 uppercase font-bold tracking-tighter opacity-70">
                                            {formData.contentUrl.split('?')[0].split('/').pop()}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, contentUrl: '' }))}
                                            className="mt-4 text-xs font-bold text-slate-400 hover:text-red-500 transition-colors"
                                        >
                                            Remove & Upload New
                                        </button>
                                    </div>
                                ) : (
                                    <label className="cursor-pointer block group">
                                        <Upload className="mx-auto h-10 w-10 text-slate-300 mb-2 group-hover:text-blue-500 transition-colors" />
                                        <div className="text-sm font-bold text-slate-600 group-hover:text-blue-600">{uploading ? 'Processing...' : 'Drop file here or click to browse'}</div>
                                        <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-tighter">Max size: 50MB</p>
                                        <input type="file" className="hidden" onChange={handleFileUpload} accept={formData.type === 'image' ? "image/*" : ".pdf,.doc,.docx"} />
                                    </label>
                                )}
                            </div>
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
                                    {quizzes.map(q => (
                                        <option key={q.id} value={q.id}>{q.title}</option>
                                    ))}
                                </select>
                            ) : (
                                <div className="p-4 rounded-xl border border-orange-100 bg-orange-50/50 flex flex-col items-center">
                                    <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center mb-3">
                                        <HelpCircle size={20} />
                                    </div>
                                    <p className="text-xs font-bold text-orange-700 text-center mb-2">No Quizzes Found</p>
                                    <p className="text-[10px] text-orange-600 text-center mb-0 opacity-80">You need to create a quiz in the "Quiz" tab before you can link it here.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Duration (mins)</label>
                        <input
                            type="text"
                            placeholder="e.g. 15 mins"
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all"
                            value={formData.duration}
                            onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                        />
                    </div>
                </div>

                <div className="flex gap-3 pt-4">
                    <Button variant="outline" type="button" onClick={onClose} className="flex-1 h-12">Cancel</Button>
                    <Button type="submit" className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20" disabled={uploading || (formData.type === 'quiz' && !formData.contentUrl)}>
                        <Check size={18} className="mr-2" />
                        {lesson ? 'Save Content' : 'Add Content'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default LessonEditor;
