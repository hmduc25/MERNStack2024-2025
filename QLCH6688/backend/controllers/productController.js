import productModel from '../models/productModel.js';
import fs from 'fs';
import path from 'path';

// Hàm xử lý lỗi tập trung
const handleMongoError = (res, error) => {
    console.error('Lỗi MongoDB:', error);
    if (error.name === 'ValidationError') {
        return res.status(400).json({ success: false, message: `Lỗi xác thực: ${error.message}` });
    }
    if (error.code === 11000) {
        // Kiểm tra lỗi trùng lặp cho trường barcode
        if (error.keyPattern && error.keyPattern.barcode) {
            return res.status(409).json({ success: false, message: `Mã vạch (barcode) đã tồn tại. ${error.message}` });
        }
        return res.status(409).json({ success: false, message: `Dữ liệu đã tồn tại (trùng lặp). ${error.message}` });
    }
    res.status(500).json({ success: false, message: `Lỗi máy chủ: ${error.message}` });
};

const addProduct = async (req, res) => {
    let image_filename = req.file ? `${req.file.filename}` : null;
    console.log('req.body: ', req.body);

    let batches = [];
    if (req.body.batches) {
        try {
            batches = JSON.parse(req.body.batches);
        } catch (error) {
            return res.status(400).json({ success: false, message: 'Lỗi trong việc parse batches' });
        }
    }

    const today = new Date();
    const todayISO = today.toISOString().split('T')[0];
    const futureDate = new Date(today);
    futureDate.setFullYear(2099);
    const defaultExpirationDate = futureDate.toISOString().split('T')[0];

    batches = batches.map((batch, index) => {
        const quantity = parseInt(batch.quantity);
        return {
            entryDate: batch.entryDate || todayISO,
            batchNumber: `BATCH${(index + 1).toString().padStart(3, '0')}`,
            expirationDate: batch.expirationDate || defaultExpirationDate,
            purchasePrice: parseInt(batch.purchasePrice),
            quantity: quantity,
            remaining: quantity,
        };
    });

    const totalQuantity = batches.reduce((sum, batch) => sum + batch.quantity, 0);

    const supplier = {
        name: req.body['supplier.name'],
        contact: req.body['supplier.contact'],
        address: req.body['supplier.address'],
    };

    const product = new productModel({
        productCode: req.body.productCode,
        barcode: req.body.barcode,
        name: req.body.name,
        category: req.body.category,
        brand: req.body.brand,
        purchasePrice: parseInt(req.body.purchasePrice),
        sellingPrice: parseInt(req.body.sellingPrice),
        unit: req.body.unit,
        totalQuantity: totalQuantity,
        description: req.body.description,
        notes: req.body.notes,
        supplier: supplier,
        image: image_filename,
        productStatus: req.body.productStatus,
        batches: batches,
    });

    try {
        console.log('BA_product: ', product);
        await product.save();
        res.json({ success: true, message: 'Đã thêm sản phẩm thành công', data: product });
    } catch (error) {
        handleMongoError(res, error);
    }
};

