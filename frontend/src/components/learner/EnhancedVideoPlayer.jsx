import { useState } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { Play, Pause, Volume2, VolumeX, Maximize, Settings, Bookmark, StickyNote, Clock } from 'lucide-react';

export default function EnhancedVideoPlayer({ videoUrl, lessonId, userId }) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
    const [showSpeedMenu, setShowSpeedMenu] = useState(false);
    const [showNotes, setShowNotes] = useState(false);
    const [bookmarks, setBookmarks] = useState([]);
    const [currentTime, setCurrentTime] = useState(0);

    const speeds = [0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0];

    const handleAddBookmark = () => {
        const newBookmark = {
            timestamp: currentTime,
            note: '',
            createdAt: new Date()
        };
        setBookmarks([...bookmarks, newBookmark]);
        setShowNotes(true);
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="space-y-4">
            {/* Video Player */}
            <Card className="p-0 overflow-hidden bg-slate-900">
                <div className="aspect-video bg-slate-800 relative group">
                    {/* Video Element Placeholder */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center text-white">
                            <Play size={64} className="mx-auto mb-4 opacity-50" />
                            <p className="text-sm opacity-75">Enhanced Video Player</p>
                            <p className="text-xs opacity-50 mt-2">BYJU'S-style controls</p>
                        </div>
                    </div>

                    {/* Custom Controls Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        {/* Progress Bar */}
                        <div className="mb-4">
                            <div className="h-1 bg-slate-700 rounded-full overflow-hidden cursor-pointer">
                                <div className="h-full bg-blue-500" style={{ width: '35%' }}></div>
                            </div>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center justify-between text-white">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setIsPlaying(!isPlaying)}
                                    className="hover:text-blue-400 transition-colors"
                                >
                                    {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                                </button>

                                <button
                                    onClick={() => setIsMuted(!isMuted)}
                                    className="hover:text-blue-400 transition-colors"
                                >
                                    {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                                </button>

                                <span className="text-sm font-mono">
                                    {formatTime(currentTime)} / 12:45
                                </span>
                            </div>

                            <div className="flex items-center gap-3">
                                <button
                                    onClick={handleAddBookmark}
                                    className="hover:text-amber-400 transition-colors"
                                    title="Add Bookmark"
                                >
                                    <Bookmark size={20} />
                                </button>

                                <button
                                    onClick={() => setShowNotes(!showNotes)}
                                    className="hover:text-blue-400 transition-colors"
                                    title="Notes"
                                >
                                    <StickyNote size={20} />
                                </button>

                                <div className="relative">
                                    <button
                                        onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                                        className="hover:text-blue-400 transition-colors flex items-center gap-1"
                                    >
                                        <Settings size={20} />
                                        <span className="text-xs font-bold">{playbackSpeed}x</span>
                                    </button>

                                    {showSpeedMenu && (
                                        <div className="absolute bottom-full right-0 mb-2 bg-slate-800 rounded-lg shadow-xl overflow-hidden">
                                            {speeds.map(speed => (
                                                <button
                                                    key={speed}
                                                    onClick={() => {
                                                        setPlaybackSpeed(speed);
                                                        setShowSpeedMenu(false);
                                                    }}
                                                    className={`block w-full px-4 py-2 text-sm text-left hover:bg-slate-700 ${playbackSpeed === speed ? 'bg-blue-600' : ''
                                                        }`}
                                                >
                                                    {speed}x
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <button className="hover:text-blue-400 transition-colors">
                                    <Maximize size={20} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Bookmarks & Notes Panel */}
            {showNotes && (
                <Card className="p-6">
                    <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <StickyNote size={20} className="text-blue-600" />
                        Your Notes & Bookmarks
                    </h4>

                    {bookmarks.length > 0 ? (
                        <div className="space-y-3">
                            {bookmarks.map((bookmark, index) => (
                                <div key={index} className="p-3 bg-slate-50 rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Clock size={14} className="text-blue-600" />
                                        <span className="text-sm font-bold text-slate-700">
                                            {formatTime(bookmark.timestamp)}
                                        </span>
                                    </div>
                                    <textarea
                                        placeholder="Add your notes here..."
                                        className="w-full text-sm border-none bg-transparent resize-none outline-none"
                                        rows={2}
                                        defaultValue={bookmark.note}
                                    />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-slate-400 text-center py-4">
                            Click the bookmark icon to save important moments
                        </p>
                    )}
                </Card>
            )}

            {/* Quick Jump Chapters */}
            <Card className="p-6">
                <h4 className="font-bold text-slate-900 mb-4">Quick Jump</h4>
                <div className="grid grid-cols-2 gap-3">
                    {[
                        { time: '0:00', title: 'Introduction' },
                        { time: '2:30', title: 'Core Concepts' },
                        { time: '5:45', title: 'Examples' },
                        { time: '9:15', title: 'Summary' }
                    ].map((chapter, i) => (
                        <button
                            key={i}
                            className="p-3 text-left rounded-lg bg-slate-50 hover:bg-blue-50 hover:border-blue-200 border-2 border-transparent transition-all group"
                        >
                            <span className="text-xs font-bold text-blue-600">{chapter.time}</span>
                            <p className="text-sm font-medium text-slate-900 group-hover:text-blue-600">
                                {chapter.title}
                            </p>
                        </button>
                    ))}
                </div>
            </Card>
        </div>
    );
}
