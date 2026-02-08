const express = require('express');
const router = express.Router();
const { uploadProfilePhoto, uploadCourseImage, uploadLessonVideo } = require('../config/uploadConfig');
const User = require('../models/User');
const Course = require('../models/Course');
const Lesson = require('../models/Lesson');
const fs = require('fs');
const path = require('path');

// Middleware to check authentication
const authMiddleware = require('../middleware/auth');

// Upload profile photo
router.post('/profile-photo', authMiddleware, uploadProfilePhoto.single('photo'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const userId = req.user.userId;
        const filename = req.file.filename;

        // Update user's profile photo
        const user = await User.findByIdAndUpdate(
            userId,
            { profilePhoto: filename },
            { new: true }
        );

        if (!user) {
            // Delete uploaded file if user not found
            fs.unlinkSync(req.file.path);
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            message: 'Profile photo uploaded successfully',
            filename: filename,
            url: `/uploads/profiles/${filename}`
        });
    } catch (error) {
        // Clean up uploaded file on error
        if (req.file) {
            fs.unlinkSync(req.file.path);
        }
        console.error('Profile photo upload error:', error);
        res.status(500).json({ error: 'Failed to upload profile photo' });
    }
});

// Upload course image
router.post('/course-image', authMiddleware, uploadCourseImage.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const { courseId } = req.body;
        const filename = req.file.filename;

        if (courseId) {
            // Update existing course
            const course = await Course.findByIdAndUpdate(
                courseId,
                {
                    thumbnail: `/uploads/courses/${filename}`,
                    imageUrl: `/uploads/courses/${filename}`
                },
                { new: true }
            );

            if (!course) {
                fs.unlinkSync(req.file.path);
                return res.status(404).json({ error: 'Course not found' });
            }
        }

        res.json({
            message: 'Course image uploaded successfully',
            filename: filename,
            url: `/uploads/courses/${filename}`
        });
    } catch (error) {
        if (req.file) {
            fs.unlinkSync(req.file.path);
        }
        console.error('Course image upload error:', error);
        res.status(500).json({ error: 'Failed to upload course image' });
    }
});

// Upload lesson video
router.post('/lesson-video', authMiddleware, uploadLessonVideo.single('video'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const { lessonId } = req.body;
        const filename = req.file.filename;
        const fileSize = req.file.size;

        // Estimate duration (this is a placeholder - in production, use ffprobe or similar)
        const estimatedDuration = Math.round(fileSize / (1024 * 1024)); // Rough estimate

        if (lessonId) {
            // Update existing lesson
            const lesson = await Lesson.findByIdAndUpdate(
                lessonId,
                {
                    contentUrl: `/uploads/videos/${filename}`,
                    videoUrl: `/uploads/videos/${filename}`,
                    videoDuration: estimatedDuration
                },
                { new: true }
            );

            if (!lesson) {
                fs.unlinkSync(req.file.path);
                return res.status(404).json({ error: 'Lesson not found' });
            }
        }

        res.json({
            message: 'Video uploaded successfully',
            filename: filename,
            url: `/uploads/videos/${filename}`,
            size: fileSize,
            estimatedDuration: estimatedDuration
        });
    } catch (error) {
        if (req.file) {
            fs.unlinkSync(req.file.path);
        }
        console.error('Video upload error:', error);
        res.status(500).json({ error: 'Failed to upload video' });
    }
});

// Upload lesson document
router.post('/lesson-document', authMiddleware, require('../config/uploadConfig').uploadLessonDocument.single('document'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const { lessonId } = req.body;
        const filename = req.file.filename;

        if (lessonId) {
            // Update existing lesson
            const lesson = await Lesson.findByIdAndUpdate(
                lessonId,
                {
                    contentUrl: `/uploads/documents/${filename}`
                },
                { new: true }
            );

            if (!lesson) {
                fs.unlinkSync(req.file.path);
                return res.status(404).json({ error: 'Lesson not found' });
            }
        }

        res.json({
            message: 'Document uploaded successfully',
            filename: filename,
            url: `/uploads/documents/${filename}`
        });
    } catch (error) {
        if (req.file) {
            fs.unlinkSync(req.file.path);
        }
        console.error('Document upload error:', error);
        res.status(500).json({ error: 'Failed to upload document' });
    }
});

// Delete file
router.delete('/file/:filename', authMiddleware, async (req, res) => {
    try {
        const { filename } = req.params;

        // Determine file type and path
        let filePath;
        if (filename.startsWith('profile-')) {
            filePath = path.join(__dirname, '../uploads/profiles', filename);
        } else if (filename.startsWith('course-')) {
            filePath = path.join(__dirname, '../uploads/courses', filename);
        } else if (filename.startsWith('video-')) {
            filePath = path.join(__dirname, '../uploads/videos', filename);
        } else if (filename.startsWith('doc-')) {
            filePath = path.join(__dirname, '../uploads/documents', filename);
        } else {
            return res.status(400).json({ error: 'Invalid filename' });
        }

        // Check if file exists
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            res.json({ message: 'File deleted successfully' });
        } else {
            res.status(404).json({ error: 'File not found' });
        }
    } catch (error) {
        console.error('File deletion error:', error);
        res.status(500).json({ error: 'Failed to delete file' });
    }
});

module.exports = router;
