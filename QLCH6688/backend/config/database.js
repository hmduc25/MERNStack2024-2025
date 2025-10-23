import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

export const connectDB = async () => {
    try {
        const mongodbUrl = process.env.MONGODB_URL;
        if (!mongodbUrl) {
            console.error('MongoDB URL not found in .env file');
            return;
        }
        await mongoose.connect(mongodbUrl);
        console.log('DB is connected');
    } catch (error) {
        console.error('Failed to connect to MongoDB', error);
    }
};
