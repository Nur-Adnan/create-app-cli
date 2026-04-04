const mongoose = require('mongoose');

let isConnected = false;

async function connectDB() {
  if (isConnected) return;
  const uri = process.env.DATABASE_URL;
  if (!uri) throw new Error('DATABASE_URL is not defined');
  await mongoose.connect(uri);
  isConnected = true;
  console.log('✔ MongoDB connected');
}

module.exports = { connectDB };