const updateProduct = async (req, res) => {
    try {
        const productId = req.params.id;
        const updatedData = req.body;
        const newImageFilename = req.file ? `${req.file.filename}` : null;

        const product = await productModel.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Sản phẩm không tồn tại' });
        }

        if (updatedData.productCode && updatedData.productCode !== product.productCode) {
            return res.status(400).json({ success: false, message: 'Không thể thay đổi productCode' });
        }

        if (newImageFilename) {
            if (product.image) {
                const oldImagePath = path.join('uploads', product.image);

                try {
                    // Kiểm tra xem file có tồn tại không trước khi xóa
                    if (fs.existsSync(oldImagePath)) {
                        fs.unlinkSync(oldImagePath); // Sử dụng fs.unlinkSync để đồng bộ và dễ xử lý lỗi
                        console.log('Đã xóa ảnh cũ thành công:', oldImagePath);
                    } else {
                        console.log('Tệp ảnh cũ không tồn tại:', oldImagePath);
                    }
                } catch (err) {
                    console.error('Lỗi khi xóa ảnh cũ:', err);
                }
            }
            updatedData.image = newImageFilename;
        }

        const today = new Date();
        const todayISO = today.toISOString().split('T')[0];
        const futureDate = new Date(today);
        futureDate.setFullYear(2099);
        const defaultExpirationDate = futureDate.toISOString().split('T')[0];

        // Cập nhật các trường dữ liệu chung của sản phẩm
        product.barcode = updatedData.barcode || product.barcode;
        product.name = updatedData.name || product.name;
        product.category = updatedData.category || product.category;
        product.brand = updatedData.brand || product.brand;
        product.purchasePrice = updatedData.purchasePrice ? parseInt(updatedData.purchasePrice) : product.purchasePrice;
        product.sellingPrice = updatedData.sellingPrice ? parseInt(updatedData.sellingPrice) : product.sellingPrice;
        product.unit = updatedData.unit || product.unit;
        product.productStatus = updatedData.productStatus || product.productStatus;
        product.description = updatedData.description || product.description;
        product.notes = updatedData.notes || product.notes;
        product.image = newImageFilename || product.image;

        if (updatedData.batches) {
            let newBatches = [];
            try {
                newBatches = JSON.parse(updatedData.batches);
            } catch (error) {
                return res.status(400).json({ success: false, message: 'Lỗi trong việc parse batches' });
            }

            const existingBatchesMap = new Map(product.batches.map((batch) => [batch._id.toString(), batch]));
            const newBatchesToProcess = new Map(newBatches.map((batch) => [batch._id, batch]));

            // Xóa các batches đã bị gỡ bỏ
            product.batches.forEach((batch) => {
                if (!newBatchesToProcess.has(batch._id.toString())) {
                    product.batches.pull(batch._id);
                }
            });

            // Cập nhật các batches đã tồn tại và thêm các batches mới
            newBatches.forEach((newBatch) => {
                const existingBatch = existingBatchesMap.get(newBatch._id);

                if (existingBatch) {
                    // Cập nhật lô hàng đã tồn tại
                    const quantity = parseInt(newBatch.quantity);
                    if (parseInt(existingBatch.quantity) !== quantity) {
                        existingBatch.quantity = quantity;
                        existingBatch.remaining = quantity;
                    }
                    existingBatch.entryDate = newBatch.entryDate || todayISO;
                    existingBatch.expirationDate = newBatch.expirationDate || defaultExpirationDate;
                    existingBatch.purchasePrice = parseInt(newBatch.purchasePrice);
                } else {
                    // Thêm lô hàng mới
                    const quantity = parseInt(newBatch.quantity);
                    const newBatchNumber = `BATCH${(product.batches.length + 1).toString().padStart(3, '0')}`;
                    product.batches.push({
                        entryDate: newBatch.entryDate || todayISO,
                        batchNumber: newBatchNumber,
                        expirationDate: newBatch.expirationDate || defaultExpirationDate,
                        purchasePrice: parseInt(newBatch.purchasePrice),
                        quantity: quantity,
                        remaining: quantity,
                    });
                }
            });

            // Tính lại totalQuantity dựa trên các batches hiện có
            const newTotalQuantity = product.batches.reduce((sum, batch) => sum + batch.remaining, 0);
            product.totalQuantity = newTotalQuantity;
        }

        // Lưu lại sản phẩm đã cập nhật
        await product.save();
        res.json({ success: true, message: 'Cập nhật sản phẩm thành công', data: product });
    } catch (error) {
        handleMongoError(res, error);
    }
};

// Danh sách tất cả sản phẩm
const listAllProducts = async (req, res) => {
    try {
        const products = await productModel.find({});
        res.json({ success: true, data: products });
    } catch (error) {
        handleMongoError(res, error);
    }
};

// Xoá sản phẩm
const removeProduct = async (req, res) => {
    try {
        const product = await productModel.findById(req.body.id);
        if (product) {
            // Xoá ảnh trong `uploads`
            fs.unlink(`uploads/${product.image}`, () => {});
        }
        await productModel.findByIdAndDelete(req.body.id);
        res.json({ success: true, message: `Đã xóa sản phẩm thành công ${req.body.id}` });
    } catch (error) {
        handleMongoError(res, error);
    }
};

// Thêm lô hàng mới (cập nhật thông tin lô hàng cho sản phẩm)
const addBatchToProduct = async (req, res) => {
    const { productCode, entryDate, expirationDate, purchasePrice, quantity } = req.body;

    if (!productCode || !entryDate || !purchasePrice || !quantity) {
        return res.status(400).json({ success: false, message: 'Thông tin không đầy đủ' });
    }

    try {
        const product = await productModel.findOne({ productCode });
        if (!product) {
            return res.status(404).json({ success: false, message: 'Sản phẩm không tìm thấy' });
        }

        const today = new Date();
        const defaultExpirationDate = new Date(today.getFullYear() + 74, today.getMonth(), today.getDate())
            .toISOString()
            .split('T')[0];
        const newBatchNumber = `BATCH${(product.batches.length + 1).toString().padStart(3, '0')}`;
        const newQuantity = parseInt(quantity);

        const newBatch = {
            entryDate,
            batchNumber: newBatchNumber,
            expirationDate: expirationDate || defaultExpirationDate,
            purchasePrice: parseInt(purchasePrice),
            quantity: newQuantity,
            remaining: newQuantity, // Gán remaining = quantity
        };

        product.batches.push(newBatch);

        product.totalQuantity += newQuantity;

        await product.save();
        res.json({ success: true, message: 'Đã thêm lô hàng thành công', data: product });
    } catch (error) {
        handleMongoError(res, error);
    }
};

