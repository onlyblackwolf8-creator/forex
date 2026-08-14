const mongoose = require('mongoose');

const tradeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  pair: {
    type: String,
    required: true, // e.g., 'EUR/USD'
    uppercase: true
  },
  type: {
    type: String,
    enum: ['buy', 'sell'],
    required: true
  },
  entryPrice: {
    type: Number,
    required: true
  },
  exitPrice: Number,
  quantity: {
    type: Number,
    required: true
  },
  stopLoss: Number,
  takeProfit: Number,
  status: {
    type: String,
    enum: ['open', 'closed', 'cancelled'],
    default: 'open'
  },
  profitLoss: {
    type: Number,
    default: 0
  },
  profitLossPercentage: {
    type: Number,
    default: 0
  },
  commission: {
    type: Number,
    default: 0
  },
  leverage: {
    type: Number,
    default: 1,
    min: 1,
    max: 500
  },
  openedAt: {
    type: Date,
    default: Date.now
  },
  closedAt: Date,
  notes: String
});

// Calculate P&L before saving
tradeSchema.pre('save', function(next) {
  if (this.exitPrice && this.entryPrice) {
    const pnl = (this.exitPrice - this.entryPrice) * this.quantity;
    this.profitLoss = this.type === 'buy' ? pnl : -pnl;
    this.profitLossPercentage = (this.profitLoss / (this.entryPrice * this.quantity)) * 100;
  }
  next();
});

module.exports = mongoose.model('Trade', tradeSchema);
