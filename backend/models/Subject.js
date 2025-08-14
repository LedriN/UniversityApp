const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Subject name is required'],
    trim: true,
    maxlength: [100, 'Subject name cannot exceed 100 characters']
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
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  credits: {
    type: Number,
    min: [1, 'Credits must be at least 1'],
    max: [30, 'Credits cannot exceed 30'],
    default: 6
  },
  semester: {
    type: Number,
    min: [1, 'Semester must be at least 1'],
    max: [8, 'Semester cannot exceed 8'],
    required: [true, 'Semester is required']
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for better search performance
subjectSchema.index({ name: 'text', description: 'text' });
subjectSchema.index({ program: 1 });
subjectSchema.index({ program: 1, semester: 1 });

module.exports = mongoose.model('Subject', subjectSchema);
