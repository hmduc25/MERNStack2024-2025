import mongoose from 'mongoose';
import productModel from '../models/productModel.js';
import { connectDB } from '../config/database.js';

const runMigration = async () => {
    try {
        await connectDB();
        console.log('Kết nối MongoDB thành công');

        // Tìm tất cả các documents chưa có trường 'totalQuantity' hoặc có giá trị là 0
        const productsToUpdate = await productModel.find({
            $or: [{ totalQuantity: { $exists: false } }, { totalQuantity: 0 }],
        });

        if (productsToUpdate.length === 0) {
            console.log('Không có documents nào cần cập nhật.');
            await mongoose.disconnect();
            return;
        }

        console.log(`Tìm thấy ${productsToUpdate.length} documents cần cập nhật...`);

        for (const product of productsToUpdate) {
            // Tính tổng từ trường 'quantity' của các batches
            const totalQuantity = product.batches.reduce((sum, batch) => {
                // Đảm bảo batch.quantity tồn tại và là số
                return sum + (parseInt(batch.quantity) || 0);
            }, 0);

            // Gán giá trị vào trường totalQuantity
            product.totalQuantity = totalQuantity;
            await product.save();
            console.log(
                `Đã cập nhật totalQuantity cho productCode: ${product.productCode} với giá trị: ${totalQuantity}`,
            );
        }

        console.log('Hoàn tất cập nhật!');
        await mongoose.disconnect();
    } catch (error) {
        console.error('Lỗi trong quá trình cập nhật dữ liệu:', error);
        await mongoose.disconnect();
    }
};

runMigration();
