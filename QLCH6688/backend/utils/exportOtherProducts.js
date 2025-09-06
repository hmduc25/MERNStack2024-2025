import { connectDB } from './config/database.js';
import Product from './models/productModel.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const exportOtherProducts = async () => {
    try {
        await connectDB();
        console.log('Bắt đầu truy vấn sản phẩm...');

        // Truy vấn các sản phẩm có unit là 'khac' hoặc 'other'
        const products = await Product.find(
            { unit: { $in: ['khac', 'other'] } },
            'productCode barcode unit', // Chỉ lấy các trường cần thiết
        ).lean(); // Sử dụng .lean() để trả về plain JavaScript objects thay vì Mongoose documents

        // Đổi tên trường _id thành productId
        const formattedProducts = products.map((product) => ({
            productId: product._id,
            productCode: product.productCode,
            barcode: product.barcode,
            unit: product.unit,
        }));

        if (formattedProducts.length === 0) {
            console.log('Không tìm thấy sản phẩm nào có unit là "khac" hoặc "other".');
            return;
        }

        // Tên file xuất
        const outputFileName = 'danh_sach_san_pham_khac.json';
        const outputPath = path.join(__dirname, '..', '..', outputFileName);

        // Ghi dữ liệu ra file JSON
        await fs.writeFile(outputPath, JSON.stringify(formattedProducts, null, 2), 'utf8');

        console.log(`Đã xuất thành công ${formattedProducts.length} sản phẩm vào file: ${outputPath}`);
    } catch (error) {
        console.error('Lỗi khi xuất dữ liệu:', error);
    } finally {
        process.exit();
    }
};

exportOtherProducts();
