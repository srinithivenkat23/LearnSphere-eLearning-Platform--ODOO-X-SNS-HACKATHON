const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    shortDescription: { type: String },
    imageUrl: { type: String },
    thumbnail: { type: String }, // Added for course cards
    duration: { type: String }, // Added for display (e.g., "8 weeks")
    level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' }, // Added
    tags: [String],
    category: { type: String },
    instructorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    instructorName: { type: String },
    instructorEmail: { type: String }, // Added for Contact Attendees
    published: { type: Boolean, default: false },
    accessRule: { type: String, enum: ['open', 'invitation', 'payment'], default: 'open' },
    price: { type: Number, default: 0 },
    isPaid: { type: Boolean, default: false }, // Added for easy filtering
    studentsEnrolled: { type: Number, default: 0 }, // Added for display
    rating: { type: Number, default: 4.5 },
    reviewsCount: { type: Number, default: 0 },
    viewsCount: { type: Number, default: 0 }, // Added
    lessonsCount: { type: Number, default: 0 }, // Added
    totalDuration: { type: String, default: '0h' }, // Added
    websiteUrl: { type: String }, // Added
    responsibleId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Added
    responsibleName: { type: String }, // Added
    visibility: { type: String, enum: ['everyone', 'signed-in'], default: 'everyone' }, // Added
    allowReviews: { type: Boolean, default: true }, // Added
    showStudentsCount: { type: Boolean, default: true }, // Added
    studentsCount: { type: Number, default: 0 },
    reviews: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        userName: { type: String },
        rating: { type: Number, min: 1, max: 5 },
        comment: { type: String },
        createdAt: { type: Date, default: Date.now }
    }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Course', courseSchema);
