const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Course = require('../models/Course');
const User = require('../models/User');

exports.createPaymentIntent = async (req, res) => {
    try {
        const { courseId } = req.body;
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }

        const paymentIntent = await stripe.paymentIntents.create({
            amount: course.price * 100, // In cents
            currency: 'usd',
            metadata: { courseId, userId: req.user._id.toString() }
        });
        res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.confirmPurchase = async (req, res) => {
    try {
        const { courseId } = req.body;
        const user = await User.findById(req.user._id);
        if (!user.purchasedCourses.includes(courseId)) {
            user.purchasedCourses.push(courseId);
            await user.save();
        }
        res.json({ message: 'Purchase confirmed' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
