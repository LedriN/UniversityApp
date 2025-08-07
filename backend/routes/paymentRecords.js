const express = require('express');
const { body, validationResult } = require('express-validator');
const PaymentRecord = require('../models/PaymentRecord');
const Student = require('../models/Student');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get all payment records for a student
router.get('/student/:studentId', auth, async (req, res) => {
  try {
    const { studentId } = req.params;
    
    // Verify student exists
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Studenti nuk u gjet' });
    }

    const paymentRecords = await PaymentRecord.find({ studentId })
      .populate('recordedBy', 'username')
      .sort({ paymentDate: -1 });

    res.json(paymentRecords);
  } catch (error) {
    console.error('Get payment records error:', error);
    res.status(500).json({ message: 'Gabim serveri gjatë marrjes së regjistrave të pagesave' });
  }
});

// Add a new payment record
router.post('/', auth, [
  body('studentId').isMongoId().withMessage('ID e vlefshme e studentit është e detyrueshme'),
  body('amount').isNumeric().withMessage('Shuma duhet të jetë një numër'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Shuma duhet të jetë më e madhe se 0'),
  body('paymentDate').optional().isISO8601().withMessage('Data e vlefshme e pagesës është e detyrueshme'),

  body('description').optional().isLength({ max: 200 }).withMessage('Përshkrimi nuk mund të kalojë 200 karaktere'),
  body('receiptNumber').optional().isLength({ max: 50 }).withMessage('Numri i faturës nuk mund të kalojë 50 karaktere')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validimi dështoi', 
        errors: errors.array() 
      });
    }

    const { studentId, amount, paymentDate, description, receiptNumber } = req.body;

    // Verify student exists
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Studenti nuk u gjet' });
    }

    // Check if payment would exceed total amount
    const currentPaidAmount = student.paidAmount;
    const newTotalPaid = currentPaidAmount + amount;
    
    if (newTotalPaid > student.totalAmount) {
      return res.status(400).json({ 
        message: 'Shuma e pagesës do të kalonte shumën totale që i detyrohet studenti' 
      });
    }

    // Create payment record
    const paymentRecord = new PaymentRecord({
      studentId,
      amount,
      paymentDate: paymentDate || new Date(),
      description,
      receiptNumber,
      recordedBy: req.user.id
    });

    await paymentRecord.save();

    // Update student's paid amount
    student.paidAmount = newTotalPaid;
    await student.save();

    // Populate the recordedBy field for response
    await paymentRecord.populate('recordedBy', 'username');

    res.status(201).json(paymentRecord);
  } catch (error) {
    console.error('Add payment record error:', error);
    res.status(500).json({ message: 'Gabim serveri gjatë shtimit të regjistrit të pagesës' });
  }
});

// Delete a payment record
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const paymentRecord = await PaymentRecord.findById(id);
    if (!paymentRecord) {
      return res.status(404).json({ message: 'Regjistri i pagesës nuk u gjet' });
    }

    // Get the student
    const student = await Student.findById(paymentRecord.studentId);
    if (!student) {
      return res.status(404).json({ message: 'Studenti nuk u gjet' });
    }

    // Update student's paid amount (subtract the payment)
    student.paidAmount = Math.max(0, student.paidAmount - paymentRecord.amount);
    await student.save();

    // Delete the payment record
    await PaymentRecord.findByIdAndDelete(id);

    res.json({ message: 'Regjistri i pagesës u fshi me sukses' });
  } catch (error) {
    console.error('Delete payment record error:', error);
    res.status(500).json({ message: 'Gabim serveri gjatë fshirjes së regjistrit të pagesës' });
  }
});

// Get payment statistics for a student
router.get('/student/:studentId/stats', auth, async (req, res) => {
  try {
    const { studentId } = req.params;
    
    // Verify student exists
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Studenti nuk u gjet' });
    }

    const paymentRecords = await PaymentRecord.find({ studentId });
    
    const totalPaid = paymentRecords.reduce((sum, record) => sum + record.amount, 0);
    const remainingDebt = Math.max(0, student.totalAmount - totalPaid);
    const paymentProgress = student.totalAmount > 0 ? (totalPaid / student.totalAmount) * 100 : 0;



    // Monthly payment trends (last 12 months)
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
    
    const monthlyPayments = paymentRecords
      .filter(record => record.paymentDate >= twelveMonthsAgo)
      .reduce((acc, record) => {
        const month = record.paymentDate.toISOString().slice(0, 7); // YYYY-MM format
        acc[month] = (acc[month] || 0) + record.amount;
        return acc;
      }, {});

    res.json({
      totalPaid,
      remainingDebt,
      paymentProgress: Math.round(paymentProgress * 100) / 100,
      totalPayments: paymentRecords.length,
      monthlyPayments,
      lastPayment: paymentRecords.length > 0 ? paymentRecords[0].paymentDate : null
    });
  } catch (error) {
    console.error('Get payment stats error:', error);
    res.status(500).json({ message: 'Gabim serveri gjatë marrjes së statistikave të pagesave' });
  }
});

module.exports = router; 