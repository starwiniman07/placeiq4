const Interviewer = require('../models/Interviewer.model');
const Booking = require('../models/Booking.model');

// @desc    Get all interviewers
const getInterviewers = async (req, res) => {
    try {
        const { domain, maxPrice, minRating } = req.query;
        let query = {};
        
        if (domain) query.domains = domain;
        if (maxPrice) query.pricePerSession = { $lte: parseInt(maxPrice) };
        if (minRating) query.rating = { $gte: parseFloat(minRating) };

        const interviewers = await Interviewer.find(query).populate('user', 'name email');
        res.json(interviewers);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get single interviewer details
const getInterviewerById = async (req, res) => {
    try {
        const interviewer = await Interviewer.findById(req.params.id).populate('user', 'name email');
        if (!interviewer) return res.status(404).json({ message: 'Interviewer not found' });
        res.json(interviewer);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Mock payment and confirm booking
const confirmPayment = async (req, res) => {
    try {
        const { interviewerId, date, timeSlot, amount } = req.body;
        
        // Mock success
        const booking = await Booking.create({
            student: req.user._id,
            interviewer: interviewerId,
            date,
            timeSlot,
            amount,
            status: 'Confirmed',
            roomId: Math.random().toString(36).substring(2, 10)
        });

        res.status(201).json({ success: true, booking });
    } catch (error) {
        res.status(500).json({ message: 'Payment failed', error: error.message });
    }
};

module.exports = { getInterviewers, getInterviewerById, confirmPayment };
