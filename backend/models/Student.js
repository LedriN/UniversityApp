const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  studentID: {
    type: String,
    required: [true, 'Student ID is required'],
    unique: true,
    trim: true,
    match: [/^\d{2}\/\d{3}\/\d{2}$/, 'Student ID must be in format XX/XXX/XX']
  },
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  parentName: {
    type: String,
    required: [true, 'Parent name is required'],
    trim: true,
    maxlength: [50, 'Parent name cannot exceed 50 characters']
  },
  gender: {
    type: String,
    required: [true, 'Gender is required'],
    enum: ['M', 'F']
  },
  dateOfBirth: {
    type: Date,
    required: [true, 'Date of birth is required'],
    validate: {
      validator: function(date) {
        return date < new Date();
      },
      message: 'Date of birth must be in the past'
    }
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true,
    maxlength: [200, 'Address cannot exceed 200 characters']
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    unique: true,
    trim: true,
    match: [/^[\d+\s\-()]+$/, 'Phone number can only contain numbers, +, spaces, dashes, and parentheses']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  previousSchool: {
    type: String,
    trim: true,
    maxlength: [100, 'Previous school name cannot exceed 100 characters']
  },
  previousSchoolAddress: {
    type: String,
    trim: true,
    maxlength: [200, 'Previous school address cannot exceed 200 characters']
  },
  program: {
    type: String,
    required: [true, 'Program is required'],
    enum: [
      'Shkenca Kompjuterike',
      'Ekonomi e Pergjithshme',
      'Juridik i Pergjithshem',
      'Perkujdesje dhe Mireqenie Sociale'
    ]
  },
  academicYear: {
    type: String,
    required: [true, 'Academic year is required'],
    match: [/^\d{4}-\d{4}$/, 'Academic year must be in format YYYY-YYYY']
  },
  totalAmount: {
    type: Number,
    required: [true, 'Total amount is required'],
    min: [0, 'Total amount cannot be negative']
  },
  paidAmount: {
    type: Number,
    required: [true, 'Paid amount is required'],
    min: [0, 'Paid amount cannot be negative'],
    validate: {
      validator: function(value) {
        return value <= this.totalAmount;
      },
      message: 'Paid amount cannot exceed total amount'
    }
  },
  comment: {
    type: String,
    trim: true,
    maxlength: [1000, 'Comment cannot exceed 1000 characters']
  }
}, {
  timestamps: true
});

// Virtual for remaining debt
studentSchema.virtual('remainingDebt').get(function() {
  return Math.max(0, this.totalAmount - this.paidAmount);
});

// Virtual for payment status
studentSchema.virtual('paymentStatus').get(function() {
  if (this.paidAmount >= this.totalAmount) return 'paid';
  if (this.paidAmount > 0) return 'partial';
  return 'unpaid';
});

// Virtual for payment progress percentage
studentSchema.virtual('paymentProgress').get(function() {
  if (this.totalAmount === 0) return 0;
  return Math.min(100, (this.paidAmount / this.totalAmount) * 100);
});

// Virtual for payment records (populated when needed)
studentSchema.virtual('paymentRecords', {
  ref: 'PaymentRecord',
  localField: '_id',
  foreignField: 'studentId'
});

// Include virtuals in JSON output
studentSchema.set('toJSON', { virtuals: true });
studentSchema.set('toObject', { virtuals: true });

// Index for better search performance
studentSchema.index({ firstName: 'text', lastName: 'text', email: 'text', program: 'text', studentID: 'text', comment: 'text' });
studentSchema.index({ email: 1 });
studentSchema.index({ phone: 1 });
studentSchema.index({ studentID: 1 });
studentSchema.index({ program: 1 });
studentSchema.index({ gender: 1 });
studentSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Student', studentSchema);