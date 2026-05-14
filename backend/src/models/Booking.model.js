const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    interviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'Interviewer', required: true },
    date: { type: Date, required: true },
    timeSlot: { type: String, required: true },
    status: { type: String, enum: ['Pending Payment', 'Scheduled', 'Completed', 'Cancelled'], default: 'Pending Payment' },
    paymentStatus: { type: String, enum: ['Unpaid', 'Paid'], default: 'Unpaid' },
    roomId: { type: String }, // For WebRTC room
    meetingLink: { type: String },
    amount: { type: Number, required: true },
    feedbackReport: {
        communicationRating: Number,
        technicalRating: Number,
        strengths: [String],
        weaknesses: [String],
        suggestions: String,
        recommendation: String
    },
    createdAt: { type: Date, default: Date.now }
});

const Booking = mongoose.model('Booking', bookingSchema);
module.exports = Booking;
