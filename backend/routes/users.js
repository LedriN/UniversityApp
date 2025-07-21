const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/users
// @desc    Get all users
// @access  Private (Admin only)
router.get('/', [auth, adminAuth], async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error while fetching users' });
  }
});

// @route   POST /api/users
// @desc    Create new user
// @access  Private (Admin only)
router.post('/', [
  auth,
  adminAuth,
  body('username').trim().isLength({ min: 3, max: 30 }).withMessage('Username must be 3-30 characters long'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('role').isIn(['admin', 'staff']).withMessage('Role must be admin or staff')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { username, email, role } = req.body;
    
    // Generate default password (should be changed on first login)
    const defaultPassword = 'password123';

    const user = new User({
      username,
      email,
      password: defaultPassword,
      role
    });

    await user.save();

    res.status(201).json({
      ...user.toJSON(),
      message: 'User created successfully. Default password: password123'
    });
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({ 
        message: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists` 
      });
    }
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: Object.values(error.errors).map(e => ({ msg: e.message }))
      });
    }
    console.error('Create user error:', error);
    res.status(500).json({ message: 'Server error while creating user' });
  }
});

// @route   DELETE /api/users/:id
// @desc    Delete user
// @access  Private (Admin only)
router.delete('/:id', [auth, adminAuth], async (req, res) => {
  try {
    // Prevent admin from deleting themselves
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error while deleting user' });
  }
});

module.exports = router;