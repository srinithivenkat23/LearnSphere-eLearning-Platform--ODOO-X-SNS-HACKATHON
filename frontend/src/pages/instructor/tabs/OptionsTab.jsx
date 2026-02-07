import Input from '../../../components/ui/Input';

export default function OptionsTab({ course, onChange }) {
    return (
        <div className="p-8 space-y-8 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-6">
                    <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">Access & Pricing</h3>

                    <div className="space-y-4">
                        <label className="block">
                            <span className="text-sm font-medium text-slate-700">Enrollment Policy</span>
                            <select
                                value={course.accessRule || 'open'}
                                onChange={(e) => onChange('accessRule', e.target.value)}
                                className="mt-1 w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                                <option value="open">Open (Free for all)</option>
                                <option value="invite">By Invitation Only</option>
                                <option value="paid">Paid Access</option>
                            </select>
                        </label>

                        {course.accessRule === 'paid' && (
                            <div className="animate-fade-in-up">
                                <Input
                                    label="Price ($)"
                                    type="number"
                                    min="0"
                                    value={course.price || 0}
                                    onChange={(e) => onChange('price', parseFloat(e.target.value))}
                                />
                            </div>
                        )}
                    </div>

                    <div className="pt-4 space-y-3">
                        <label className="flex items-start gap-3 p-4 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer">
                            <input
                                type="checkbox"
                                checked={course.showStudentsCount || false}
                                onChange={(e) => onChange('showStudentsCount', e.target.checked)}
                                className="mt-1 rounded text-blue-600 focus:ring-blue-500"
                            />
                            <div>
                                <span className="block text-sm font-bold text-slate-900">Show Students Count</span>
                                <span className="text-xs text-slate-500">Learners can see how many others are enrolled.</span>
                            </div>
                        </label>

                        <label className="flex items-start gap-3 p-4 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer">
                            <input
                                type="checkbox"
                                checked={course.allowReviews || true}
                                onChange={(e) => onChange('allowReviews', e.target.checked)}
                                className="mt-1 rounded text-blue-600 focus:ring-blue-500"
                            />
                            <div>
                                <span className="block text-sm font-bold text-slate-900">Allow Reviews</span>
                                <span className="text-xs text-slate-500">Enable students to leave ratings and feedback.</span>
                            </div>
                        </label>
                    </div>
                </div>

                <div className="space-y-6">
                    <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">Visibility Settings</h3>

                    <div className="space-y-4">
                        <label className="block">
                            <span className="text-sm font-medium text-slate-700">Course Visibility</span>
                            <select
                                value={course.visibility || 'public'}
                                onChange={(e) => onChange('visibility', e.target.value)}
                                className="mt-1 w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                                <option value="public">Public (Visible in Catalog)</option>
                                <option value="hidden">Hidden (Link access only)</option>
                                <option value="private">Private (Invite only)</option>
                            </select>
                        </label>

                        <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                            <div className="flex gap-3">
                                <span className="text-blue-600 text-lg">💡</span>
                                <p className="text-xs text-blue-800 leading-relaxed">
                                    Public courses are indexed by search engines and shown on the home page.
                                    Protected courses require a password or invitation.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
