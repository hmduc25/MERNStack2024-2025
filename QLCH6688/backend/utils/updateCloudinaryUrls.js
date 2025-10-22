// updateCloudinaryUrls_PRODUCTION.js
import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Giả sử Product Model của bạn nằm trong './models/ProductModel.js'
import productModel from './models/ProductModel.js';

// --- CẤU HÌNH ---
const IS_DRY_RUN = false; // 🛑 ĐÃ ĐỔI THÀNH FALSE ĐỂ CHẠY THỰC TẾ VÀ LƯU VÀO DB
const CLOUDINARY_BASE_URL = 'https://res.cloudinary.com/duntfc4ff/image/upload/';
const INPUT_FILE = 'cloudinary_urls.txt';
const OUTPUT_FILE = 'products_to_check.json'; // Tên file báo cáo lỗi/kiểm tra

// Khắc phục lỗi __dirname trong ES Module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FULL_INPUT_PATH = path.join(__dirname, INPUT_FILE);
const FULL_OUTPUT_PATH = path.join(__dirname, OUTPUT_FILE);

// --- HÀM HỖ TRỢ ---
const parseLine = (line) => {
    const parts = line.split(' => ');
    if (parts.length !== 2) return null;

    const [fileName, fullUrl] = parts;
    const originalFileName = fileName.trim();

    if (!fullUrl.startsWith(CLOUDINARY_BASE_URL)) {
        console.warn(`⚠️ Bỏ qua dòng: URL không khớp Base URL. URL: ${fullUrl}`);
        return null;
    }
    const relativeUrl = fullUrl.substring(CLOUDINARY_BASE_URL.length);

    return { originalFileName, relativeUrl };
};

