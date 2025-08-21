import express from 'express';
import { addProduct, listAllProducts, removeProduct } from '../controllers/productController.js';
import multer from 'multer';

const productRouter = express.Router();

const storage = multer.diskStorage({
    destination: 'uploads',
    filename: (req, file, cb) => {
        return cb(null, `${Date.now()}-${file.originalname}`);
    },
});

const upload = multer({ storage: storage });

productRouter.post('/themsanpham', upload.single('image'), addProduct);
productRouter.get('/danhsachsanpham', listAllProducts);
productRouter.post('/xoasanpham', removeProduct);

export default productRouter;
