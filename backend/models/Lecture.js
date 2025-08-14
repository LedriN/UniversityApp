const mongoose = require('mongoose');

const lectureSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
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
  fileName: {
    type: String,
    required: false
  },
  originalFileName: {
    type: String,
    required: false
  },
  filePath: {
    type: String,
    required: false
  },
  fileSize: {
    type: Number,
    required: false
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Uploader is required']
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for better query performance
lectureSchema.index({ program: 1, uploadedAt: -1 });
lectureSchema.index({ uploadedBy: 1 });

// Add virtual id field
lectureSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

// Ensure virtual fields are serialized
lectureSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('Lecture', lectureSchema); 