const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Student = require('../models/Student');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/students
// @desc    Get all students with filtering
// @access  Private
router.get('/', [
  auth,
  query('search').optional().trim(),
  query('gender').optional().isIn(['M', 'F']),
  query('program').optional().trim(),
  query('paymentStatus').optional().isIn(['paid', 'partial', 'unpaid']),
  query('location').optional().trim(),
  query('ageRange').optional().isIn(['18-20', '21-23', '24+'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Invalid query parameters', 
        errors: errors.array() 
      });
    }

    const { search, gender, program, paymentStatus, location, ageRange } = req.query;
    let query = {};

    // Text search
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { program: { $regex: search, $options: 'i' } }
      ];
    }

    // Gender filter
    if (gender) {
      query.gender = gender;
    }

    // Program filter
    if (program) {
      query.program = program;
    }

    // Location filter
    if (location) {
      query.address = { $regex: location, $options: 'i' };
    }

    // Age range filter
    if (ageRange) {
      const today = new Date();
      let minDate, maxDate;

      switch (ageRange) {
        case '18-20':
          minDate = new Date(today.getFullYear() - 20, today.getMonth(), today.getDate());
          maxDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
          break;
        case '21-23':
          minDate = new Date(today.getFullYear() - 23, today.getMonth(), today.getDate());
          maxDate = new Date(today.getFullYear() - 21, today.getMonth(), today.getDate());
          break;
        case '24+':
          maxDate = new Date(today.getFullYear() - 24, today.getMonth(), today.getDate());
          break;
      }

      if (minDate && maxDate) {
        query.dateOfBirth = { $gte: minDate, $lte: maxDate };
      } else if (maxDate) {
        query.dateOfBirth = { $lte: maxDate };
      }
    }

    let students = await Student.find(query).sort({ createdAt: -1 });

    // Payment status filter (post-query since it's a virtual field)
    if (paymentStatus) {
      students = students.filter(student => {
        const status = student.paymentStatus;
        return status === paymentStatus;
      });
    }

    res.json(students);
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ message: 'Server error while fetching students' });
  }
});

// @route   GET /api/students/:id
// @desc    Get student by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json(student);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid student ID' });
    }
    console.error('Get student error:', error);
    res.status(500).json({ message: 'Server error while fetching student' });
  }
});

// @route   POST /api/students
// @desc    Create new student
// @access  Private
router.post('/', [
  auth,
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('parentName').trim().notEmpty().withMessage('Parent name is required'),
  body('gender').isIn(['M', 'F']).withMessage('Gender must be M or F'),
  body('dateOfBirth').isISO8601().withMessage('Valid date of birth is required'),
  body('address').trim().notEmpty().withMessage('Address is required'),
  body('phone').matches(/^(\+355|0)[0-9]{8,9}$/).withMessage('Valid Albanian phone number is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('program').notEmpty().withMessage('Program is required'),
  body('academicYear').matches(/^\d{4}-\d{4}$/).withMessage('Academic year must be in format YYYY-YYYY'),
  body('totalAmount').isFloat({ min: 0 }).withMessage('Total amount must be a positive number'),
  body('paidAmount').isFloat({ min: 0 }).withMessage('Paid amount must be a positive number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    // Check if paid amount exceeds total amount
    if (req.body.paidAmount > req.body.totalAmount) {
      return res.status(400).json({ 
        message: 'Paid amount cannot exceed total amount' 
      });
    }

    const student = new Student(req.body);
    await student.save();

    res.status(201).json(student);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: Object.values(error.errors).map(e => ({ msg: e.message }))
      });
    }
    console.error('Create student error:', error);
    res.status(500).json({ message: 'Server error while creating student' });
  }
});

// @route   PUT /api/students/:id
// @desc    Update student
// @access  Private
router.put('/:id', [
  auth,
  body('firstName').optional().trim().notEmpty().withMessage('First name cannot be empty'),
  body('lastName').optional().trim().notEmpty().withMessage('Last name cannot be empty'),
  body('parentName').optional().trim().notEmpty().withMessage('Parent name cannot be empty'),
  body('gender').optional().isIn(['M', 'F']).withMessage('Gender must be M or F'),
  body('dateOfBirth').optional().isISO8601().withMessage('Valid date of birth is required'),
  body('address').optional().trim().notEmpty().withMessage('Address cannot be empty'),
  body('phone').optional().matches(/^(\+355|0)[0-9]{8,9}$/).withMessage('Valid Albanian phone number is required'),
  body('email').optional().isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('program').optional().notEmpty().withMessage('Program cannot be empty'),
  body('academicYear').optional().matches(/^\d{4}-\d{4}$/).withMessage('Academic year must be in format YYYY-YYYY'),
  body('totalAmount').optional().isFloat({ min: 0 }).withMessage('Total amount must be a positive number'),
  body('paidAmount').optional().isFloat({ min: 0 }).withMessage('Paid amount must be a positive number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Check if paid amount exceeds total amount
    const totalAmount = req.body.totalAmount !== undefined ? req.body.totalAmount : student.totalAmount;
    const paidAmount = req.body.paidAmount !== undefined ? req.body.paidAmount : student.paidAmount;
    
    if (paidAmount > totalAmount) {
      return res.status(400).json({ 
        message: 'Paid amount cannot exceed total amount' 
      });
    }

    Object.assign(student, req.body);
    await student.save();

    res.json(student);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid student ID' });
    }
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: Object.values(error.errors).map(e => ({ msg: e.message }))
      });
    }
    console.error('Update student error:', error);
    res.status(500).json({ message: 'Server error while updating student' });
  }
});

// @route   DELETE /api/students/:id
// @desc    Delete student
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    await Student.findByIdAndDelete(req.params.id);
    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid student ID' });
    }
    console.error('Delete student error:', error);
    res.status(500).json({ message: 'Server error while deleting student' });
  }
});

module.exports = router;