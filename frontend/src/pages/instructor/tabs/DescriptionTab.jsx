import Input from '../../../components/ui/Input';

export default function DescriptionTab({ course, onChange }) {
    return (
        <div className="p-8 space-y-8 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Short Description</label>
                        <p className="text-xs text-slate-500 mb-3">This appears in the course catalog cards.</p>
                        <textarea
                            rows={4}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                            value={course.shortDescription || ''}
                            onChange={(e) => onChange('shortDescription', e.target.value)}
                            placeholder="A brief overview of the course..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Website URL</label>
                        <Input
                            placeholder="e.g. https://yoursite.com/course"
                            value={course.websiteUrl || ''}
                            onChange={(e) => onChange('websiteUrl', e.target.value)}
                            required={course.published}
                        />
                        <p className="mt-2 text-[10px] text-slate-400">Required when the course is published.</p>
                    </div>
                </div>

                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Long Description / Syllabus</label>
                        <p className="text-xs text-slate-500 mb-3">The full course details shown on the detail page.</p>
                        <textarea
                            rows={10}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                            value={course.description || ''}
                            onChange={(e) => onChange('description', e.target.value)}
                            placeholder="Detailed course curriculum and learning objectives..."
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
