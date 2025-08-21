// import productModel from '../models/productModel.js';

// const logBatchInfo = async (req, res) => {
//     try {
//         const allProducts = await productModel.find({});

//         console.log('--- BÁO CÁO TỒN KHO THEO LÔ ---');
//         console.log('-----------------------------------');

//         if (allProducts.length === 0) {
//             console.log('Không có sản phẩm nào trong database.');
//             return res.json({ success: true, message: 'Không có sản phẩm nào để hiển thị.' });
//         }

//         allProducts.forEach((product) => {
//             console.log(`\nSản phẩm: ${product.name}`);
//             console.log(`Mã sản phẩm: ${product.productCode}`);
//             console.log(`Tổng tồn kho: ${product.totalQuantity}`);
//             console.log(`Chi tiết lô hàng:`);

//             if (product.batches && product.batches.length > 0) {
//                 product.batches.forEach((batch) => {
//                     // Kiểm tra trường 'remaining' có tồn tại không
//                     const remaining = batch.remaining !== undefined ? batch.remaining : 'Không xác định';

//                     console.log(` - Lô hàng: ${batch.batchNumber}, Tồn kho: ${remaining}`);
//                 });
//             } else {
//                 console.log(` - Sản phẩm này chưa có thông tin lô hàng.`);
//             }
//         });

//         res.json({ success: true, message: 'Đã in báo cáo tồn kho ra console.' });
//     } catch (error) {
//         console.error('Lỗi khi lấy thông tin tồn kho:', error);
//         res.status(500).json({ success: false, message: `Lỗi máy chủ: ${error.message}` });
//     }
// };

// export { logBatchInfo };

import productModel from '../models/productModel.js';

// Hàm lấy thông tin remaining từ tất cả các batches
const logBatchInfo = async (req, res) => {
    try {
        // 1. Tìm tất cả các sản phẩm có batches không rỗng
        const products = await productModel.find({ 'batches.0': { $exists: true } });

        // 2. Mảng để lưu trữ thông tin remaining
        const remainingBatches = [];

        // 3. Duyệt qua từng sản phẩm để lấy thông tin batches
        products.forEach((product) => {
            if (product.batches && product.batches.length > 0) {
                product.batches.forEach((batch) => {
                    remainingBatches.push({
                        productCode: product.productCode,
                        productName: product.name,
                        batchNumber: batch.batchNumber,
                        remaining: batch.remaining,
                    });
                });
            }
        });

        // 4. In ra log
        console.log('--- Thông tin Remaining của các lô hàng ---');
        if (remainingBatches.length > 0) {
            remainingBatches.forEach((item) => {
                console.log(
                    `Product Code: ${item.productCode}, Product Name: ${item.productName}, Batch Number: ${item.batchNumber}, Remaining: ${item.remaining}`,
                );
            });
            console.log('--- End of Report ---');
        } else {
            console.log('Không tìm thấy lô hàng nào có thông tin remaining.');
        }

        // 5. Trả về phản hồi cho client (có thể trả về dữ liệu hoặc chỉ một thông báo)
        return res.status(200).json({
            success: true,
            message: 'Thông tin remaining đã được in ra log.',
            data: remainingBatches,
        });
    } catch (error) {
        // Xử lý lỗi
        console.error('Lỗi khi lấy thông tin remaining:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi server khi lấy thông tin remaining.',
            error: error.message,
        });
    }
};

export { logBatchInfo };
