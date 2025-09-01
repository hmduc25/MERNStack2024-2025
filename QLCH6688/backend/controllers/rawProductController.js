// File: backend/controllers/rawProductController.js

import rawProductModel from '../models/rawProductModel.js';

// Thêm một sản phẩm thô vào collection
const addRawProduct = async (req, res) => {
    try {
        const { productCode, barcode, name, sellingPrice, note } = req.body;

        const newRawProduct = new rawProductModel({
            productCode,
            barcode,
            name,
            sellingPrice,
            note,
        });

        await newRawProduct.save();
        res.status(201).json({ success: true, message: 'Đã thêm sản phẩm thô thành công', data: newRawProduct });
    } catch (error) {
        res.status(500).json({ success: false, message: `Lỗi khi thêm sản phẩm thô: ${error.message}` });
    }
};

// Lấy tất cả các sản phẩm thô
const listRawProducts = async (req, res) => {
    try {
        const rawProducts = await rawProductModel.find({});
        res.json({ success: true, data: rawProducts });
    } catch (error) {
        res.status(500).json({ success: false, message: `Lỗi khi lấy danh sách sản phẩm thô: ${error.message}` });
    }
};

// Xóa một sản phẩm thô
const removeRawProduct = async (req, res) => {
    try {
        const { id } = req.body;
        const result = await rawProductModel.findByIdAndDelete(id);

        if (!result) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm thô để xóa' });
        }

        res.json({ success: true, message: `Đã xóa sản phẩm thô thành công` });
    } catch (error) {
        res.status(500).json({ success: false, message: `Lỗi khi xóa sản phẩm thô: ${error.message}` });
    }
};

export { addRawProduct, listRawProducts, removeRawProduct };
