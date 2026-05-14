const mongoose = require('mongoose');

const roadmapSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    targetRole: { type: String, required: true },
    currentSkills: { type: String },
    weeks: [{
        week: Number,
        title: String,
        tasks: [String],
        resources: [String],
        milestone: String,
        isCompleted: { type: Boolean, default: false }
    }],
    totalProgress: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});

const Roadmap = mongoose.model('Roadmap', roadmapSchema);
module.exports = Roadmap;
