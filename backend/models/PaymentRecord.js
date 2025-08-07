const mongoose = require('mongoose');

const paymentRecordSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: [true, 'Student ID is required']
  },
  amount: {
    type: Number,
    required: [true, 'Payment amount is required'],
    min: [0.01, 'Payment amount must be greater than 0']
  },
  paymentDate: {
    type: Date,
    required: [true, 'Payment date is required'],
    default: Date.now
  },

  description: {
    type: String,
    trim: true,
    maxlength: [200, 'Description cannot exceed 200 characters']
  },
  receiptNumber: {
    type: String,
    trim: true,
    maxlength: [50, 'Receipt number cannot exceed 50 characters']
  },
  recordedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User who recorded the payment is required']
  }
}, {
  timestamps: true
});

// Index for efficient queries
paymentRecordSchema.index({ studentId: 1, paymentDate: -1 });

// Virtual for formatted payment date
paymentRecordSchema.virtual('formattedPaymentDate').get(function() {
  return this.paymentDate.toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

// Ensure virtuals are included when converting to JSON
paymentRecordSchema.set('toJSON', { virtuals: true });
paymentRecordSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('PaymentRecord', paymentRecordSchema); 