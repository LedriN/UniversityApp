const express = require('express');
const Student = require('../models/Student');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/stats
// @desc    Get dashboard statistics
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    // Get all students for calculations
    const students = await Student.find();
    
    // Basic counts
    const totalStudents = students.length;
    const paidStudents = students.filter(s => s.paidAmount >= s.totalAmount).length;
    const debtStudents = students.filter(s => s.paidAmount < s.totalAmount).length;
    
    // Financial calculations
    const totalRevenue = students.reduce((sum, s) => sum + s.paidAmount, 0);
    const totalOutstanding = students.reduce((sum, s) => sum + Math.max(0, s.totalAmount - s.paidAmount), 0);
    
    // Program statistics
    const programCounts = {};
    students.forEach(student => {
      programCounts[student.program] = (programCounts[student.program] || 0) + 1;
    });
    
    const programStats = Object.entries(programCounts).map(([program, count]) => ({
      program,
      count
    })).sort((a, b) => b.count - a.count);

    // Gender statistics
    const genderStats = {
      male: students.filter(s => s.gender === 'M').length,
      female: students.filter(s => s.gender === 'F').length
    };

    // Age statistics
    const today = new Date();
    const ageStats = {
      '18-20': 0,
      '21-23': 0,
      '24+': 0
    };

    students.forEach(student => {
      const age = today.getFullYear() - new Date(student.dateOfBirth).getFullYear();
      if (age >= 18 && age <= 20) ageStats['18-20']++;
      else if (age >= 21 && age <= 23) ageStats['21-23']++;
      else if (age >= 24) ageStats['24+']++;
    });

    // Payment status statistics
    const paymentStats = {
      paid: paidStudents,
      partial: students.filter(s => s.paidAmount > 0 && s.paidAmount < s.totalAmount).length,
      unpaid: students.filter(s => s.paidAmount === 0).length
    };

    // Recent registrations (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentRegistrations = students.filter(s => new Date(s.createdAt) >= thirtyDaysAgo).length;

    res.json({
      totalStudents,
      paidStudents,
      debtStudents,
      totalRevenue,
      totalOutstanding,
      programStats,
      genderStats,
      ageStats,
      paymentStats,
      recentRegistrations,
      averageDebt: debtStudents > 0 ? Math.round(totalOutstanding / debtStudents) : 0,
      collectionRate: totalStudents > 0 ? Math.round((paidStudents / totalStudents) * 100) : 0
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Server error while fetching statistics' });
  }
});

module.exports = router;