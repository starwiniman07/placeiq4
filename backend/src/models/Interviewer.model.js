const mongoose = require('mongoose');

const interviewerSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    designation: { type: String, required: true },
    company: { type: String, required: true },
    yearsOfExperience: { type: Number, required: true },
    domains: [{ type: String, enum: ['Software Dev', 'Data Analyst', 'Finance', 'Marketing', 'HR', 'MBA', 'Sales'] }],
    languages: [{ type: String }],
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    pricePerSession: { type: Number, required: true, default: 500 }, // ₹
    availableTimeSlots: [{
        date: { type: Date },
        slots: [{ type: String }] // e.g., '10:00 AM', '11:00 AM'
    }],
    photoUrl: { type: String },
    bio: { type: String }
});

const Interviewer = mongoose.model('Interviewer', interviewerSchema);
module.exports = Interviewer;
