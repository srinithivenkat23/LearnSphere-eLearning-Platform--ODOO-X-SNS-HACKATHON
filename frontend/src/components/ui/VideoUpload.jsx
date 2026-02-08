import React, { useState, useRef } from 'react';
import './VideoUpload.css';

const VideoUpload = ({
    onUpload,
    currentVideo,
    label = "Upload Video",
    maxSize = 100 * 1024 * 1024 // 100MB default
}) => {
    const [preview, setPreview] = useState(currentVideo || null);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [dragActive, setDragActive] = useState(false);
    const [error, setError] = useState(null);
    const [videoInfo, setVideoInfo] = useState(null);
    const fileInputRef = useRef(null);

    const handleFileSelect = async (file) => {
        setError(null);

        // Validate file type
        if (!file.type.startsWith('video/')) {
            setError('Please select a video file');
            return;
        }

        // Validate file size
        if (file.size > maxSize) {
            setError(`File size must be less than ${Math.round(maxSize / (1024 * 1024))}MB`);
            return;
        }

        // Create preview and get video duration
        const videoUrl = URL.createObjectURL(file);
        const video = document.createElement('video');
        video.preload = 'metadata';

        video.onloadedmetadata = () => {
            window.URL.revokeObjectURL(videoUrl);
            const duration = Math.round(video.duration);
            const minutes = Math.floor(duration / 60);
            const seconds = duration % 60;

            setVideoInfo({
                duration: `${minutes}:${seconds.toString().padStart(2, '0')}`,
                size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`
            });
        };

        video.src = videoUrl;
        setPreview(videoUrl);

        // Upload file
        if (onUpload) {
            setUploading(true);
            setProgress(0);

            try {
                // Simulate progress (in production, use XMLHttpRequest or axios for real progress)
                const progressInterval = setInterval(() => {
                    setProgress(prev => {
                        if (prev >= 90) {
                            clearInterval(progressInterval);
                            return 90;
                        }
                        return prev + 10;
                    });
                }, 200);

                await onUpload(file);

                clearInterval(progressInterval);
                setProgress(100);
            } catch (err) {
                setError(err.message || 'Upload failed');
                setPreview(currentVideo);
                setVideoInfo(null);
            } finally {
                setUploading(false);
            }
        }
    };

    const handleChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFileSelect(file);
        }
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        const file = e.dataTransfer.files?.[0];
        if (file) {
            handleFileSelect(file);
        }
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="video-upload-container">
            <div
                className={`video-upload-area ${dragActive ? 'drag-active' : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={!uploading ? handleClick : undefined}
            >
                {preview ? (
                    <div className="video-preview">
                        <video src={preview} controls className="preview-video">
                            Your browser does not support the video tag.
                        </video>
                        {videoInfo && (
                            <div className="video-info">
                                <span>⏱️ {videoInfo.duration}</span>
                                <span>📦 {videoInfo.size}</span>
                            </div>
                        )}
                        {uploading && (
                            <div className="upload-progress-overlay">
                                <div className="progress-bar-container">
                                    <div className="progress-bar" style={{ width: `${progress}%` }}></div>
                                </div>
                                <p>{progress}% Uploaded</p>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="upload-placeholder">
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <polygon points="23 7 16 12 23 17 23 7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <rect x="1" y="5" width="15" height="14" rx="2" ry="2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <p>{label}</p>
                        <span>Drag & drop or click to browse</span>
                        <span className="file-types">Supported: MP4, WebM, MOV (max {Math.round(maxSize / (1024 * 1024))}MB)</span>
                    </div>
                )}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/mp4,video/webm,video/ogg,video/quicktime"
                    onChange={handleChange}
                    style={{ display: 'none' }}
                    disabled={uploading}
                />
            </div>
            {error && <div className="upload-error">{error}</div>}
        </div>
    );
};

export default VideoUpload;
