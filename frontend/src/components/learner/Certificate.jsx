import React from 'react';
import { Award, Trophy, ShieldCheck, Download, Printer, X } from 'lucide-react';

export default function Certificate({ isOpen, onClose, userName, courseTitle, date }) {
    if (!isOpen) return null;

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/90 backdrop-blur-md p-4 sm:p-8 animate-in fade-in duration-300">
            <div className="absolute top-8 right-8 flex gap-4 no-print">
                <button
                    onClick={handlePrint}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-xl shadow-blue-500/20"
                >
                    <Download size={20} /> Download PDF
                </button>
                <button
                    onClick={onClose}
                    className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all"
                >
                    <X size={24} />
                </button>
            </div>

            {/* Certificate Template */}
            <div className="bg-white w-full max-w-[1000px] aspect-[1.414/1] shadow-2xl relative overflow-hidden border-[16px] border-slate-900 ring-2 ring-slate-200/50 print:shadow-none print:border-slate-900 print:m-0">
                {/* Decorative Elements */}
                <div className="absolute top-0 left-0 w-64 h-64 bg-blue-50 rounded-br-full -translate-x-32 -translate-y-32"></div>
                <div className="absolute bottom-0 right-0 w-64 h-64 bg-slate-50 rounded-tl-full translate-x-32 translate-y-32"></div>

                {/* Corner Accents */}
                <div className="absolute top-10 left-10 w-20 h-20 border-t-4 border-l-4 border-slate-200"></div>
                <div className="absolute bottom-10 right-10 w-20 h-20 border-b-4 border-r-4 border-slate-200"></div>

                <div className="h-full flex flex-col items-center justify-center text-center p-12 sm:p-24 relative z-10">
                    <div className="mb-12">
                        <div className="w-24 h-24 bg-slate-900 rounded-[2rem] flex items-center justify-center text-white mb-6 mx-auto rotate-12 shadow-2xl">
                            <Award size={48} />
                        </div>
                        <h2 className="text-slate-400 font-bold uppercase tracking-[0.4em] text-sm mb-4">Certificate of Achievement</h2>
                        <h1 className="text-5xl sm:text-7xl font-black text-slate-900 tracking-tighter mb-8">LearnSphere</h1>
                    </div>

                    <p className="text-slate-500 italic text-xl mb-12">This is to officially recognize that</p>

                    <div className="relative mb-12">
                        <h3 className="text-4xl sm:text-6xl font-black text-blue-600 underline underline-offset-[12px] decoration-slate-200">
                            {userName || 'Global Achiever'}
                        </h3>
                    </div>

                    <p className="text-slate-500 text-lg mb-4 max-w-2xl">
                        Has successfully demonstrated exceptional dedication and proficiency by completing all requirements for the professional certification course:
                    </p>

                    <h4 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-16 px-8 py-4 bg-slate-50 rounded-2xl inline-block">
                        {courseTitle || 'Advanced Web Development'}
                    </h4>

                    <div className="w-full flex justify-between items-end px-12">
                        <div className="text-left">
                            <div className="h-px w-48 bg-slate-300 mb-4"></div>
                            <p className="font-bold text-slate-900">Dr. Sarah Jenkins</p>
                            <p className="text-[10px] text-slate-400 uppercase tracking-widest">Head of Learning, LearnSphere</p>
                        </div>

                        <div className="flex flex-col items-center">
                            <div className="w-20 h-20 border-4 border-blue-600 rounded-full flex items-center justify-center mb-2">
                                <ShieldCheck className="text-blue-600" size={40} />
                            </div>
                            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Verifiable</p>
                        </div>

                        <div className="text-right">
                            <div className="h-px w-48 bg-slate-300 mb-4"></div>
                            <p className="font-bold text-slate-900">{date || new Date().toLocaleDateString()}</p>
                            <p className="text-[10px] text-slate-400 uppercase tracking-widest">Issue Date</p>
                        </div>
                    </div>
                </div>

                {/* Watermark */}
                <div className="absolute inset-0 pointer-events-none opacity-[0.03] flex items-center justify-center overflow-hidden">
                    <Trophy size={600} className="-rotate-12" />
                </div>
            </div>

            <style>{`
                @media print {
                    .no-print { display: none !important; }
                    body { background: white !important; }
                    .z-[100] { position: relative !important; inset: 0 !important; background: white !important; padding: 0 !important; }
                }
            `}</style>
        </div>
    );
}
