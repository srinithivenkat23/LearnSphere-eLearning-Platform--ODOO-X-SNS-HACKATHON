const mongoose = require('mongoose');

const videoInteractionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    lessonId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lesson',
        required: true
    },
    // Video bookmarks
    bookmarks: [{
        timestamp: Number, // seconds
        note: String,
        createdAt: { type: Date, default: Date.now }
    }],
    // Watch progress
    watchTime: { type: Number, default: 0 }, // total seconds watched
    lastPosition: { type: Number, default: 0 }, // last playback position
    completedSegments: [{
        start: Number,
        end: Number
    }],
    // Playback preferences
    playbackSpeed: { type: Number, default: 1.0 },
    subtitlesEnabled: { type: Boolean, default: false },
    // Completion status
    completed: { type: Boolean, default: false },
    completedAt: Date
}, {
    timestamps: true
});

// Index for quick lookups
videoInteractionSchema.index({ userId: 1, lessonId: 1 }, { unique: true });

module.exports = mongoose.model('VideoInteraction', videoInteractionSchema);
