const mongoose = require('mongoose');
const { generateStudentsExcel, generateExcelFilename } = require('../utils/excelGenerator');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

async function testExcelGeneration() {
  try {
    console.log('🧪 Testing Excel generation functionality...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/university_db');
    console.log('✅ Connected to MongoDB');

    // Generate Excel file
    console.log('📊 Generating Excel file...');
    const excelBuffer = await generateStudentsExcel();
    const filename = generateExcelFilename();
    
    // Save to file for testing
    const outputPath = path.join(__dirname, '..', 'uploads', filename);
    fs.writeFileSync(outputPath, excelBuffer);
    
    console.log(`✅ Excel file generated successfully: ${filename}`);
    console.log(`📁 File saved to: ${outputPath}`);
    console.log(`📏 File size: ${excelBuffer.length} bytes`);
    
    // Test filename generation
    const testFilename = generateExcelFilename();
    console.log(`📝 Generated filename: ${testFilename}`);
    
  } catch (error) {
    console.error('❌ Error testing Excel generation:', error);
  } finally {
    // Close MongoDB connection
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
  }
}

// Run the test
testExcelGeneration();
