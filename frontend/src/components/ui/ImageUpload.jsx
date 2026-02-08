import React, { useState, useRef } from 'react';
import './ImageUpload.css';

const ImageUpload = ({
    onUpload,
    currentImage,
    label = "Upload Image",
    accept = "image/jpeg,image/png,image/gif,image/webp",
    maxSize = 5 * 1024 * 1024, // 5MB default
    circular = false
}) => {
    const [preview, setPreview] = useState(currentImage || null);
    const [uploading, setUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [error, setError] = useState(null);
    const fileInputRef = useRef(null);

    const handleFileSelect = async (file) => {
        setError(null);

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setError('Please select an image file');
            return;
        }

        // Validate file size
        if (file.size > maxSize) {
            setError(`File size must be less than ${Math.round(maxSize / (1024 * 1024))}MB`);
            return;
        }

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result);
        };
        reader.readAsDataURL(file);

        // Upload file
        if (onUpload) {
            setUploading(true);
            try {
                await onUpload(file);
            } catch (err) {
                setError(err.message || 'Upload failed');
                setPreview(currentImage);
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
        <div className="image-upload-container">
            <div
                className={`image-upload-area ${dragActive ? 'drag-active' : ''} ${circular ? 'circular' : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={handleClick}
            >
                {preview ? (
                    <div className="image-preview">
                        <img src={preview} alt="Preview" className={circular ? 'circular-image' : ''} />
                        {uploading && (
                            <div className="upload-overlay">
                                <div className="spinner"></div>
                                <p>Uploading...</p>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="upload-placeholder">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <polyline points="17 8 12 3 7 8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <line x1="12" y1="3" x2="12" y2="15" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <p>{label}</p>
                        <span>Drag & drop or click to browse</span>
                    </div>
                )}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept={accept}
                    onChange={handleChange}
                    style={{ display: 'none' }}
                />
            </div>
            {error && <div className="upload-error">{error}</div>}
        </div>
    );
};

export default ImageUpload;
