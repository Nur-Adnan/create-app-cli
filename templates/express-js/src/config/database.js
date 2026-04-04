const mongoose = require('mongoose');

async function connectDB() {
  const uri = process.env.DATABASE_URL;
  if (!uri) throw new Error('DATABASE_URL is not defined in .env');
  await mongoose.connect(uri);
  console.log('✔ MongoDB connected');
}

module.exports = { connectDB };
