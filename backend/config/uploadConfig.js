const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const uploadDirs = ['uploads/profiles', 'uploads/courses', 'uploads/videos', 'uploads/documents', 'uploads/temp'];
uploadDirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// Storage configuration for profile photos
const profileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/profiles/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// Storage configuration for course images
const courseStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/courses/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'course-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// Storage configuration for lesson videos
const videoStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/videos/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'video-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// File filter for images
const imageFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Only image files are allowed (JPEG, PNG, GIF, WebP)'));
    }
};

// File filter for videos
const videoFilter = (req, file, cb) => {
    const allowedTypes = /mp4|webm|ogg|mov|avi/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = file.mimetype.startsWith('video/');

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Only video files are allowed (MP4, WebM, OGG, MOV, AVI)'));
    }
};

// Storage configuration for lesson documents
const documentStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/documents/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'doc-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// File filter for documents
const documentFilter = (req, file, cb) => {
    const allowedTypes = /pdf|doc|docx|ppt|pptx|txt|zip|rar/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());

    // Mimetype check is less reliable for some docs, so we rely mostly on extension but check standard ones
    const mimetypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'text/plain',
        'application/zip',
        'application/x-zip-compressed',
        'application/x-rar-compressed'
    ];

    const mimetype = mimetypes.includes(file.mimetype);

    if (extname) {
        return cb(null, true);
    } else {
        cb(new Error('Only document files are allowed (PDF, DOC, PPT, TXT, ZIP)'));
    }
};

// Multer upload configurations
const uploadProfilePhoto = multer({
    storage: profileStorage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: imageFilter
});

const uploadCourseImage = multer({
    storage: courseStorage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: imageFilter
});

const uploadLessonVideo = multer({
    storage: videoStorage,
    limits: { fileSize: 500 * 1024 * 1024 }, // 500MB limit
    fileFilter: videoFilter
});

const uploadLessonDocument = multer({
    storage: documentStorage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
    fileFilter: documentFilter
});

module.exports = {
    uploadProfilePhoto,
    uploadCourseImage,
    uploadLessonVideo,
    uploadLessonDocument
};
