const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

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

// Get user profile
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    res.json({ success: true, user: user.toJSON() });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Update user profile
router.put('/profile', verifyToken, async (req, res) => {
  try {
    const { firstName, lastName, phone, country, preferredCurrencies } = req.body;

    const user = await User.findByIdAndUpdate(
      req.userId,
      {
        firstName,
        lastName,
        phone,
        country,
        preferredCurrencies,
        updatedAt: new Date()
      },
      { new: true }
    );

    res.json({ success: true, message: 'Profile updated', user: user.toJSON() });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Enable 2FA
router.post('/2fa/enable', verifyToken, async (req, res) => {
  try {
    const speakeasy = require('speakeasy');
    
    const secret = speakeasy.generateSecret({
      name: `BlackWolf (${req.body.email})`,
      issuer: 'BlackWolf'
    });

    const user = await User.findById(req.userId);
    user.twoFactorSecret = secret.base32;
    user.twoFactorEnabled = false; // Pending verification
    await user.save();

    res.json({ 
      success: true, 
      qrCode: secret.otpauth_url,
      secret: secret.base32
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Verify 2FA
router.post('/2fa/verify', verifyToken, async (req, res) => {
  try {
    const speakeasy = require('speakeasy');
    const { token } = req.body;

    const user = await User.findById(req.userId);

    if (!user.twoFactorSecret) {
      return res.status(400).json({ success: false, message: '2FA not set up' });
    }

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token,
      window: 2
    });

    if (!verified) {
      return res.status(400).json({ success: false, message: 'Invalid token' });
    }

    user.twoFactorEnabled = true;
    await user.save();

    res.json({ success: true, message: '2FA enabled successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Update trading preferences
router.put('/preferences', verifyToken, async (req, res) => {
  try {
    const { riskLevel, autoTrade, notifications } = req.body;

    const user = await User.findByIdAndUpdate(
      req.userId,
      {
        'tradingPreferences.riskLevel': riskLevel,
        'tradingPreferences.autoTrade': autoTrade,
        'tradingPreferences.notifications': notifications
      },
      { new: true }
    );

    res.json({ success: true, preferences: user.tradingPreferences });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
