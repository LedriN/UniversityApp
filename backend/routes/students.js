const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Student = require('../models/Student');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const { generatePassword, sendWelcomeEmail } = require('../utils/emailService');

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
        { program: { $regex: search, $options: 'i' } },
        { studentID: { $regex: search, $options: 'i' } },
        { comment: { $regex: search, $options: 'i' } }
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

    // Find the associated user account
    const user = await User.findOne({ 
      email: student.email,
      role: 'student'
    });

    // Create response object with student data
    const studentData = student.toObject();
    
    // Add user credentials if found
    if (user) {
      // Generate a new password for PDF display (since we can't retrieve the original)
      const { generatePassword } = require('../utils/emailService');
      const newPassword = generatePassword();
      
      studentData.userCredentials = {
        username: user.username,
        password: newPassword // Generate a new password for PDF
      };
    }

    res.json(studentData);
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
// @access  Public
router.post('/', [
  body('studentID').trim().notEmpty().withMessage('Student ID is required'),
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('parentName').trim().notEmpty().withMessage('Parent name is required'),
  body('gender').isIn(['M', 'F']).withMessage('Gender must be M or F'),
  body('dateOfBirth').notEmpty().withMessage('Date of birth is required'),
  body('address').trim().notEmpty().withMessage('Address is required'),
  body('phone').trim().notEmpty().withMessage('Phone number is required').matches(/^\d{3}-\d{3}-\d{3}$/).withMessage('Valid phone number in format XXX-XXX-XXX is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('program').notEmpty().withMessage('Program is required'),
  body('academicYear').notEmpty().withMessage('Academic year is required'),
  body('totalAmount').isNumeric().withMessage('Total amount must be a number'),
  body('paidAmount').isNumeric().withMessage('Paid amount must be a number')
], async (req, res) => {
  try {
    console.log('📝 Received student data:', req.body);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation errors:', errors.array());
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

    // Check for existing student with same email or phone
    const existingStudent = await Student.findOne({
      $or: [
        { email: req.body.email.toLowerCase() },
        { phone: req.body.phone }
      ]
    });

    if (existingStudent) {
      if (existingStudent.email.toLowerCase() === req.body.email.toLowerCase()) {
        return res.status(400).json({ 
          message: 'Email-i tashme ekziston ne sistem',
          field: 'email'
        });
      }
      if (existingStudent.phone === req.body.phone) {
        return res.status(400).json({ 
          message: 'Numri i telefonit tashme ekziston ne sistem',
          field: 'phone'
        });
      }
    }

    const student = new Student(req.body);
    await student.save();

    // Create user account for the student
    try {
      const username = `${req.body.firstName.toLowerCase()}.${req.body.lastName.toLowerCase()}`;
      const email = req.body.email;
      const studentName = `${req.body.firstName} ${req.body.lastName}`;
      
      // Check if user already exists
      const existingUser = await User.findOne({ 
        $or: [{ username }, { email }] 
      });
      
      if (existingUser) {
        // If user exists, just return the student
        return res.status(201).json(student);
      }

      // Generate a random password
      const password = generatePassword();

      // Create new user account
      const user = new User({
        username,
        email,
        password, // Use the generated password
        role: 'student'
      });
      
      await user.save();
      console.log(`✅ Created user account for student: ${username}`);

      // Send welcome email with credentials
      const emailResult = await sendWelcomeEmail(email, studentName, username, password);
      if (emailResult.success) {
        console.log(`✅ Welcome email sent to: ${email}`);
      } else {
        console.error(`❌ Failed to send welcome email to: ${email}`, emailResult.error);
      }
    } catch (userError) {
      console.error('Error creating user account:', userError);
      // Don't fail the student creation if user creation fails
    }

    res.status(201).json(student);
  } catch (error) {
    if (error.code === 11000) {
      // Handle MongoDB duplicate key errors
      if (error.keyPattern && error.keyPattern.email) {
        return res.status(400).json({ 
          message: 'Email-i tashme ekziston ne sistem',
          field: 'email'
        });
      }
      if (error.keyPattern && error.keyPattern.phone) {
        return res.status(400).json({ 
          message: 'Numri i telefonit tashme ekziston ne sistem',
          field: 'phone'
        });
      }
      if (error.keyPattern && error.keyPattern.studentID) {
        return res.status(400).json({ 
          message: 'ID-ja e studentit tashme ekziston ne sistem',
          field: 'studentID'
        });
      }
      return res.status(400).json({ message: 'Te dhenat tashme ekzistojne ne sistem' });
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
  body('studentID').optional().trim().notEmpty().withMessage('Student ID cannot be empty')
    .matches(/^\d{10}$/).withMessage('Student ID must be exactly 10 digits'),
  body('firstName').optional().trim().notEmpty().withMessage('First name cannot be empty'),
  body('lastName').optional().trim().notEmpty().withMessage('Last name cannot be empty'),
  body('parentName').optional().trim().notEmpty().withMessage('Parent name cannot be empty'),
  body('gender').optional().isIn(['M', 'F']).withMessage('Gender must be M or F'),
  body('dateOfBirth').optional().isISO8601().withMessage('Valid date of birth is required'),
  body('address').optional().trim().notEmpty().withMessage('Address cannot be empty'),
  body('phone').optional().matches(/^\d{3}-\d{3}-\d{3}$/).withMessage('Valid phone number in format XXX-XXX-XXX is required'),
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

    // Check for existing student with same email or phone (excluding current student)
    if (req.body.email || req.body.phone) {
      const existingStudent = await Student.findOne({
        _id: { $ne: req.params.id }, // Exclude current student
        $or: [
          ...(req.body.email ? [{ email: req.body.email.toLowerCase() }] : []),
          ...(req.body.phone ? [{ phone: req.body.phone }] : [])
        ]
      });

      if (existingStudent) {
        if (req.body.email && existingStudent.email.toLowerCase() === req.body.email.toLowerCase()) {
          return res.status(400).json({ 
            message: 'Email-i tashme ekziston ne sistem',
            field: 'email'
          });
        }
        if (req.body.phone && existingStudent.phone === req.body.phone) {
          return res.status(400).json({ 
            message: 'Numri i telefonit tashme ekziston ne sistem',
            field: 'phone'
          });
        }
      }
    }

    Object.assign(student, req.body);
    await student.save();

    res.json(student);
  } catch (error) {
    if (error.code === 11000) {
      // Handle MongoDB duplicate key errors
      if (error.keyPattern && error.keyPattern.email) {
        return res.status(400).json({ 
          message: 'Email-i tashme ekziston ne sistem',
          field: 'email'
        });
      }
      if (error.keyPattern && error.keyPattern.phone) {
        return res.status(400).json({ 
          message: 'Numri i telefonit tashme ekziston ne sistem',
          field: 'phone'
        });
      }
      if (error.keyPattern && error.keyPattern.studentID) {
        return res.status(400).json({ 
          message: 'ID-ja e studentit tashme ekziston ne sistem',
          field: 'studentID'
        });
      }
      return res.status(400).json({ message: 'Te dhenat tashme ekzistojne ne sistem' });
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