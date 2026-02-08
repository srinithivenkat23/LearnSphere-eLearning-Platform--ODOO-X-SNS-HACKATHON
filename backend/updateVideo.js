const mongoose = require('mongoose');
const Lesson = require('./models/Lesson');
require('dotenv').config();

async function updateVideo() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB...');

        const result = await Lesson.updateOne(
            { title: 'JSX and Components' },
            { $set: { contentUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' } }
        );

        if (result.modifiedCount > 0) {
            console.log('Successfully updated the lesson video.');
        } else {
            console.log('Lesson not found or video already updated.');
        }

        mongoose.connection.close();
    } catch (err) {
        console.error('Error updating video:', err);
    }
}

updateVideo();
