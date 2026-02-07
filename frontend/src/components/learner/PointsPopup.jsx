import { useEffect, useState } from 'react';
import { Trophy, Star, ArrowUpRight, X } from 'lucide-react';

export default function PointsPopup({ points, nextRank, progress, show, onClose }) {
    if (!show) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl relative overflow-hidden text-center animate-fade-in-up">
                {/* Background Sparkles (Simplified) */}
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500" />

                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
                >
                    <X size={24} />
                </button>

                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mx-auto mb-6 shadow-lg shadow-blue-500/20">
                    <Trophy size={40} />
                </div>

                <h2 className="text-2xl font-bold text-slate-900 mb-2">Awesome Work!</h2>
                <div className="text-4xl font-black text-blue-600 mb-2 flex items-center justify-center gap-2">
                    +{points} <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Points</span>
                </div>

                <p className="text-slate-500 mb-8 text-sm leading-relaxed">
                    You're getting closer to your goal. Keep going to reach the next level!
                </p>

                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                            <Star size={10} className="text-amber-400" /> Progress to {nextRank}
                        </span>
                        <span className="text-xs font-bold text-blue-600">{progress}%</span>
                    </div>
                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                            style={{ width: `${progress}%` }}
                            className="h-full bg-blue-600 transition-all duration-1000 ease-out"
                        />
                    </div>
                </div>

                <Button
                    onClick={onClose}
                    className="w-full mt-8 font-bold h-12 shadow-lg shadow-blue-500/20"
                >
                    Keep Learning <ArrowUpRight size={18} className="ml-2" />
                </Button>
            </div>
        </div>
    );
}

// Minimal Button internal fallback if needed, but better to use the UI component
function Button({ children, onClick, className = "" }) {
    return (
        <button
            onClick={onClick}
            className={`px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all flex items-center justify-center ${className}`}
        >
            {children}
        </button>
    );
}
