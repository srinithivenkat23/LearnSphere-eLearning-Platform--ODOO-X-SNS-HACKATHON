import axios from 'axios';

const API_URL = 'http://localhost:5000/api/upload';

// Get auth token from localStorage
const getAuthToken = () => {
    return localStorage.getItem('token');
};

// Upload profile photo
export const uploadProfilePhoto = async (file) => {
    const formData = new FormData();
    formData.append('photo', file);

    const response = await axios.post(`${API_URL}/profile-photo`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${getAuthToken()}`
        }
    });

    return response.data;
};

// Upload course image
export const uploadCourseImage = async (file, courseId = null) => {
    const formData = new FormData();
    formData.append('image', file);
    if (courseId) {
        formData.append('courseId', courseId);
    }

    const response = await axios.post(`${API_URL}/course-image`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${getAuthToken()}`
        }
    });

    return response.data;
};

// Upload lesson video with progress tracking
export const uploadLessonVideo = async (file, lessonId = null, onProgress = null) => {
    const formData = new FormData();
    formData.append('video', file);
    if (lessonId) {
        formData.append('lessonId', lessonId);
    }

    const response = await axios.post(`${API_URL}/lesson-video`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${getAuthToken()}`
        },
        onUploadProgress: (progressEvent) => {
            if (onProgress && progressEvent.total) {
                const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                onProgress(percentCompleted);
            }
        }
    });

    return response.data;
};

// Upload lesson document
export const uploadLessonDocument = async (file, lessonId = null) => {
    const formData = new FormData();
    formData.append('document', file);
    if (lessonId) {
        formData.append('lessonId', lessonId);
    }

    const response = await axios.post(`${API_URL}/lesson-document`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${getAuthToken()}`
        }
    });

    return response.data;
};

// Delete uploaded file
export const deleteFile = async (filename) => {
    const response = await axios.delete(`${API_URL}/file/${filename}`, {
        headers: {
            'Authorization': `Bearer ${getAuthToken()}`
        }
    });

    return response.data;
};

// Get full URL for uploaded file
export const getFileUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `http://localhost:5000${path}`;
};
