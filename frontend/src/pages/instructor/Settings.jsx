import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db, auth } from '../../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import { User, Mail, Shield, Bell, CreditCard, Save } from 'lucide-react';

export default function InstructorSettings() {
    const { userData, user } = useAuth();
    const [activeSection, setActiveSection] = useState('profile'); // 'profile', 'security', 'notifications', 'payouts'
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: userData?.name || '',
        email: user?.email || '',
        bio: userData?.bio || '',
        notifications: true
    });

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const userRef = doc(db, 'users', user.uid);
            await updateDoc(userRef, {
                name: formData.name,
                bio: formData.bio,
                updatedAt: new Date()
            });
            alert("Settings updated successfully!");
        } catch (err) {
            console.error(err);
            alert("Failed to update settings");
        } finally {
            setSaving(false);
        }
    };

    const navItems = [
        { id: 'profile', label: 'Public Profile', icon: User },
        { id: 'security', label: 'Account Security', icon: Shield },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'payouts', label: 'Payout Methods', icon: CreditCard },
    ];

    return (
        <div className="p-8 max-w-4xl mx-auto animate-fade-in">
            <div className="mb-10">
                <h1 className="text-3xl font-bold text-slate-900">Studio Settings</h1>
                <p className="text-slate-500 mt-1">Manage your professional profile and account preferences.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Navigation */}
                <div className="lg:col-span-1 space-y-2">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeSection === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => setActiveSection(item.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all border ${isActive
                                    ? 'bg-blue-50 text-blue-600 border-blue-100 shadow-sm'
                                    : 'text-slate-500 hover:bg-slate-50 border-transparent'
                                    }`}
                            >
                                <Icon size={18} /> {item.label}
                            </button>
                        );
                    })}
                </div>

                {/* Content Area */}
                <div className="lg:col-span-2">
                    <Card className="p-8">
                        {activeSection === 'profile' && (
                            <form onSubmit={handleSave} className="space-y-6 animate-fade-in-up">
                                <div className="flex items-center gap-6 mb-8">
                                    <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200 shadow-inner">
                                        <User size={40} />
                                    </div>
                                    <div>
                                        <Button variant="outline" size="sm" type="button">Change Avatar</Button>
                                        <p className="text-[10px] text-slate-400 mt-2">JPG, GIF or PNG. Max size of 800K</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Input
                                        label="Display Name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                    <Input
                                        label="Account Email"
                                        value={formData.email}
                                        disabled
                                        className="bg-slate-50 cursor-not-allowed"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Short Bio</label>
                                    <textarea
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                        rows={4}
                                        placeholder="Tell students about yourself..."
                                        value={formData.bio}
                                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                    />
                                </div>

                                <div className="pt-6 border-t border-slate-100 flex justify-end">
                                    <Button type="submit" disabled={saving} className="px-8 flex items-center gap-2">
                                        <Save size={18} />
                                        {saving ? 'Saving...' : 'Save Changes'}
                                    </Button>
                                </div>
                            </form>
                        )}

                        {activeSection === 'security' && (
                            <div className="space-y-8 animate-fade-in-up">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 mb-4">Password Management</h3>
                                    <div className="space-y-4 max-w-md">
                                        <Input label="Current Password" type="password" placeholder="••••••••" />
                                        <Input label="New Password" type="password" placeholder="••••••••" />
                                        <Input label="Confirm New Password" type="password" placeholder="••••••••" />
                                        <Button className="mt-2">Update Password</Button>
                                    </div>
                                </div>
                                <div className="pt-8 border-t border-slate-100">
                                    <h3 className="text-lg font-bold text-slate-900 mb-4">Two-Factor Authentication</h3>
                                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                                        <div>
                                            <p className="font-bold text-sm text-slate-900">Authenticator App</p>
                                            <p className="text-xs text-slate-500">Secure your account using TOTP apps.</p>
                                        </div>
                                        <Button variant="outline" size="sm">Enable</Button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeSection === 'notifications' && (
                            <div className="space-y-6 animate-fade-in-up">
                                <h3 className="text-lg font-bold text-slate-900 mb-4">Email Notifications</h3>
                                <div className="space-y-4">
                                    {[
                                        { label: 'New Student Enrollment', desc: 'Notify me when a student joins a course.' },
                                        { label: 'Course Reviews', desc: 'Notify me when a student leaves a rating.' },
                                        { label: 'Instructor Announcements', desc: 'Stay updated with platform news and tools.' },
                                        { label: 'Direct Messages', desc: 'Notify me when students ask questions.' }
                                    ].map((item, i) => (
                                        <label key={i} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors">
                                            <div>
                                                <p className="font-bold text-sm text-slate-900">{item.label}</p>
                                                <p className="text-xs text-slate-500">{item.desc}</p>
                                            </div>
                                            <input type="checkbox" defaultChecked className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500" />
                                        </label>
                                    ))}
                                </div>
                                <div className="pt-6 flex justify-end">
                                    <Button className="px-8">Save Preferences</Button>
                                </div>
                            </div>
                        )}

                        {activeSection === 'payouts' && (
                            <div className="space-y-6 animate-fade-in-up">
                                <h3 className="text-lg font-bold text-slate-900 mb-4">Payout Configuration</h3>
                                <Card className="bg-slate-900 text-white p-6 border-0 shadow-xl overflow-hidden relative">
                                    <div className="relative z-10">
                                        <div className="flex justify-between items-start mb-8">
                                            <CreditCard size={32} className="text-blue-400" />
                                            <span className="text-xs font-bold bg-white/10 px-2 py-1 rounded">Active</span>
                                        </div>
                                        <p className="text-xl font-mono tracking-widest mb-2">•••• •••• •••• 5492</p>
                                        <div className="flex justify-between items-end">
                                            <div>
                                                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Card Holder</p>
                                                <p className="text-sm font-bold">{formData.name || 'Instructor'}</p>
                                            </div>
                                            <p className="text-xs font-bold">EXP 12/28</p>
                                        </div>
                                    </div>
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/20 blur-3xl -mr-16 -mt-16 rounded-full"></div>
                                </Card>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Button variant="outline" className="w-full">Update Payment Info</Button>
                                    <Button variant="outline" className="w-full">View Payout History</Button>
                                </div>

                                <div className="p-4 bg-orange-50 border border-orange-100 rounded-xl">
                                    <p className="text-xs text-orange-800 leading-relaxed font-medium">
                                        <strong>Note:</strong> Payouts are processed on the 1st of every month for earnings exceeding $50.00.
                                    </p>
                                </div>
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </div>
    );
}
