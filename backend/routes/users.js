const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { auth, adminAuth } = require('../middleware/auth');
const { generatePassword, sendUserCredentialsEmail } = require('../utils/emailService');

const router = express.Router();

// @route   GET /api/users
// @desc    Get all users
// @access  Private (Admin only)
router.get('/', [auth, adminAuth], async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    // Transform _id to id for frontend compatibility
    const transformedUsers = users.map(user => user.toJSON());
    res.json(transformedUsers);
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
  body('role').isIn(['admin', 'staff', 'student']).withMessage('Role must be admin, staff, or student')
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
    
    // Check for existing username or email
    const existingUser = await User.findOne({
      $or: [
        { username: username.toLowerCase() },
        { email: email.toLowerCase() }
      ]
    });

    if (existingUser) {
      if (existingUser.username.toLowerCase() === username.toLowerCase()) {
        return res.status(400).json({ 
          message: 'Username already exists' 
        });
      }
      if (existingUser.email.toLowerCase() === email.toLowerCase()) {
        return res.status(400).json({ 
          message: 'Email already exists' 
        });
      }
    }
    
    // Generate secure random password
    const password = generatePassword();

    const user = new User({
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      password,
      role
    });

    await user.save();

    // Send email with credentials
    const emailResult = await sendUserCredentialsEmail(email, username, password, role);

    const userJson = user.toJSON();
    res.status(201).json({
      ...userJson,
      password: undefined, // Don't send password in response
      message: 'User created successfully. Credentials sent to email.',
      emailSent: emailResult.success,
      emailSkipped: emailResult.skipped
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

// @route   PUT /api/users/:id/password
// @desc    Update user password
// @access  Private (Admin only or user updating their own password)
router.put('/:id/password', [
  auth,
  body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('currentPassword').optional().isLength({ min: 1 }).withMessage('Current password is required for self-update')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { newPassword, currentPassword } = req.body;
    const userId = req.params.id;
    const currentUserId = req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // If user is updating their own password, require current password
    if (userId === currentUserId) {
      if (!currentPassword) {
        return res.status(400).json({ message: 'Current password is required' });
      }
      
      // Verify current password
      const isCurrentPasswordValid = await user.comparePassword(currentPassword);
      if (!isCurrentPasswordValid) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }
    } else if (!isAdmin) {
      // Only admin can update other users' passwords
      return res.status(403).json({ message: 'Access denied. Admin privileges required' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: Object.values(error.errors).map(e => ({ msg: e.message }))
      });
    }
    console.error('Update password error:', error);
    res.status(500).json({ message: 'Server error while updating password' });
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