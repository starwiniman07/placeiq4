const Payment = require('../models/Payment.model');
const Booking = require('../models/Booking.model');

// @desc    Initiate Mock Payment
// @route   POST /api/payment/mock-initiate
// @access  Private
const mockInitiate = async (req, res) => {
    try {
        const { bookingId, amount } = req.body;

        const payment = await Payment.create({
            booking: bookingId,
            user: req.user._id,
            amount,
            status: 'Initiated'
        });

        res.status(201).json({ paymentId: payment._id });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Confirm Mock Payment
// @route   POST /api/payment/mock-confirm
// @access  Private
const mockConfirm = async (req, res) => {
    try {
        const { paymentId, transactionId } = req.body;

        const payment = await Payment.findById(paymentId);
        if (!payment) return res.status(404).json({ message: 'Payment not found' });

        payment.status = 'Success';
        payment.transactionId = transactionId || 'TXN_MOCK_' + Date.now();
        await payment.save();

        // Update Booking Status
        const booking = await Booking.findById(payment.booking);
        if (booking) {
            booking.status = 'Scheduled';
            booking.paymentStatus = 'Paid';
            await booking.save();
        }

        res.json({ success: true, payment, booking });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = { mockInitiate, mockConfirm };