// Lấy mã sản phẩm cuối cùng và tạo mã barcode tương ứng
const getLastProductCode = async (req, res) => {
    try {
        const lastProduct = await productModel.findOne().sort({ createdAt: -1 }).select('productCode');
        const lastProductCode = lastProduct?.productCode || 'SP000000';
        const lastNumber = parseInt(lastProductCode.substring(2));

        // Tăng giá trị số lên 1 cho mã sản phẩm mới
        const newProductNumber = (lastNumber + 1).toString().padStart(6, '0');
        const newProductCode = `SP${newProductNumber}`;

        // Tăng giá trị số lên 1 cho mã vạch tùy chỉnh mới
        const newBarcodeNumber = (lastNumber + 1).toString().padStart(9, '0');
        const newCustomBarcode = `SKU_${newBarcodeNumber}`;

        // Gửi dữ liệu về frontend
        res.json({
            success: true,
            lastCode: newProductCode,
            customBarcode: newCustomBarcode,
        });
    } catch (error) {
        handleMongoError(res, error);
    }
};

const getDetailProduct = async (req, res) => {
    try {
        const product = await productModel.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Sản phẩm không tồn tại' });
        }
        res.json(product);
    } catch (error) {
        handleMongoError(res, error);
    }
};

const getDistinctBrands = async (req, res) => {
    try {
        // Lấy danh sách các brand không trùng lặp
        const brands = await productModel.distinct('brand');
        res.status(200).json(brands);
    } catch (error) {
        handleMongoError(res, error);
    }
};

const getDistinctUnits = async (req, res) => {
    try {
        // Lấy danh sách các unit không trùng lặp
        const units = await productModel.distinct('unit');
        res.status(200).json(units);
    } catch (error) {
        handleMongoError(res, error);
    }
};

const getDistinctSuppliers = async (req, res) => {
    try {
        // Lấy danh sách các supplier.name không trùng lặp
        const suppliers = await productModel.distinct('supplier.name');
        res.status(200).json(suppliers);
    } catch (error) {
        handleMongoError(res, error);
    }
};

const updateAllBrands = async (req, res) => {
    try {
        const brandMap = {
            ACECOOK: 'acecook',
            acecook: 'acecook',
            CHINSU: 'chinsu',
            Chinsu: 'chinsu',
            'CUNG ĐÌNH FOODS': 'cungdinhfoods',
            'cung đình foods': 'cungdinhfoods',
            cungdinhfoods: 'cungdinhfoods',
            DOUBLEMINT: 'doublemint',
            'DUNG LOI COFFEE': 'dungloicoffee',
            KHATOCO: 'khatoco',
            MACCOFFEE: 'maccoffee',
            MASAN: 'masan',
            masan: 'masan',
            MiCOEM: 'micoem',
            ONEONE: 'oneone',
            'State Express': 'stateexpress',
            VIFON: 'vifon',
            VINATABA: 'vinataba',
            vinataba: 'vinataba',
            'White Horse': 'whitehorse',
            other: 'other',
        };

        // Lấy tất cả sản phẩm từ cơ sở dữ liệu
        const products = await productModel.find({});

        // Duyệt qua từng sản phẩm và cập nhật brand
        for (const product of products) {
            const currentBrand = product.brand;
            const newBrand = brandMap[currentBrand] || 'other'; // Gán 'other' nếu không khớp

            if (currentBrand !== newBrand) {
                product.brand = newBrand; // Cập nhật brand mới
                await product.save(); // Lưu sản phẩm
            }
        }

        res.status(200).json({ success: true, message: 'Cập nhật thương hiệu thành công' });
    } catch (error) {
        handleMongoError(res, error);
    }
};

export {
    addProduct,
    updateProduct,
    listAllProducts,
    removeProduct,
    addBatchToProduct,
    getLastProductCode,
    getDetailProduct,
    getDistinctBrands,
    getDistinctUnits,
    getDistinctSuppliers,
    updateAllBrands,
};
