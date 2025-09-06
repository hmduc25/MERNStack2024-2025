import { connectDB } from './config/database.js';
import Product from './models/productModel.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const exportBrandsToUpdate = async () => {
    try {
        await connectDB();
        console.log('Bắt đầu truy vấn sản phẩm để cập nhật...');

        // Danh sách các brand cũ đã bị gộp hoặc có giá trị là 'other'
        const brandsToFind = [
            'other',
            'hi5fineday',
            'trangan168',
            'barona',
            'chinsu',
            'meizan',
            'tuongan',
            'vissanmaivang',
            'omo',
            'knorr',
            'miwon',
            'orion',
            // Thêm các brand cũ khác vào đây nếu có
        ];

        // Truy vấn các sản phẩm có brand nằm trong danh sách brandsToFind
        const products = await Product.find(
            { brand: { $in: brandsToFind } },
            'productCode barcode brand', // Chỉ lấy các trường cần thiết: productCode, barcode và brand
        ).lean();

        // Đổi tên trường _id thành productId
        const formattedProducts = products.map((product) => ({
            productId: product._id,
            productCode: product.productCode,
            barcode: product.barcode,
            brand: product.brand,
        }));

        if (formattedProducts.length === 0) {
            console.log('Không tìm thấy sản phẩm nào cần cập nhật.');
            return;
        }

        // Tên file xuất
        const outputFileName = 'danh_sach_san_pham_can_cap_nhat_brand.json';
        const outputPath = path.join(__dirname, '..', '..', outputFileName);

        // Ghi dữ liệu ra file JSON
        await fs.writeFile(outputPath, JSON.stringify(formattedProducts, null, 2), 'utf8');

        console.log(`Đã xuất thành công ${formattedProducts.length} sản phẩm cần cập nhật vào file: ${outputPath}`);
    } catch (error) {
        console.error('Lỗi khi xuất dữ liệu:', error);
    } finally {
        process.exit();
    }
};

exportBrandsToUpdate();
