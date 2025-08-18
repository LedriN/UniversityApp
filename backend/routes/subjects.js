const express = require('express');
const { body, validationResult } = require('express-validator');
const { auth } = require('../middleware/auth');
const Subject = require('../models/Subject');

const router = express.Router();

// @route   GET /api/subjects
// @desc    Get all subjects
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { program, semester, search } = req.query;
    let query = {};

    // Filter by program
    if (program) {
      query.program = program;
    }

    // Filter by semester
    if (semester) {
      query.semester = parseInt(semester);
    }

    // Search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const subjects = await Subject.find(query).sort({ semester: 1, name: 1 });
    res.json(subjects);
  } catch (error) {
    console.error('Error fetching subjects:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/subjects/:id
// @desc    Get subject by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id);
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }
    res.json(subject);
  } catch (error) {
    console.error('Error fetching subject:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/subjects
// @desc    Create new subject
// @access  Private
router.post('/', [
  auth,
  body('name').trim().notEmpty().withMessage('Subject name is required'),
  body('program').isIn([
    'Shkenca Kompjuterike',
    'Ekonomi e Pergjithshme',
    'Juridik i Pergjithshem',
    'Perkujdesje dhe Mireqenie Sociale'
  ]).withMessage('Valid program is required'),
  body('semester').isInt({ min: 1, max: 8 }).withMessage('Semester must be between 1 and 8'),
  body('credits').optional().isInt({ min: 1, max: 30 }).withMessage('Credits must be between 1 and 30'),
  body('description').optional().trim().isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const subject = new Subject(req.body);
    await subject.save();

    res.status(201).json(subject);
  } catch (error) {
    console.error('Error creating subject:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/subjects/:id
// @desc    Update subject
// @access  Private
router.put('/:id', [
  auth,
  body('name').optional().trim().notEmpty().withMessage('Subject name cannot be empty'),
  body('program').optional().isIn([
    'Shkenca Kompjuterike',
    'Ekonomi e Pergjithshme',
    'Juridik i Pergjithshem',
    'Perkujdesje dhe Mireqenie Sociale'
  ]).withMessage('Valid program is required'),
  body('semester').optional().isInt({ min: 1, max: 8 }).withMessage('Semester must be between 1 and 8'),
  body('credits').optional().isInt({ min: 1, max: 30 }).withMessage('Credits must be between 1 and 30'),
  body('description').optional().trim().isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const subject = await Subject.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    res.json(subject);
  } catch (error) {
    console.error('Error updating subject:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/subjects/:id', async (req, res) => {
  const subjectId = req.params.id;

  // Validate the id
  if (!subjectId || subjectId === "undefined") {
    return res.status(400).json({ error: "Invalid subject id" });
  }

  try {
    const deleted = await Subject.findByIdAndDelete(subjectId);
    if (!deleted) {
      return res.status(404).json({ error: "Subject not found" });
    }
    res.json({ message: "Subject deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
