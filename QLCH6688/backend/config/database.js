import mongoose from 'mongoose';
const mongodbUrl = 'mongodb+srv://duchm:duchm@duc25.f6fou.mongodb.net/?retryWrites=true&w=majority&appName=duc25';

export const connectDB = async () => {
    try {
        await mongoose.connect(mongodbUrl).then(() => console.log('DB is connected'));
    } catch (error) {
        console.error('Failed to connect to MongoDB', error);
    }
};
