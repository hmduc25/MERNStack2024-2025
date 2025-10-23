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
