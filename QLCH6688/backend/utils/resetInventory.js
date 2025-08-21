/*
 * Tên file: resetInventory.js
 * Mô tả: Script này được sử dụng để reset toàn bộ tồn kho sản phẩm trong database.
 * Nó sẽ duyệt qua tất cả các sản phẩm và cập nhật lại hai trường chính:
 * 1. `remaining`: Đặt lại giá trị của `remaining` trong mỗi lô hàng (`batches`) về bằng với số lượng ban đầu (`quantity`).
 * 2. `totalQuantity`: Tính toán lại tổng số lượng tồn kho (`remaining`) của tất cả các lô hàng và cập nhật vào trường `totalQuantity` ở cấp sản phẩm.
 * * Cách hoạt động:
 * 1. Script kết nối đến cơ sở dữ liệu MongoDB.
 * 2. Sử dụng lệnh `productModel.updateMany` với một pipeline Aggregation.
 * 3. Pipeline này bao gồm hai stage:
 * - Stage 1: Dùng `$set` và `$map` để lặp qua từng lô hàng, gán `remaining = quantity`.
 * - Stage 2: Dùng `$set` và `$sum` để tính tổng `quantity` của tất cả các lô hàng và cập nhật vào `totalQuantity`.
 * 4. Ngắt kết nối với cơ sở dữ liệu sau khi hoàn tất.
 *
 * Cách sử dụng:
 * Mở terminal, điều hướng đến thư mục `backend` và chạy lệnh sau:
 *
 * node resetInventory.js
 *
 * Lưu ý: Quá trình này sẽ ghi đè dữ liệu tồn kho hiện tại. Hãy sử dụng cẩn thận.
 */

import mongoose from 'mongoose';
import productModel from '../models/productModel.js';
import { connectDB } from '../config/database.js';

const resetInventory = async () => {
    try {
        await connectDB();
        console.log('Kết nối MongoDB thành công.');

        console.log('Bắt đầu reset tồn kho cho tất cả sản phẩm...');

        // Cập nhật tất cả các documents bằng cách sử dụng Aggregation Pipeline
        const result = await productModel.updateMany(
            {},
            [
                {
                    $set: {
                        batches: {
                            $map: {
                                input: '$batches',
                                as: 'batch',
                                in: {
                                    $mergeObjects: [
                                        '$$batch',
                                        {
                                            remaining: '$$batch.quantity',
                                        },
                                    ],
                                },
                            },
                        },
                    },
                },
                {
                    $set: {
                        totalQuantity: {
                            $sum: '$batches.quantity',
                        },
                    },
                },
            ],
            { session: null }, // Không sử dụng session cho updateMany
        );

        console.log(`Hoàn tất reset! Đã xử lý ${result.modifiedCount} documents.`);
        await mongoose.disconnect();
        console.log('Đã ngắt kết nối với MongoDB.');
    } catch (error) {
        console.error('Lỗi trong quá trình reset tồn kho:', error);
        await mongoose.disconnect();
    }
};

resetInventory();
