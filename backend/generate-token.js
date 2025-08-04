const jwt = require('jsonwebtoken');
require('dotenv').config();

// Create a test token for admin user
const createTestToken = () => {
  const payload = {
    id: 'test-admin-id',
    username: 'admin',
    email: 'admin@university.edu.al',
    role: 'admin'
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET || 'your_jwt_secret_key_here', {
    expiresIn: '24h'
  });

  console.log('🔑 Generated Test Token:');
  console.log('='.repeat(50));
  console.log(token);
  console.log('='.repeat(50));
  console.log('\n📋 To use this token:');
  console.log('1. Open browser dev tools (F12)');
  console.log('2. Go to Console tab');
  console.log('3. Run this command:');
  console.log(`localStorage.setItem('authToken', '${token}')`);
  console.log('4. Refresh the page');
  console.log('\n✅ You should now be logged in as admin!');
};

createTestToken(); 