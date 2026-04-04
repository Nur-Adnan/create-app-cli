import mongoose from 'mongoose';

let isConnected = false;

export async function connectDB(): Promise<void> {
  if (isConnected) return;
  const uri = process.env.DATABASE_URL;
  if (!uri) throw new Error('DATABASE_URL is not defined');
  await mongoose.connect(uri);
  isConnected = true;
  console.log('✔ MongoDB connected');
}
