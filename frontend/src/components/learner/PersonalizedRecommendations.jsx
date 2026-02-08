import { useState, useEffect } from 'react';
import axios from 'axios';
const API_URL = 'http://localhost:5000/api';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { Lightbulb, TrendingDown, Clock, Target, ChevronRight } from 'lucide-react';

export default function PersonalizedRecommendations({ courseId, userId }) {
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (courseId && userId) {
            fetchRecommendations();
        }
    }, [courseId, userId]);

    const fetchRecommendations = async () => {
        try {
            const response = await axios.get(`${API_URL}/progress/${courseId}/recommendations?userId=${userId}`);
            setRecommendations(response.data.recommendations || []);
        } catch (error) {
            console.error('Error fetching recommendations:', error);
        } finally {
            setLoading(false);
        }
    };

    const getPriorityColor = (priority) => {
        if (priority >= 4) return 'red';
        if (priority >= 3) return 'amber';
        return 'blue';
    };

    const getReasonIcon = (reason) => {
        switch (reason) {
            case 'weak_performance': return TrendingDown;
            case 'not_practiced': return Clock;
            default: return Lightbulb;
        }
    };

    if (loading) {
        return (
            <Card className="p-6">
                <div className="animate-pulse space-y-3">
                    <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                    <div className="h-16 bg-slate-200 rounded"></div>
                </div>
            </Card>
        );
    }

    if (recommendations.length === 0) {
        return (
            <Card className="p-6 text-center">
                <Target size={40} className="mx-auto text-slate-300 mb-3" />
                <p className="text-sm text-slate-500">You're doing great! Keep learning to get personalized recommendations.</p>
            </Card>
        );
    }

    return (
        <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
                <Lightbulb className="text-purple-600" size={24} />
                <h3 className="text-xl font-bold text-slate-900">Recommended For You</h3>
            </div>

            <div className="space-y-3">
                {recommendations.map((rec, index) => {
                    const Icon = getReasonIcon(rec.reason);
                    const color = getPriorityColor(rec.priority);

                    return (
                        <div
                            key={index}
                            className={`p-4 rounded-xl border-2 border-${color}-100 bg-${color}-50/30 hover:bg-${color}-50 transition-colors cursor-pointer group`}
                        >
                            <div className="flex items-start gap-3">
                                <div className={`w-10 h-10 rounded-full bg-${color}-100 flex items-center justify-center shrink-0`}>
                                    <Icon className={`text-${color}-600`} size={18} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-slate-900 mb-1">{rec.topic}</h4>
                                    <p className="text-sm text-slate-600 leading-relaxed">{rec.message}</p>
                                </div>
                                <ChevronRight className="text-slate-400 group-hover:text-slate-600 transition-colors shrink-0" size={20} />
                            </div>
                        </div>
                    );
                })}
            </div>

            <Button className="w-full mt-4" variant="outline">
                View All Recommendations
            </Button>
        </Card>
    );
}
