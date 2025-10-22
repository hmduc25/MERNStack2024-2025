// massUpload.js
import dotenv from 'dotenv';
dotenv.config();

import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';

import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// --------------------------------------------------

// --- CẤU HÌNH ---
const UPLOADS_DIR = 'D:\\DataOfDevelopers\\Projects\\MERNStack\\MERNStack2024-2025\\QLCH6688\\backend\\uploads';
const CLOUDINARY_FOLDER = 'products';
const OUTPUT_FILE = path.join(__dirname, 'cloudinary_urls.txt');

// Cấu hình Cloudinary từ biến môi trường
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
});

// Hàm Upload một file
const uploadSingleFile = (filePath, publicId) => {
    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload(
            filePath,
            {
                folder: CLOUDINARY_FOLDER,
                public_id: publicId, // Đặt Public ID chính xác
                overwrite: false, // Không ghi đè nếu đã tồn tại
                resource_type: 'image', // Đảm bảo là ảnh
            },
            (error, result) => {
                if (error) {
                    return reject(error);
                }
                resolve(result);
            },
        );
    });
};

// Hàm chính thực hiện Mass Upload
const massUploadAndLog = async () => {
    console.log(`Bắt đầu upload từ: ${UPLOADS_DIR}`);
    let files;
    let successfulUploads = [];

    // Đọc thư mục
    try {
        files = fs.readdirSync(UPLOADS_DIR);
        // Xóa file log cũ nếu tồn tại
        if (fs.existsSync(OUTPUT_FILE)) {
            fs.unlinkSync(OUTPUT_FILE);
        }
    } catch (err) {
        console.error('❌ Lỗi khi đọc thư mục hoặc xóa file log:', err.message);
        return;
    }

    // Lặp qua từng file và upload
    for (const file of files) {
        const filePath = path.join(UPLOADS_DIR, file);
        const fileExt = path.extname(file).toLowerCase();

        // Bỏ qua các file không phải ảnh (ví dụ: .txt)
        if (!['.png', '.jpg', '.jpeg', '.gif'].includes(fileExt)) {
            console.log(`⚠️ Bỏ qua file: ${file} (Không phải định dạng ảnh)`);
            continue;
        }

        // Trích xuất Public ID: Tên file không đuôi
        const publicId = path.parse(file).name;

        console.log(`Đang xử lý: ${file} -> Public ID: ${CLOUDINARY_FOLDER}/${publicId}`);

        try {
            const result = await uploadSingleFile(filePath, publicId);
            // Lưu lại Public ID và URL
            successfulUploads.push({
                original_file: file,
                public_id: result.public_id,
                url: result.secure_url,
            });
            console.log(`  ✅ Thành công. URL: ${result.secure_url}`);
        } catch (error) {
            if (error.http_code === 400 && error.message.includes('already exists')) {
                console.log(`  ⚠️ File đã tồn tại trên Cloudinary: ${CLOUDINARY_FOLDER}/${publicId}. Bỏ qua upload.`);
                // Vẫn cần lấy URL để ghi log nếu file đã tồn tại
                // Dùng cách thủ công để tạo URL nếu bạn chắc chắn cấu trúc.
                const existingURL = cloudinary.url(publicId, {
                    secure: true,
                    folder: CLOUDINARY_FOLDER,
                    format: fileExt.substring(1), // Lấy đuôi file
                });
                successfulUploads.push({
                    original_file: file,
                    public_id: `${CLOUDINARY_FOLDER}/${publicId}`,
                    url: existingURL,
                });
            } else {
                console.error(`  ❌ LỖI upload file ${file}:`, error.message);
            }
        }
    }

    // Ghi kết quả vào file TXT
    if (successfulUploads.length > 0) {
        const logData = successfulUploads.map((item) => `${item.original_file} => ${item.url}`).join('\n');

        fs.writeFileSync(OUTPUT_FILE, logData, 'utf8');
        console.log(`\n--- Quá trình hoàn tất. Đã upload/xử lý thành công ${successfulUploads.length} file. ---`);
        console.log(`🔔 Danh sách URL đã được ghi vào file: ${OUTPUT_FILE}`);
    } else {
        console.log('\n--- Hoàn tất. Không có file ảnh nào được upload thành công. ---');
    }
};

massUploadAndLog();
