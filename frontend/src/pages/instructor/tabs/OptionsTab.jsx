import { useState, useEffect } from 'react';
import axios from 'axios';
import Input from '../../../components/ui/Input';
const API_URL = 'http://localhost:5000/api';

export default function OptionsTab({ course, onChange }) {
    const [backofficeUsers, setBackofficeUsers] = useState([]);

    useEffect(() => {
        fetchBackofficeUsers();
    }, []);

    const fetchBackofficeUsers = async () => {
        try {
            const response = await axios.get(`${API_URL}/users/backoffice-users`);
            setBackofficeUsers(response.data || []);
        } catch (err) {
            console.error("Error fetching backoffice users:", err);
        }
    };

    return (
        <div className="p-8 space-y-8 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-6">
                    <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">Access & Pricing</h3>

                    <div className="space-y-4">
                        <label className="block">
                            <span className="text-sm font-medium text-slate-700">Access Rule</span>
                            <select
                                value={course.accessRule || 'open'}
                                onChange={(e) => onChange('accessRule', e.target.value)}
                                className="mt-1 w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                                <option value="open">Open (Free for all)</option>
                                <option value="invitation">On Invitation</option>
                                <option value="payment">On Payment</option>
                            </select>
                        </label>

                        {course.accessRule === 'payment' && (
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
                    <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">Visibility & Ownership</h3>

                    <div className="space-y-4">
                        <label className="block">
                            <span className="text-sm font-medium text-slate-700">Show course to</span>
                            <select
                                value={course.visibility || 'everyone'}
                                onChange={(e) => onChange('visibility', e.target.value)}
                                className="mt-1 w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                                <option value="everyone">Everyone</option>
                                <option value="signed-in">Signed In</option>
                            </select>
                        </label>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Course Admin / Responsible</label>
                            <select
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none bg-white text-sm"
                                value={course.responsibleId || ''}
                                onChange={(e) => {
                                    const selectedId = e.target.value;
                                    const selectedUser = backofficeUsers.find(u => u._id === selectedId);
                                    onChange('responsibleId', selectedId);
                                    onChange('responsibleName', selectedUser?.name || '');
                                }}
                            >
                                <option value="">Select course admin</option>
                                {backofficeUsers.map(u => (
                                    <option key={u._id} value={u._id}>{u.name} ({u.role})</option>
                                ))}
                            </select>
                        </div>

                        <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                            <div className="flex gap-3">
                                <span className="text-blue-600 text-lg">💡</span>
                                <p className="text-xs text-blue-800 leading-relaxed">
                                    Visibility decides who can see the course in the catalog.
                                    Access rules decide who can actually start learning.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
