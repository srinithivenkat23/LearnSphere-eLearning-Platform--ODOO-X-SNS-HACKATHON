import { useState, useEffect, useCallback } from 'react';
import { AlertTriangle, Eye, Maximize, Camera, Shield } from 'lucide-react';

export default function ProctorMonitor({ isActive, onViolation }) {
    const [tabSwitches, setTabSwitches] = useState(0);
    const [fullScreenExits, setFullScreenExits] = useState(0);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [webcamEnabled, setWebcamEnabled] = useState(false);
    const [showWarning, setShowWarning] = useState(false);
    const [warningMessage, setWarningMessage] = useState('');

    // Track tab visibility changes
    useEffect(() => {
        if (!isActive) return;

        const handleVisibilityChange = () => {
            if (document.hidden) {
                setTabSwitches(prev => {
                    const newCount = prev + 1;
                    onViolation?.({
                        type: 'tab_switch',
                        timestamp: new Date(),
                        count: newCount
                    });
                    showWarningPopup('⚠️ Tab Switch Detected! Stay on the quiz page.');
                    return newCount;
                });
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [isActive, onViolation]);

    // Track full-screen changes
    useEffect(() => {
        if (!isActive) return;

        const handleFullScreenChange = () => {
            const isNowFullScreen = !!document.fullscreenElement;
            setIsFullScreen(isNowFullScreen);

            if (!isNowFullScreen && fullScreenExits > 0) {
                setFullScreenExits(prev => {
                    const newCount = prev + 1;
                    onViolation?.({
                        type: 'fullscreen_exit',
                        timestamp: new Date(),
                        count: newCount
                    });
                    showWarningPopup('⚠️ Full-Screen Exited! Please return to full-screen mode.');
                    return newCount;
                });
            }
        };

        document.addEventListener('fullscreenchange', handleFullScreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullScreenChange);
    }, [isActive, fullScreenExits, onViolation]);

    // Prevent copy/paste
    useEffect(() => {
        if (!isActive) return;

        const preventCopy = (e) => {
            e.preventDefault();
            showWarningPopup('⚠️ Copy/Paste is disabled during the quiz.');
        };

        document.addEventListener('copy', preventCopy);
        document.addEventListener('paste', preventCopy);
        document.addEventListener('cut', preventCopy);

        return () => {
            document.removeEventListener('copy', preventCopy);
            document.removeEventListener('paste', preventCopy);
            document.removeEventListener('cut', preventCopy);
        };
    }, [isActive]);

    // Request full-screen on start
    useEffect(() => {
        if (isActive && !isFullScreen) {
            requestFullScreen();
        }
    }, [isActive]);

    const requestFullScreen = () => {
        const elem = document.documentElement;
        if (elem.requestFullscreen) {
            elem.requestFullscreen().catch(err => {
                console.log('Full-screen request failed:', err);
            });
        }
    };

    const showWarningPopup = (message) => {
        setWarningMessage(message);
        setShowWarning(true);
        setTimeout(() => setShowWarning(false), 3000);
    };

    const requestWebcam = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            setWebcamEnabled(true);
            // Stop the stream immediately, we just wanted permission
            stream.getTracks().forEach(track => track.stop());
        } catch (err) {
            console.log('Webcam access denied:', err);
        }
    };

    const getProctorData = useCallback(() => {
        return {
            tabSwitches,
            fullScreenExits,
            webcamEnabled,
            violations: []
        };
    }, [tabSwitches, fullScreenExits, webcamEnabled]);

    // Expose getData method via ref or callback
    useEffect(() => {
        if (onViolation) {
            onViolation({ getData: getProctorData });
        }
    }, [getProctorData, onViolation]);

    if (!isActive) return null;

    return (
        <>
            {/* Warning Popup */}
            {showWarning && (
                <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] animate-in slide-in-from-top-2 fade-in">
                    <div className="bg-red-500 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border-2 border-red-600">
                        <AlertTriangle size={24} className="animate-pulse" />
                        <p className="font-bold text-sm">{warningMessage}</p>
                    </div>
                </div>
            )}

            {/* Proctoring Status Bar */}
            <div className="fixed bottom-4 right-4 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Shield size={16} className="text-blue-400" />
                        <span className="text-xs font-bold">Proctored Quiz</span>
                    </div>
                    <div className="h-4 w-px bg-slate-700"></div>
                    <div className="flex items-center gap-3 text-xs">
                        <div className="flex items-center gap-1.5">
                            <Eye size={14} className={tabSwitches > 0 ? 'text-red-400' : 'text-slate-400'} />
                            <span className={tabSwitches > 0 ? 'text-red-400 font-bold' : 'text-slate-400'}>
                                {tabSwitches} switches
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Maximize size={14} className={isFullScreen ? 'text-emerald-400' : 'text-red-400'} />
                            <span className={isFullScreen ? 'text-emerald-400' : 'text-red-400 font-bold'}>
                                {isFullScreen ? 'Full-screen' : 'Exit detected'}
                            </span>
                        </div>
                        {webcamEnabled && (
                            <div className="flex items-center gap-1.5">
                                <Camera size={14} className="text-emerald-400" />
                                <span className="text-emerald-400">Webcam</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Full-Screen Reminder */}
            {!isFullScreen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9998] flex items-center justify-center">
                    <div className="bg-white rounded-3xl p-8 max-w-md text-center shadow-2xl">
                        <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Maximize size={32} className="text-blue-600" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 mb-2">Full-Screen Required</h3>
                        <p className="text-slate-600 mb-6">
                            This quiz requires full-screen mode for proctoring purposes. Click below to continue.
                        </p>
                        <button
                            onClick={requestFullScreen}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-colors"
                        >
                            Enter Full-Screen Mode
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
