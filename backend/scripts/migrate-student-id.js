const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const Student = require('../models/Student');

const migrateStudentIDs = async () => {
  try {
    console.log('🔍 Environment check:');
    console.log('MONGODB_URI:', process.env.MONGODB_URI ? '✅ Set' : '❌ Not set');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Find all students without studentID
    const studentsWithoutID = await Student.find({ studentID: { $exists: false } });
    console.log(`📊 Found ${studentsWithoutID.length} students without studentID`);

    if (studentsWithoutID.length === 0) {
      console.log('✅ All students already have studentID');
      process.exit(0);
    }

    // Generate and assign studentIDs
    for (let i = 0; i < studentsWithoutID.length; i++) {
      const student = studentsWithoutID[i];
      const studentID = Math.floor(1000000000 + Math.random() * 9000000000).toString();
      
      // Check if this studentID already exists
      const existingStudent = await Student.findOne({ studentID });
      if (existingStudent) {
        // If exists, generate a new one
        i--; // Retry this student
        continue;
      }

      // Update the student with the new studentID
      await Student.findByIdAndUpdate(student._id, { studentID });
      console.log(`✅ Updated student ${student.firstName} ${student.lastName} with studentID: ${studentID}`);
    }

    console.log('🎉 Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration error:', error);
    process.exit(1);
  }
};

migrateStudentIDs(); 