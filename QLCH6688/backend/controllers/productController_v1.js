import productModel from '../models/productModel.js';
import fs from 'fs';

// Thêm sản phẩm mới
const addProduct = async (req, res) => {
    let image_filename = `${req.file.filename}`;

    console.log('ProductController_req-body: ', req.body);
    console.log('ProductController_req.file: ', req.file);

    const product = new productModel({
        productCode: req.body.productCode,
        barcode: req.body.barcode,
        name: req.body.name,
        category: req.body.category,
        brand: req.body.brand,
        purchasePrice: req.body.purchasePrice,
        sellingPrice: req.body.sellingPrice,
        unit: req.body.unit,
        stock: req.body.stock,
        description: req.body.description,
        notes: req.body.notes,
        supplier: {
            name: req.body.supplierName,
            contact: req.body.supplierContact,
            address: req.body.supplierAddress,
            email: req.body.supplierEmail,
        },
        image: image_filename,
    });

    try {
        await product.save();
        res.json({ success: true, message: 'Đã thêm sản phẩm thành công' });
    } catch (error) {
        res.json({ success: false, message: `Lỗi: ${error.message}` });
    }
};

// Danh sách tất cả sản phẩm
const listAllProducts = async (req, res) => {
    try {
        const products = await productModel.find({});
        res.json({ success: true, data: products });
    } catch (error) {
        res.json({ success: false, message: `Lỗi: ${error.message}` });
    }
};

// Xoá sản phẩm
const removeProduct = async (req, res) => {
    try {
        const product = await productModel.findById(req.body.id);

        // Xoá ảnh trong `uploads`
        fs.unlink(`uploads/${product.image}`, () => {});

        await productModel.findByIdAndDelete(req.body.id);
        res.json({ success: true, message: `Đã xóa sản phẩm thành công ${req.body.id}` });
    } catch (error) {
        res.json({ success: false, message: `Lỗi: ${error.message}` });
    }
};

export { addProduct, listAllProducts, removeProduct };
