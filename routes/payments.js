const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_fake_key');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

// Middleware to verify JWT
const verifyToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.userId = decoded.userId;
    next();
  } catch (err) {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

// Create payment intent for deposit
router.post('/deposit', verifyToken, async (req, res) => {
  try {
    const { amount, currency = 'usd' } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid amount' });
    }

    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      metadata: {
        userId: req.userId,
        type: 'deposit'
      }
    });

    // Create transaction record
    const transaction = new Transaction({
      userId: req.userId,
      type: 'deposit',
      amount,
      currency: currency.toUpperCase(),
      status: 'pending',
      paymentMethod: 'stripe',
      stripeTransactionId: paymentIntent.id
    });

    await transaction.save();

    res.json({ 
      success: true, 
      clientSecret: paymentIntent.client_secret,
      transactionId: transaction._id
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Confirm deposit payment
router.post('/confirm-deposit', verifyToken, async (req, res) => {
  try {
    const { paymentIntentId, amount } = req.body;

    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      // Update transaction
      await Transaction.findOneAndUpdate(
        { stripeTransactionId: paymentIntentId },
        { status: 'completed', completedAt: new Date() }
      );

      // Update user balance
      const user = await User.findById(req.userId);
      user.accountBalance += amount;
      await user.save();

      res.json({ 
        success: true, 
        message: 'Deposit successful',
        newBalance: user.accountBalance
      });
    } else {
      res.status(400).json({ success: false, message: 'Payment not completed' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Withdrawal request
router.post('/withdrawal', verifyToken, async (req, res) => {
  try {
    const { amount, bankAccount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid amount' });
    }

    const user = await User.findById(req.userId);

    if (user.accountBalance < amount) {
      return res.status(400).json({ success: false, message: 'Insufficient balance' });
    }

    // Create withdrawal transaction
    const transaction = new Transaction({
      userId: req.userId,
      type: 'withdrawal',
      amount,
      currency: 'USD',
      status: 'pending',
      paymentMethod: 'bank_transfer',
      description: `Withdrawal to account ending in ${bankAccount.slice(-4)}`
    });

    await transaction.save();

    // Deduct from balance (pending approval)
    user.accountBalance -= amount;
    await user.save();

    res.json({ 
      success: true, 
      message: 'Withdrawal request submitted. Pending admin approval.',
      transactionId: transaction._id,
      newBalance: user.accountBalance
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get user transactions
router.get('/transactions', verifyToken, async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ success: true, transactions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get account balance
router.get('/balance', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    res.json({ 
      success: true, 
      balance: user.accountBalance,
      currency: 'USD'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
