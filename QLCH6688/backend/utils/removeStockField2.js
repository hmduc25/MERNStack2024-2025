import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Cấu hình dotenv để lấy biến môi trường
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, './.env') }); // Lưu ý: đường dẫn có thể cần điều chỉnh

// Kết nối đến database
const connectDB = async () => {
    try {
        const mongodbUrl = process.env.MONGODB_URL;
        if (!mongodbUrl) {
            console.error('MongoDB URL not found in .env file');
            return false;
        }
        await mongoose.connect(mongodbUrl);
        console.log('DB is connected');
        return true;
    } catch (error) {
        console.error('Failed to connect to MongoDB', error);
        return false;
    }
};

const removeStockField = async () => {
    const isConnected = await connectDB();
    if (!isConnected) {
        return;
    }

    try {
        const result = await mongoose.connection.collection('products').updateMany(
            {},
            { $unset: { stock: '' } }, // Xóa trường 'stock'
        );

        console.log(`Đã xóa trường 'stock' từ ${result.modifiedCount} document.`);
    } catch (error) {
        console.error('Lỗi khi xóa trường stock:', error);
    } finally {
        // Đóng kết nối sau khi hoàn thành
        mongoose.disconnect();
    }
};

// Chạy hàm
removeStockField();
