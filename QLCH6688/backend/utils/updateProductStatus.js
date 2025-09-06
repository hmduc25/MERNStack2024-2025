/*
 * Tên file: updateProductStatus.js
 * Mô tả: Script này được sử dụng để cập nhật lại tất cả các sản phẩm trong database.
 * Nó sẽ duyệt qua tất cả các sản phẩm và thực hiện các thay đổi sau:
 * 1. Xóa trường 'stock' nếu nó tồn tại.
 * 2. Thêm hoặc cập nhật trường 'productStatus' với giá trị là 'active'.
 *
 * Cách hoạt động:
 * 1. Script kết nối đến cơ sở dữ liệu MongoDB.
 * 2. Sử dụng lệnh 'productModel.updateMany' để cập nhật tất cả các documents.
 * 3. Lệnh này sử dụng các toán tử:
 * - '$unset': Xóa trường 'stock'.
 * - '$set': Đặt giá trị 'productStatus' thành 'active'.
 * 4. Ngắt kết nối với cơ sở dữ liệu sau khi hoàn tất.
 *
 * Cách sử dụng:
 * Mở terminal, điều hướng đến thư mục backend và chạy lệnh sau:
 *
 * node updateProductStatus.js
 *
 * Lưu ý: Quá trình này sẽ thay đổi cấu trúc dữ liệu. Hãy sử dụng cẩn thận.
 */

import mongoose from 'mongoose';
import productModel from '../models/productModel.js';
import { connectDB } from '../config/database.js';

const updateProductStatus = async () => {
    try {
        await connectDB();
        console.log('Kết nối MongoDB thành công.');

        console.log('Bắt đầu cập nhật trạng thái sản phẩm...');

        const result = await productModel.updateMany(
            {},
            {
                $unset: { stock: '' }, // Xóa trường 'stock'
                $set: { productStatus: 'active' }, // Thêm trường 'productStatus' với giá trị 'active'
            },
        );

        console.log(`Hoàn tất cập nhật! Đã xử lý ${result.modifiedCount} documents.`);
        await mongoose.disconnect();
        console.log('Đã ngắt kết nối với MongoDB.');
    } catch (error) {
        console.error('Lỗi trong quá trình cập nhật sản phẩm:', error);
        await mongoose.disconnect();
    }
};

updateProductStatus();
