const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Trade = require('../models/Trade');
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

// Create a new trade
router.post('/', verifyToken, async (req, res) => {
  try {
    const { pair, type, entryPrice, quantity, stopLoss, takeProfit, leverage } = req.body;

    if (!pair || !type || !entryPrice || !quantity) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const trade = new Trade({
      userId: req.userId,
      pair,
      type,
      entryPrice,
      quantity,
      stopLoss,
      takeProfit,
      leverage: leverage || 1
    });

    await trade.save();

    res.status(201).json({ 
      success: true, 
      message: 'Trade created successfully',
      trade
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get user's trades
router.get('/', verifyToken, async (req, res) => {
  try {
    const trades = await Trade.find({ userId: req.userId }).sort({ openedAt: -1 });
    res.json({ success: true, trades });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get trade by ID
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const trade = await Trade.findById(req.params.id);
    
    if (!trade) {
      return res.status(404).json({ success: false, message: 'Trade not found' });
    }

    if (trade.userId.toString() !== req.userId) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.json({ success: true, trade });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Close a trade
router.put('/:id/close', verifyToken, async (req, res) => {
  try {
    const { exitPrice } = req.body;

    if (!exitPrice) {
      return res.status(400).json({ success: false, message: 'Exit price required' });
    }

    const trade = await Trade.findById(req.params.id);
    
    if (!trade) {
      return res.status(404).json({ success: false, message: 'Trade not found' });
    }

    if (trade.userId.toString() !== req.userId) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    trade.exitPrice = exitPrice;
    trade.status = 'closed';
    trade.closedAt = new Date();

    await trade.save();

    // Update user balance
    const user = await User.findById(req.userId);
    user.accountBalance += trade.profitLoss;
    await user.save();

    res.json({ 
      success: true, 
      message: 'Trade closed successfully',
      trade,
      newBalance: user.accountBalance
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get trade statistics
router.get('/stats/summary', verifyToken, async (req, res) => {
  try {
    const trades = await Trade.find({ userId: req.userId });
    
    const totalTrades = trades.length;
    const closedTrades = trades.filter(t => t.status === 'closed');
    const winningTrades = closedTrades.filter(t => t.profitLoss > 0);
    const losingTrades = closedTrades.filter(t => t.profitLoss < 0);
    
    const totalPnL = trades.reduce((sum, t) => sum + t.profitLoss, 0);
    const winRate = closedTrades.length > 0 ? (winningTrades.length / closedTrades.length) * 100 : 0;

    res.json({ 
      success: true, 
      stats: {
        totalTrades,
        closedTrades: closedTrades.length,
        openTrades: trades.filter(t => t.status === 'open').length,
        winningTrades: winningTrades.length,
        losingTrades: losingTrades.length,
        winRate: winRate.toFixed(2),
        totalPnL: totalPnL.toFixed(2),
        averagePnL: closedTrades.length > 0 ? (totalPnL / closedTrades.length).toFixed(2) : 0
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
