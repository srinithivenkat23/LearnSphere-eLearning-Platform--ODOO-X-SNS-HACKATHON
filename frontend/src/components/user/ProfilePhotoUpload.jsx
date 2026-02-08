import React, { useState, useContext } from 'react';
import { UserContext } from '../../context/UserContext';
import ImageUpload from '../ui/ImageUpload';
import { uploadProfilePhoto, getFileUrl } from '../../services/uploadAPI';
import './ProfilePhotoUpload.css';

const ProfilePhotoUpload = () => {
    const { user, setUser } = useContext(UserContext);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState(null);

    const currentPhotoUrl = user?.profilePhoto
        ? getFileUrl(`/uploads/profiles/${user.profilePhoto}`)
        : null;

    const handleUpload = async (file) => {
        setUploading(true);
        setMessage(null);

        try {
            const result = await uploadProfilePhoto(file);

            // Update user context with new profile photo
            setUser(prev => ({
                ...prev,
                profilePhoto: result.filename
            }));

            setMessage({ type: 'success', text: 'Profile photo updated successfully!' });
        } catch (error) {
            console.error('Upload error:', error);
            setMessage({
                type: 'error',
                text: error.response?.data?.error || 'Failed to upload profile photo'
            });
            throw error;
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="profile-photo-upload">
            <h3>Profile Photo</h3>
            <ImageUpload
                onUpload={handleUpload}
                currentImage={currentPhotoUrl}
                label="Upload Profile Photo"
                circular={true}
                maxSize={5 * 1024 * 1024}
            />
            {message && (
                <div className={`upload-message ${message.type}`}>
                    {message.text}
                </div>
            )}
        </div>
    );
};

export default ProfilePhotoUpload;
