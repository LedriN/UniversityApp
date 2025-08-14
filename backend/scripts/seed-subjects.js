const mongoose = require('mongoose');
const Subject = require('../models/Subject');
require('dotenv').config();

const sampleSubjects = [
  // Shkenca Kompjuterike
  {
    name: 'Programimi i Kompjuterit',
    program: 'Shkenca Kompjuterike',
    description: 'Bazat e programimit dhe algoritmike',
    credits: 6,
    semester: 1
  },
  {
    name: 'Matematika Diskrete',
    program: 'Shkenca Kompjuterike',
    description: 'Matematika e nevojshme per programim',
    credits: 6,
    semester: 1
  },
  {
    name: 'Struktura e Te Dhenave',
    program: 'Shkenca Kompjuterike',
    description: 'Strukturat bazike te te dhenave',
    credits: 6,
    semester: 2
  },
  {
    name: 'Bazat e Databazave',
    program: 'Shkenca Kompjuterike',
    description: 'Konceptet bazike te databazave',
    credits: 6,
    semester: 2
  },
  {
    name: 'Programimi Web',
    program: 'Shkenca Kompjuterike',
    description: 'Zhvillimi i aplikacioneve web',
    credits: 6,
    semester: 3
  },

  // Ekonomi e Pergjithshme
  {
    name: 'Mikroekonomia',
    program: 'Ekonomi e Pergjithshme',
    description: 'Bazat e mikroekonomise',
    credits: 6,
    semester: 1
  },
  {
    name: 'Makroekonomia',
    program: 'Ekonomi e Pergjithshme',
    description: 'Bazat e makroekonomise',
    credits: 6,
    semester: 2
  },
  {
    name: 'Kontabiliteti Financiar',
    program: 'Ekonomi e Pergjithshme',
    description: 'Bazat e kontabilitetit',
    credits: 6,
    semester: 2
  },
  {
    name: 'Menaxhimi Financiar',
    program: 'Ekonomi e Pergjithshme',
    description: 'Menaxhimi i financave te biznesit',
    credits: 6,
    semester: 3
  },

  // Juridik i Pergjithshem
  {
    name: 'E Drejta Civile',
    program: 'Juridik i Pergjithshem',
    description: 'Bazat e se drejtes civile',
    credits: 6,
    semester: 1
  },
  {
    name: 'E Drejta Penale',
    program: 'Juridik i Pergjithshem',
    description: 'Bazat e se drejtes penale',
    credits: 6,
    semester: 2
  },
  {
    name: 'E Drejta Administrative',
    program: 'Juridik i Pergjithshem',
    description: 'Bazat e se drejtes administrative',
    credits: 6,
    semester: 2
  },
  {
    name: 'E Drejta Ndërkombëtare',
    program: 'Juridik i Pergjithshem',
    description: 'Bazat e se drejtes ndërkombëtare',
    credits: 6,
    semester: 3
  },

  // Perkujdesje dhe Mireqenie Sociale
  {
    name: 'Bazat e Perkujdesjes Sociale',
    program: 'Perkujdesje dhe Mireqenie Sociale',
    description: 'Konceptet bazike te perkujdesjes sociale',
    credits: 6,
    semester: 1
  },
  {
    name: 'Psikologjia Sociale',
    program: 'Perkujdesje dhe Mireqenie Sociale',
    description: 'Bazat e psikologjise sociale',
    credits: 6,
    semester: 1
  },
  {
    name: 'Politikat Sociale',
    program: 'Perkujdesje dhe Mireqenie Sociale',
    description: 'Politikat dhe programet sociale',
    credits: 6,
    semester: 2
  },
  {
    name: 'Menaxhimi i Shërbimeve Sociale',
    program: 'Perkujdesje dhe Mireqenie Sociale',
    description: 'Menaxhimi i shërbimeve sociale',
    credits: 6,
    semester: 3
  }
];

async function seedSubjects() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing subjects
    await Subject.deleteMany({});
    console.log('🗑️  Cleared existing subjects');

    // Insert sample subjects
    const subjects = await Subject.insertMany(sampleSubjects);
    console.log(`✅ Added ${subjects.length} subjects`);

    // Log subjects by program
    const subjectsByProgram = subjects.reduce((acc, subject) => {
      if (!acc[subject.program]) {
        acc[subject.program] = [];
      }
      acc[subject.program].push(subject.name);
      return acc;
    }, {});

    console.log('\n📚 Subjects by program:');
    Object.entries(subjectsByProgram).forEach(([program, subjectNames]) => {
      console.log(`\n${program}:`);
      subjectNames.forEach(name => console.log(`  - ${name}`));
    });

    console.log('\n🎉 Subjects seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding subjects:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

seedSubjects();
