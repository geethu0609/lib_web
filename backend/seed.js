require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await User.deleteMany({});

  const hash = (pw) => bcrypt.hash(pw, 10);

  await User.insertMany([
    { name: 'Admin User', email: 'admin@university.edu', password: await hash('admin123'), gender: 'male', role: 'admin' },
    { name: 'Dr. Sarah Johnson', email: 'sarah@university.edu', password: await hash('faculty123'), gender: 'female', role: 'faculty' },
    { name: 'Prof. Michael Chen', email: 'michael@university.edu', password: await hash('faculty123'), gender: 'male', role: 'faculty' },
    { name: 'Dr. Priya Sharma', email: 'priya@university.edu', password: await hash('faculty123'), gender: 'female', role: 'faculty' },
  ]);

  console.log('Seed complete.');
  console.log('Admin: admin@university.edu / admin123');
  console.log('Faculty: sarah@university.edu / faculty123');
  process.exit(0);
};

seed().catch(err => { console.error(err); process.exit(1); });
