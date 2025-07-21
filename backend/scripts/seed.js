const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');
const Student = require('../models/Student');

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/university', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Student.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create admin user
    const adminUser = new User({
      username: 'admin',
      email: 'admin@university.edu.al',
      password: 'admin123',
      role: 'admin'
    });
    await adminUser.save();

    // Create staff user
    const staffUser = new User({
      username: 'staff',
      email: 'staff@university.edu.al',
      password: 'staff123',
      role: 'staff'
    });
    await staffUser.save();

    console.log('👥 Created users');

    // Sample students data
    const studentsData = [
      {
        firstName: 'Andi',
        lastName: 'Hoxha',
        parentName: 'Petrit Hoxha',
        gender: 'M',
        dateOfBirth: new Date('2002-03-15'),
        address: 'Rruga Durrësit 45, Tiranë',
        phone: '+355692345678',
        email: 'andi.hoxha@student.edu.al',
        previousSchool: 'Gjimnazi "Sami Frashëri"',
        previousSchoolAddress: 'Tiranë',
        program: 'Shkenca Kompjuterike',
        academicYear: '2024-2025',
        totalAmount: 300000,
        paidAmount: 300000
      },
      {
        firstName: 'Elsa',
        lastName: 'Kola',
        parentName: 'Agim Kola',
        gender: 'F',
        dateOfBirth: new Date('2001-07-22'),
        address: 'Rruga e Kavajës 123, Tiranë',
        phone: '+355693456789',
        email: 'elsa.kola@student.edu.al',
        previousSchool: 'Gjimnazi "Naim Frashëri"',
        previousSchoolAddress: 'Tiranë',
        program: 'Mjekësi',
        academicYear: '2024-2025',
        totalAmount: 450000,
        paidAmount: 200000
      },
      {
        firstName: 'Marko',
        lastName: 'Gjoka',
        parentName: 'Ilir Gjoka',
        gender: 'M',
        dateOfBirth: new Date('2003-01-10'),
        address: 'Rruga Myslym Shyri 67, Tiranë',
        phone: '+355694567890',
        email: 'marko.gjoka@student.edu.al',
        previousSchool: 'Gjimnazi "Ismail Qemali"',
        previousSchoolAddress: 'Vlorë',
        program: 'Inxhinieri Civile',
        academicYear: '2024-2025',
        totalAmount: 280000,
        paidAmount: 140000
      },
      {
        firstName: 'Sara',
        lastName: 'Mema',
        parentName: 'Fatmir Mema',
        gender: 'F',
        dateOfBirth: new Date('2002-11-05'),
        address: 'Rruga Pjetër Bogdani 34, Shkodër',
        phone: '+355695678901',
        email: 'sara.mema@student.edu.al',
        previousSchool: 'Gjimnazi "Luigj Gurakuqi"',
        previousSchoolAddress: 'Shkodër',
        program: 'Psikologji',
        academicYear: '2024-2025',
        totalAmount: 250000,
        paidAmount: 0
      },
      {
        firstName: 'Denis',
        lastName: 'Rama',
        parentName: 'Sokol Rama',
        gender: 'M',
        dateOfBirth: new Date('2001-09-18'),
        address: 'Rruga Dëshmorët e Kombit 89, Durrës',
        phone: '+355696789012',
        email: 'denis.rama@student.edu.al',
        previousSchool: 'Gjimnazi "Aleksandër Moisiu"',
        previousSchoolAddress: 'Durrës',
        program: 'Ekonomiks',
        academicYear: '2024-2025',
        totalAmount: 220000,
        paidAmount: 220000
      },
      {
        firstName: 'Anxhela',
        lastName: 'Basha',
        parentName: 'Genc Basha',
        gender: 'F',
        dateOfBirth: new Date('2003-04-12'),
        address: 'Rruga Fan Noli 56, Korçë',
        phone: '+355697890123',
        email: 'anxhela.basha@student.edu.al',
        previousSchool: 'Gjimnazi "Raqi Qirinxhi"',
        previousSchoolAddress: 'Korçë',
        program: 'Drejtësi',
        academicYear: '2024-2025',
        totalAmount: 200000,
        paidAmount: 100000
      },
      {
        firstName: 'Klajdi',
        lastName: 'Zeneli',
        parentName: 'Arben Zeneli',
        gender: 'M',
        dateOfBirth: new Date('2002-08-30'),
        address: 'Rruga Skënderbeu 78, Elbasan',
        phone: '+355698901234',
        email: 'klajdi.zeneli@student.edu.al',
        previousSchool: 'Gjimnazi "Kostandin Kristoforidhi"',
        previousSchoolAddress: 'Elbasan',
        program: 'Biznes dhe Menaxhim',
        academicYear: '2024-2025',
        totalAmount: 240000,
        paidAmount: 80000
      },
      {
        firstName: 'Erjona',
        lastName: 'Duka',
        parentName: 'Flamur Duka',
        gender: 'F',
        dateOfBirth: new Date('2001-12-03'),
        address: 'Rruga Çamëria 23, Fier',
        phone: '+355699012345',
        email: 'erjona.duka@student.edu.al',
        previousSchool: 'Gjimnazi "Jani Vreto"',
        previousSchoolAddress: 'Fier',
        program: 'Arkitekturë',
        academicYear: '2024-2025',
        totalAmount: 320000,
        paidAmount: 160000
      }
    ];

    // Create students
    for (const studentData of studentsData) {
      const student = new Student(studentData);
      await student.save();
    }

    console.log('🎓 Created sample students');
    console.log('\n📊 Seed Summary:');
    console.log(`👥 Users created: 2`);
    console.log(`🎓 Students created: ${studentsData.length}`);
    console.log('\n🔐 Login Credentials:');
    console.log('Admin: username=admin, password=admin123');
    console.log('Staff: username=staff, password=staff123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

seedData();