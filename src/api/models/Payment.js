
const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true },
  qr: { type: String, required: true },
  md5: { type: String, required: true },
  expiration: { type: Number, required: true }, // timestamp in ms

  // Payment Info Return From Bakong API
  bakongHash: { type: String }, // Bakong hash after payment
  fromAccountId: { type: String }, // Who paid
  toAccountId: { type: String },   // Your merchant account
  currency: { type: String, enum: ['KHR', 'USD'], default: 'KHR' },
  amount: { type: Number, required: true },
  description: { type: String }, // Payment description
  externalRef: { type: String }, // External reference (from Bakong)

  // Status
  paid: { type: Boolean, default: false },
  transactionId: { type: String }, // Optional transaction ID
  trackingStatus: { type: String, default: null }, // Future use

  // Bank Details (if available)
  receiverBank: { type: String, default: null },
  receiverBankAccount: { type: String, default: null },
  instructionRef: { type: String, default: null },

  // Timestamps
  createdDateMs: { type: Number }, // From Bakong
  acknowledgedDateMs: { type: Number },
  createdAt: { type: Date, default: Date.now }, // Local system created time
  paidAt: { type: Date }, // Marked when payment confirmed
});

module.exports = mongoose.model('Payment', PaymentSchema);
