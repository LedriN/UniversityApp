const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { body, validationResult } = require('express-validator');
const { auth } = require('../middleware/auth');
const Lecture = require('../models/Lecture');
const Student = require('../models/Student');

const router = express.Router();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Only allow PDF files
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Get all lectures for a specific program
router.get('/program/:program', auth, async (req, res) => {
  try {
    const { program } = req.params;
    const { role } = req.user;

    // Validate program
    const validPrograms = [
      'Shkenca Kompjuterike',
      'Ekonomi e Pergjithshme',
      'Juridik i Pergjithshem',
      'Perkujdesje dhe Mireqenie Sociale'
    ];

    if (!validPrograms.includes(program)) {
      return res.status(400).json({ message: 'Invalid program' });
    }

    // For students, check if they are enrolled in this program
    if (role === 'student') {
      const student = await Student.findOne({ 
        email: req.user.email,
        program: program 
      });
      
      if (!student) {
        return res.status(403).json({ 
          message: 'You are not enrolled in this program' 
        });
      }
    }

    // For admin/staff, they can access all lectures
    const lectures = await Lecture.find({ program })
      .populate('uploadedBy', 'username email')
      .sort({ uploadedAt: -1 });

    res.json(lectures);
  } catch (error) {
    console.error('Error fetching lectures:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Upload a new lecture (admin/staff only)
router.post('/upload', auth, upload.single('pdf'), async (req, res) => {
  try {
    // Check if user is admin or staff
    if (req.user.role === 'student') {
      return res.status(403).json({ 
        message: 'Only admin and staff can upload lectures' 
      });
    }

    // Validate input
    const { title, description, program } = req.body;
    
    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Title is required' });
    }

    const validPrograms = [
      'Shkenca Kompjuterike',
      'Ekonomi e Pergjithshme',
      'Juridik i Pergjithshem',
      'Perkujdesje dhe Mireqenie Sociale'
    ];

    if (!validPrograms.includes(program)) {
      return res.status(400).json({ message: 'Invalid program' });
    }

    // Create lecture data object
    const lectureData = {
      title: title.trim(),
      description: description ? description.trim() : '',
      program,
      uploadedBy: req.user.id
    };

    // Add file information if PDF was uploaded
    if (req.file) {
      lectureData.fileName = req.file.filename;
      lectureData.originalFileName = req.file.originalname;
      lectureData.filePath = req.file.path;
      lectureData.fileSize = req.file.size;
    }

    // Create new lecture record
    const lecture = new Lecture(lectureData);

    await lecture.save();

    // Populate uploader info
    await lecture.populate('uploadedBy', 'username email');

    res.status(201).json({
      message: 'Lecture uploaded successfully',
      lecture
    });
  } catch (error) {
    console.error('Error uploading lecture:', error);
    
    // Clean up uploaded file if there was an error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ message: 'Server error' });
  }
});

// Download a lecture
router.get('/download/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.user;

    const lecture = await Lecture.findById(id)
      .populate('uploadedBy', 'username email');

    if (!lecture) {
      return res.status(404).json({ message: 'Lecture not found' });
    }

    // Check access permissions
    if (role === 'student') {
      // Check if student is enrolled in this program
      const student = await Student.findOne({ 
        email: req.user.email,
        program: lecture.program 
      });
      
      if (!student) {
        return res.status(403).json({ 
          message: 'You are not enrolled in this program' 
        });
      }
    }

    // Check if lecture has a PDF file
    if (!lecture.filePath || !lecture.fileName) {
      return res.status(404).json({ message: 'This lecture does not have a PDF file' });
    }

    // Check if file exists
    if (!fs.existsSync(lecture.filePath)) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Set headers for file download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${lecture.originalFileName}"`);
    res.setHeader('Content-Length', lecture.fileSize);

    // Stream the file
    const fileStream = fs.createReadStream(lecture.filePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error('Error downloading lecture:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a lecture (admin/staff only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user is admin or staff
    if (req.user.role === 'student') {
      return res.status(403).json({ 
        message: 'Only admin and staff can delete lectures' 
      });
    }

    const lecture = await Lecture.findById(id);

    if (!lecture) {
      return res.status(404).json({ message: 'Lecture not found' });
    }

    // Delete file from filesystem if it exists
    if (lecture.filePath && fs.existsSync(lecture.filePath)) {
      fs.unlinkSync(lecture.filePath);
    }

    // Delete from database
    await Lecture.findByIdAndDelete(id);

    res.json({ message: 'Lecture deleted successfully' });
  } catch (error) {
    console.error('Error deleting lecture:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 