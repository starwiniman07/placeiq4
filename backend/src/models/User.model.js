const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['student', 'interviewer'], default: 'student' },
    
    // Student specific
    college: { type: String },
    branch: { type: String },
    graduationYear: { type: Number },
    placementReadinessScore: { type: Number, default: 0 },
    
    // Interviewer specific
    designation: { type: String },
    company: { type: String },
    bio: { type: String },
    price: { type: Number },
    rating: { type: Number, default: 0 },
    reviewsCount: { type: Number, default: 0 },
    domains: [{ type: String }],
    languages: [{ type: String }],
    availableSlots: [{
        day: String,
        time: String,
        isBooked: { type: Boolean, default: false }
    }],
    
    createdAt: { type: Date, default: Date.now }
});

userSchema.pre('save', async function() {
    if (!this.isModified('password')) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
