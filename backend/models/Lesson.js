const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    title: { type: String, required: true },
    description: { type: String },
    type: { type: String, enum: ['video', 'document', 'image', 'quiz'], default: 'video' },
    contentUrl: { type: String },
    videoUrl: { type: String }, // URL/path to uploaded video
    videoDuration: { type: Number }, // Duration in seconds
    thumbnailUrl: { type: String }, // Video thumbnail
    duration: { type: String },
    responsibleId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    responsibleName: { type: String },
    allowDownload: { type: Boolean, default: false },
    order: { type: Number, required: true },
    attachments: [{
        name: { type: String, required: true },
        url: { type: String, required: true },
        type: { type: String, enum: ['file', 'link'], default: 'link' }
    }],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Lesson', lessonSchema);
