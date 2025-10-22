import express from 'express';
import {
    addProduct,
    updateProduct,
    listAllProducts,
    removeProduct,
    addBatchToProduct,
    getLastProductCode,
    getDetailProduct,
    getDistinctBrands,
    getDistinctUnits,
    updateAllBrands,
    getDistinctSuppliers,
} from '../controllers/productController.js';
import multer from 'multer';

import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinaryConfig.js';

const productRouter = express.Router();

// CẤU HÌNH LƯU TRỮ CLOUDINARY
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'products',
        allowed_formats: ['jpeg', 'jpg', 'png'],
        public_id: (req, file) => `${Date.now()}-${file.originalname.split('.')[0]}`,
    },
});

// // Cấu hình lưu trữ ảnh
// const storage = multer.diskStorage({
//     destination: 'uploads',
//     filename: (req, file, cb) => {
//         return cb(null, `${Date.now()}-${file.originalname}`);
//     },
// });

const upload = multer({ storage: storage });

// Route thêm sản phẩm mới
productRouter.post('/themsanpham', upload.single('image'), addProduct);

// Route cập nhật sản phẩm
productRouter.put('/capnhatsanpham/:id', upload.single('image'), updateProduct);

// Route danh sách tất cả sản phẩm
productRouter.get('/danhsachsanpham', listAllProducts);

// Route xoá sản phẩm
productRouter.post('/xoasanpham', removeProduct);

// Route nhập hàng (cập nhật lô hàng cho sản phẩm)
productRouter.post('/nhaphang', addBatchToProduct);

// Route Chi tiết sản phẩm
productRouter.get('/chitietsanpham/:id', getDetailProduct);

// Route nhập hàng (cập nhật lô hàng cho sản phẩm)
productRouter.get('/laymasanphamcuoicung', getLastProductCode);

productRouter.get('/laytatcabrand', getDistinctBrands);

productRouter.get('/laytatcaunit', getDistinctUnits);

productRouter.get('/laytatcanpp', getDistinctSuppliers);

productRouter.get('/formatallbrand', updateAllBrands);

export default productRouter;
