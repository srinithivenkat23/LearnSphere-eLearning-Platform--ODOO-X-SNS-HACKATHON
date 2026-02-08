import { useState, useEffect } from 'react';
import axios from 'axios';
const API_URL = 'http://localhost:5000/api';
import { useAuth } from '../../context/AuthContext';
import Card from '../ui/Card';
import { Award, Trophy, Star, Zap, Crown, Shield, Medal, Flame } from 'lucide-react';

export default function AchievementBadges() {
    const { userData } = useAuth();
    const [achievements, setAchievements] = useState(null);
    const [showBadgeModal, setShowBadgeModal] = useState(false);
    const [selectedBadge, setSelectedBadge] = useState(null);

    useEffect(() => {
        if (userData) {
            fetchAchievements();
        }
    }, [userData]);

    const fetchAchievements = async () => {
        try {
            const response = await axios.get(`${API_URL}/achievements/${userData._id}`);
            setAchievements(response.data);
        } catch (error) {
            console.error('Error fetching achievements:', error);
        }
    };

    const getBadgeIcon = (icon) => {
        const icons = {
            trophy: Trophy,
            star: Star,
            zap: Zap,
            crown: Crown,
            shield: Shield,
            medal: Medal,
            flame: Flame,
            award: Award
        };
        return icons[icon] || Award;
    };

    const getCategoryColor = (category) => {
        switch (category) {
            case 'milestone': return 'blue';
            case 'streak': return 'orange';
            case 'performance': return 'emerald';
            case 'social': return 'purple';
            default: return 'slate';
        }
    };

    if (!achievements) {
        return (
            <Card className="p-6">
                <div className="animate-pulse space-y-3">
                    <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                    <div className="grid grid-cols-4 gap-3">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-16 bg-slate-200 rounded-xl"></div>
                        ))}
                    </div>
                </div>
            </Card>
        );
    }

    return (
        <>
            <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-xl font-bold text-slate-900">Achievements</h3>
                        <p className="text-sm text-slate-500">{achievements.badges.length} badges earned</p>
                    </div>
                    <div className="text-right">
                        <p className="text-2xl font-black text-amber-600">{achievements.coins}</p>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Coins</p>
                    </div>
                </div>

                {/* Level Progress */}
                <div className="mb-6 p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-bold opacity-90">Level {achievements.level}</span>
                        <span className="text-sm font-bold opacity-90">{achievements.xp} XP</span>
                    </div>
                    <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-white transition-all duration-500"
                            style={{ width: `${(achievements.xp % 100)}%` }}
                        />
                    </div>
                    <p className="text-xs mt-2 opacity-75">{100 - (achievements.xp % 100)} XP to Level {achievements.level + 1}</p>
                </div>

                {/* Badges Grid */}
                {achievements.badges.length > 0 ? (
                    <div className="grid grid-cols-4 gap-3">
                        {achievements.badges.slice(0, 8).map((badge, index) => {
                            const Icon = getBadgeIcon(badge.icon);
                            const color = getCategoryColor(badge.category);

                            return (
                                <button
                                    key={index}
                                    onClick={() => {
                                        setSelectedBadge(badge);
                                        setShowBadgeModal(true);
                                    }}
                                    className={`p-3 rounded-xl bg-${color}-50 hover:bg-${color}-100 transition-all group relative`}
                                >
                                    <Icon className={`text-${color}-600 mx-auto group-hover:scale-110 transition-transform`} size={24} />
                                    <p className="text-[8px] font-bold text-slate-600 mt-1 truncate">{badge.name}</p>
                                </button>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <Award size={40} className="mx-auto text-slate-300 mb-2" />
                        <p className="text-sm text-slate-500">Complete activities to earn badges!</p>
                    </div>
                )}

                {achievements.badges.length > 8 && (
                    <button className="w-full mt-4 text-sm font-bold text-blue-600 hover:text-blue-700">
                        View All {achievements.badges.length} Badges →
                    </button>
                )}
            </Card>

            {/* Badge Detail Modal */}
            {showBadgeModal && selectedBadge && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
                    <Card className="max-w-md w-full p-8 text-center relative">
                        <button
                            onClick={() => setShowBadgeModal(false)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
                        >
                            ✕
                        </button>

                        <div className={`w-24 h-24 rounded-full bg-${getCategoryColor(selectedBadge.category)}-100 flex items-center justify-center mx-auto mb-4`}>
                            {(() => {
                                const Icon = getBadgeIcon(selectedBadge.icon);
                                return <Icon className={`text-${getCategoryColor(selectedBadge.category)}-600`} size={48} />;
                            })()}
                        </div>

                        <h3 className="text-2xl font-black text-slate-900 mb-2">{selectedBadge.name}</h3>
                        <p className="text-slate-600 mb-4">{selectedBadge.description}</p>
                        <p className="text-xs text-slate-400">
                            Earned on {new Date(selectedBadge.earnedAt).toLocaleDateString()}
                        </p>
                    </Card>
                </div>
            )}
        </>
    );
}
