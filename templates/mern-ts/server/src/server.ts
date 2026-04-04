import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });
import { app } from './app';
import { connectDB } from './config/database';

const PORT = process.env.PORT ?? 5000;

async function main(): Promise<void> {
  await connectDB();
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
}

main().catch(console.error);
