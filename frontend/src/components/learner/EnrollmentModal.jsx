import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, User, Phone, BookOpen, Briefcase, MessageSquare, CheckCircle } from 'lucide-react';
import Button from '../ui/Button';

const EnrollmentModal = ({ isOpen, onClose, onEnroll, courseTitle, isPaid, price }) => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        education: '',
        occupation: '',
        reason: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const nextStep = () => setStep(s => s + 1);
    const prevStep = () => setStep(s => s - 1);

    const handleSubmit = () => {
        onEnroll(formData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
                {/* Header */}
                <div className="p-8 pb-4 flex justify-between items-start">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 leading-tight">Enrollment Details</h2>
                        <p className="text-slate-500 text-sm mt-1">Complete your profile to join <span className="text-blue-600 font-bold">{courseTitle}</span></p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <X size={24} className="text-slate-400" />
                    </button>
                </div>

                {/* Progress Bar */}
                <div className="px-8 mb-8">
                    <div className="flex gap-2 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        {[1, 2, 3].map((s) => (
                            <div
                                key={s}
                                className={`flex-1 transition-all duration-500 rounded-full ${s <= step ? 'bg-blue-600' : 'bg-slate-200'}`}
                            />
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="px-8 pb-10 min-h-[350px] flex flex-col">
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="space-y-4">
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="text"
                                            name="fullName"
                                            placeholder="Full Name"
                                            value={formData.fullName}
                                            onChange={handleChange}
                                            className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium text-slate-900"
                                        />
                                    </div>
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="text"
                                            name="phone"
                                            placeholder="Phone Number"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium text-slate-900"
                                        />
                                    </div>
                                </div>
                                <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100/50">
                                    <p className="text-xs text-blue-700 font-bold leading-relaxed">
                                        We need your contact details to provide important course updates and certificates.
                                    </p>
                                </div>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="space-y-4">
                                    <div className="relative">
                                        <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <select
                                            name="education"
                                            value={formData.education}
                                            onChange={handleChange}
                                            className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium text-slate-900 appearance-none"
                                        >
                                            <option value="">Highest Qualification</option>
                                            <option value="High School">High School</option>
                                            <option value="Undergraduate">Undergraduate</option>
                                            <option value="Postgraduate">Postgraduate</option>
                                            <option value="PhD">PhD</option>
                                            <option value="Self-Taught">Self-Taught</option>
                                        </select>
                                    </div>
                                    <div className="relative">
                                        <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="text"
                                            name="occupation"
                                            placeholder="Current Occupation / Role"
                                            value={formData.occupation}
                                            onChange={handleChange}
                                            className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium text-slate-900"
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div
                                key="step3"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="relative">
                                    <MessageSquare className="absolute left-4 top-4 text-slate-400" size={18} />
                                    <textarea
                                        name="reason"
                                        placeholder="Why do you want to join this course?"
                                        value={formData.reason}
                                        onChange={handleChange}
                                        rows={4}
                                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium text-slate-900 resize-none"
                                    />
                                </div>
                                {isPaid && (
                                    <div className="p-6 bg-slate-900 rounded-3xl text-white shadow-xl">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Total Payable</span>
                                            <span className="text-2xl font-black">₹{price.toLocaleString()}</span>
                                        </div>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase">Includes lifetime access & global certificate</p>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Footer Actions */}
                    <div className="mt-auto flex gap-4">
                        {step > 1 && (
                            <button
                                onClick={prevStep}
                                className="p-4 bg-slate-50 text-slate-600 rounded-2xl border border-slate-100 hover:bg-slate-100 transition-all active:scale-95"
                            >
                                <ChevronLeft size={24} />
                            </button>
                        )}
                        <Button
                            className="flex-1 py-4 text-lg font-bold rounded-2xl flex items-center justify-center gap-2 group"
                            onClick={step === 3 ? handleSubmit : nextStep}
                            disabled={step === 1 ? !formData.fullName || !formData.phone : step === 2 ? !formData.education || !formData.occupation : !formData.reason}
                        >
                            {step === 3 ? (
                                <>Enroll Now <CheckCircle size={20} className="group-hover:scale-110 transition-transform" /></>
                            ) : (
                                <>Next Step <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" /></>
                            )}
                        </Button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default EnrollmentModal;