// --- HÀM CHÍNH ĐỂ CHẠY UPDATE ---
const updateProductUrls = async () => {
    console.log(`\n======================================================`);
    console.log(
        `   ${IS_DRY_RUN ? '📣 CHẾ ĐỘ CHẠY THỬ (DRY RUN): KHÔNG LƯU DB' : '💾 CHẾ ĐỘ THỰC THI: SẼ LƯU VÀO DB'}`,
    );
    console.log(`======================================================`);
    console.log(`Bắt đầu cập nhật ảnh từ file: ${INPUT_FILE}`);

    // 1. Đọc file
    let fileContent;
    try {
        fileContent = fs.readFileSync(FULL_INPUT_PATH, 'utf8');
    } catch (err) {
        console.error(`❌ Lỗi khi đọc file ${INPUT_FILE}: ${err.message}`);
        return;
    }

    const lines = fileContent
        .trim()
        .split('\n')
        .filter((line) => line.trim() !== '');
    const updateData = lines.map(parseLine).filter((data) => data !== null);
    const originalFileNamesInTxt = new Set(updateData.map((item) => item.originalFileName));

    if (updateData.length === 0) {
        console.log('Không có dữ liệu hợp lệ để cập nhật.');
        return;
    }

    console.log(`\nĐã phân tích thành công ${updateData.length} mục dữ liệu.\n`);

    // 2. Kết nối Database
    try {
        // Đảm bảo bạn đang sử dụng process.env.MONGODB_URL hoặc biến môi trường chính xác
        await mongoose.connect(process.env.MONGODB_URL);
        console.log('✅ Đã kết nối MongoDB thành công.');
    } catch (error) {
        console.error('❌ Lỗi kết nối MongoDB:', error.message);
        return;
    }

    // --- Khởi tạo biến đếm ---
    let recordsToUpdate = 0;
    let dbMatchCount = 0;
    let dbUpdateSuccess = 0;
    let dbFailCount = 0;
    let dbNotFound = 0;
    // Mảng này sẽ lưu các sản phẩm lỗi (cả 2 loại: file có mà DB không, DB có mà file không khớp)
    const productsToCheck = [];

    console.log(`\nĐang tiến hành ${IS_DRY_RUN ? 'kiểm tra' : 'cập nhật'} ${updateData.length} sản phẩm...`);

    // 3. Thực hiện Update / Chạy thực
    for (const item of updateData) {
        recordsToUpdate++;
        const { originalFileName, relativeUrl } = item;

        const filter = { image: originalFileName };
        const update = { image: relativeUrl };

        console.log(`\n--- Mục ${recordsToUpdate}/${updateData.length} ---`);
        console.log(`Tên file gốc tìm kiếm: ${originalFileName}`);
        console.log(`URL mới (sẽ lưu): ${relativeUrl}`);

        try {
            // Lấy thông tin chi tiết cần thiết khi tìm thấy
            const product = await productModel.findOne(filter).select('_id name productCode barcode');

            if (product) {
                dbMatchCount++;
                console.log(`  ✅ TÌM THẤY sản phẩm: [ID: ${product._id}] - Tên: ${product.name}`);

                if (!IS_DRY_RUN) {
                    // Chế độ THỰC THI: Lưu vào DB
                    const result = await productModel.updateOne(filter, update);
                    if (result.modifiedCount > 0) {
                        dbUpdateSuccess++;
                        console.log(`  ✅ UPDATE THÀNH CÔNG (DB đã lưu): ${result.modifiedCount} bản ghi.`);
                    } else {
                        dbFailCount++;
                        // Trường hợp matchedCount=1, modifiedCount=0 nghĩa là dữ liệu đã giống nhau
                        if (result.matchedCount === 1) {
                            console.log(`  🔔 BỎ QUA: URL đã được cập nhật trước đó hoặc không cần thay đổi.`);
                        } else {
                            console.log(
                                `  ❌ LỖI UPDATE: Không có bản ghi nào được sửa đổi (matchedCount: ${result.matchedCount}).`,
                            );
                        }
                    }
                }
            } else {
                dbNotFound++;
                console.log(
                    `  ⚠️ KHÔNG TÌM THẤY sản phẩm nào khớp với Tên file gốc ${originalFileName} trong DB. Bỏ qua.`,
                );

                // Loại lỗi 1: File có, DB không tìm thấy
                productsToCheck.push({
                    originalFileName: originalFileName,
                    newRelativeUrl: relativeUrl,
                    reason: "File này không khớp với bất kỳ trường 'image' nào trong DB. Cần kiểm tra lại Tên file gốc.",
                });
            }
        } catch (error) {
            dbFailCount++;
            console.error(`  ❌ LỖI TRUY VẤN DB với Tên file gốc ${originalFileName}:`, error.message);
        }
    }

    // 4. BỔ SUNG: Kiểm tra các sản phẩm TỒN TẠI trong DB nhưng thiếu URL mới trong file .txt (Loại lỗi 2)
    console.log(`\n--- KIỂM TRA SẢN PHẨM CÓ THỂ ĐÃ BỊ BỎ SÓT TRONG FILE .TXT ---`);

    const allProducts = await productModel.find({}).select('_id name productCode barcode image').lean();
    let potentialMissingMatches = 0;

    for (const product of allProducts) {
        // Chỉ kiểm tra các sản phẩm có vẻ đang sử dụng tên file cũ (giả định bắt đầu bằng '17' - timestamp)
        if (product.image && product.image.startsWith('17')) {
            // Kiểm tra xem tên file cũ của sản phẩm này có nằm trong danh sách cần cập nhật hay không
            if (!originalFileNamesInTxt.has(product.image)) {
                // Kiểm tra xem image hiện tại trong DB đã phải là URL Cloudinary mới hay chưa
                const isAlreadyNewUrl = product.image.includes('/') && product.image.startsWith('v');

                if (!isAlreadyNewUrl) {
                    potentialMissingMatches++;
                    // Loại lỗi 2: DB có, File không có (hoặc tên file bị sai)
                    productsToCheck.push({
                        _id: product._id.toString(),
                        productCode: product.productCode,
                        barcode: product.barcode,
                        name: product.name,
                        oldImageInDB: product.image,
                        reason: 'Sản phẩm có trong DB nhưng tên file cũ KHÔNG có trong file .txt. Cần kiểm tra lại Tên file gốc.',
                    });
                }
            }
        }
    }

    console.log(`Đã phát hiện ${potentialMissingMatches} sản phẩm trong DB có thể bị thiếu URL mới.`);

    // 5. Kết quả Cuối cùng
    console.log('\n======================================================');
    console.log(`HOÀN TẤT CẬP NHẬT.`);
    console.log(`------------------------------------------------------`);
    console.log(`Tổng mục dữ liệu hợp lệ trong file: ${recordsToUpdate}`);
    console.log(`Tổng sản phẩm được TÌM THẤY và CẬP NHẬT: ${dbMatchCount}`);
    console.log(`Tổng mục trong file KHÔNG TÌM THẤY (Đã bỏ qua): ${dbNotFound}`);

    console.log(`\n--- KẾT QUẢ LƯU DB ---`);
    console.log(`Thành công (Đã Cập nhật): ${dbUpdateSuccess}`);
    console.log(`Thất bại (Lỗi DB/Lỗi Update): ${dbFailCount}`);

    // === BỔ SUNG: In ra danh sách các sản phẩm cần kiểm tra ===
    if (productsToCheck.length > 0) {
        console.log(`\n--- CHI TIẾT SẢN PHẨM CẦN KIỂM TRA/LỖI (${productsToCheck.length}) ---`);

        // Lưu ra file JSON
        try {
            fs.writeFileSync(FULL_OUTPUT_PATH, JSON.stringify(productsToCheck, null, 2));
            console.log(
                `\n💾 Đã lưu danh sách ${productsToCheck.length} sản phẩm cần kiểm tra (Bao gồm ProductCode/Barcode) ra file: ${OUTPUT_FILE}`,
            );
        } catch (e) {
            console.error(`❌ Lỗi khi ghi file ${OUTPUT_FILE}:`, e.message);
        }
    }
    // ===============================================================

    console.log('======================================================');

    await mongoose.disconnect();
};

updateProductUrls();
