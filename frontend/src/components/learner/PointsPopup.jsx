import React, { useEffect, useState } from 'react';
import { Award, Star, X, TrendingUp } from 'lucide-react';
import Button from '../ui/Button';

export default function PointsPopup({ show, points, nextRank, progress, onClose }) {
    if (!show) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-8 duration-500">
                <div className="relative p-8 text-center">
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <X size={20} />
                    </button>

                    <div className="w-24 h-24 bg-blue-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-500/20 rotate-12">
                        <Award size={48} className="text-white -rotate-12" />
                    </div>

                    <h2 className="text-3xl font-black text-slate-900 mb-2">+{points} Points!</h2>
                    <p className="text-slate-500 font-medium mb-8">Amazing progress, learner!</p>

                    <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Next Rank: {nextRank}</span>
                            <span className="text-xs font-bold text-blue-600">{progress}%</span>
                        </div>

                        <div className="h-3 bg-slate-200 rounded-full overflow-hidden mb-2">
                            <div
                                className="h-full bg-blue-500 transition-all duration-1000 ease-out"
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>

                        <p className="text-[10px] text-slate-400 flex items-center justify-center gap-1 mt-3">
                            <TrendingUp size={10} /> {100 - progress}% more to rank up
                        </p>
                    </div>

                    <div className="mt-8 flex flex-col gap-3">
                        <Button size="lg" className="w-full h-14 rounded-2xl text-lg font-bold" onClick={onClose}>
                            Awesome!
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
