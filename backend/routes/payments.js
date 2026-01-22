const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { createPaymentIntent, confirmPurchase } = require('../controllers/payments');

router.post('/create-payment-intent', auth, createPaymentIntent);
router.post('/confirm', auth, confirmPurchase);

module.exports = router;
