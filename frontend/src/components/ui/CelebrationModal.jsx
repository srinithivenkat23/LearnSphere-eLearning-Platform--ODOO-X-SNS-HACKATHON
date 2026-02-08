import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { Trophy, Star, Zap, Award, X } from 'lucide-react';

export default function CelebrationModal({ isOpen, onClose, achievement }) {
    const [showConfetti, setShowConfetti] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 5000);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {showConfetti && (
                        <Confetti
                            width={window.innerWidth}
                            height={window.innerHeight}
                            recycle={false}
                            numberOfPieces={200}
                        />
                    )}

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4"
                        onClick={onClose}
                    >
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0, y: 50 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.5, opacity: 0, y: 50 }}
                            transition={{ type: "spring", stiffness: 300, damping: 25 }}
                            onClick={(e) => e.stopPropagation()}
                            className="relative max-w-md w-full"
                        >
                            <Card className="p-8 text-center relative overflow-hidden">
                                {/* Close button */}
                                <button
                                    onClick={onClose}
                                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    <X size={24} />
                                </button>

                                {/* Animated icon */}
                                <motion.div
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                                    className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center"
                                >
                                    <Trophy size={48} className="text-white" />
                                </motion.div>

                                {/* Title */}
                                <motion.h2
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="text-3xl font-black text-slate-900 mb-2"
                                >
                                    {achievement?.title || 'Congratulations!'}
                                </motion.h2>

                                {/* Description */}
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.4 }}
                                    className="text-slate-600 mb-6"
                                >
                                    {achievement?.description || 'You\'ve earned a new achievement!'}
                                </motion.p>

                                {/* Rewards */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 }}
                                    className="flex items-center justify-center gap-6 mb-6"
                                >
                                    {achievement?.xp && (
                                        <div className="flex items-center gap-2">
                                            <Zap className="text-purple-600" size={20} />
                                            <span className="text-2xl font-black text-purple-600">+{achievement.xp} XP</span>
                                        </div>
                                    )}
                                    {achievement?.coins && (
                                        <div className="flex items-center gap-2">
                                            <Star className="text-amber-600" size={20} />
                                            <span className="text-2xl font-black text-amber-600">+{achievement.coins} Coins</span>
                                        </div>
                                    )}
                                </motion.div>

                                {/* Action button */}
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.6 }}
                                >
                                    <Button
                                        onClick={onClose}
                                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                                    >
                                        Continue Learning
                                    </Button>
                                </motion.div>
                            </Card>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
