import productModel from '../models/productModel.js';
import fs from 'fs';

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

    batches = batches.map((batch, index) => {
        const quantity = parseInt(batch.quantity);
        return {
            entryDate: batch.entryDate,
            batchNumber: `BATCH${(index + 1).toString().padStart(3, '0')}`,
            expirationDate: batch.expirationDate,
            purchasePrice: parseInt(batch.purchasePrice),
            quantity: quantity,
            remaining: quantity, // Gán remaining = quantity khi tạo mới
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
        stock: parseInt(req.body.stock),
        description: req.body.description,
        notes: req.body.notes,
        supplier: supplier,
        image: image_filename,
        batches: batches,
    });

    try {
        console.log('BA_product: ', product);
        await product.save();
        res.json({ success: true, message: 'Đã thêm sản phẩm thành công', data: product });
    } catch (error) {
        res.status(500).json({ success: false, message: `Lỗi: ${error.message}` });
    }
};

const updateProduct = async (req, res) => {
    let image_filename = req.file ? `${req.file.filename}` : null;
    try {
        const productId = req.params.id;
        const updatedData = req.body;

        const product = await productModel.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Sản phẩm không tồn tại' });
        }

        if (updatedData.productCode && updatedData.productCode !== product.productCode) {
            return res.status(400).json({ success: false, message: 'Không thể thay đổi productCode' });
        }

        if (image_filename) {
            updatedData.image = image_filename;
        }

        // Cập nhật các trường dữ liệu chung của sản phẩm
        product.barcode = updatedData.barcode || product.barcode;
        product.name = updatedData.name || product.name;
        product.category = updatedData.category || product.category;
        product.brand = updatedData.brand || product.brand;
        product.purchasePrice = updatedData.purchasePrice ? parseInt(updatedData.purchasePrice) : product.purchasePrice;
        product.sellingPrice = updatedData.sellingPrice ? parseInt(updatedData.sellingPrice) : product.sellingPrice;
        product.unit = updatedData.unit || product.unit;
        product.stock = updatedData.stock ? parseInt(updatedData.stock) : product.stock;
        product.description = updatedData.description || product.description;
        product.notes = updatedData.notes || product.notes;
        product.image = updatedData.image || product.image;

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
                    existingBatch.entryDate = newBatch.entryDate;
                    existingBatch.expirationDate = newBatch.expirationDate;
                    existingBatch.purchasePrice = parseInt(newBatch.purchasePrice);
                } else {
                    // Thêm lô hàng mới
                    const quantity = parseInt(newBatch.quantity);
                    const newBatchNumber = `BATCH${(product.batches.length + 1).toString().padStart(3, '0')}`;
                    product.batches.push({
                        entryDate: newBatch.entryDate,
                        batchNumber: newBatchNumber,
                        expirationDate: newBatch.expirationDate,
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
        res.status(500).json({ success: false, message: `Lỗi: ${error.message}` });
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

// Thêm lô hàng mới (cập nhật thông tin lô hàng cho sản phẩm)
const addBatchToProduct = async (req, res) => {
    const { productCode, entryDate, expirationDate, purchasePrice, quantity } = req.body;

    if (!productCode || !entryDate || !expirationDate || !purchasePrice || !quantity) {
        return res.status(400).json({ success: false, message: 'Thông tin không đầy đủ' });
    }

    try {
        const product = await productModel.findOne({ productCode });
        if (!product) {
            return res.status(404).json({ success: false, message: 'Sản phẩm không tìm thấy' });
        }

        const newBatchNumber = `BATCH${(product.batches.length + 1).toString().padStart(3, '0')}`;
        const newQuantity = parseInt(quantity);

        const newBatch = {
            entryDate,
            batchNumber: newBatchNumber,
            expirationDate,
            purchasePrice: parseInt(purchasePrice),
            quantity: newQuantity,
            remaining: newQuantity, // Gán remaining = quantity
        };

        product.batches.push(newBatch);

        product.totalQuantity += newQuantity;

        await product.save();
        res.json({ success: true, message: 'Đã thêm lô hàng thành công', data: product });
    } catch (error) {
        res.status(500).json({ success: false, message: `Lỗi: ${error.message}` });
    }
};

// Lấy mã sản phẩm cuối cùng
const getLastProductCode = async (req, res) => {
    try {
        const lastProduct = await productModel.findOne().sort({ createdAt: -1 }).select('productCode');
        const lastCode = lastProduct?.productCode || 'SP000000'; // Nếu không có sản phẩm nào, bắt đầu từ SP000000
        res.json({ success: true, lastCode });
    } catch (error) {
        res.status(500).json({ success: false, message: `Lỗi: ${error.message}` });
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
        res.status(500).json({ message: 'Lỗi máy chủ' });
    }
};

const getDistinctBrands = async (req, res) => {
    try {
        // Lấy danh sách các brand không trùng lặp
        const brands = await productModel.distinct('brand');
        res.status(200).json(brands);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi lấy danh sách brand', error });
    }
};

const getDistinctUnits = async (req, res) => {
    try {
        // Lấy danh sách các unit không trùng lặp
        const units = await productModel.distinct('unit');
        res.status(200).json(units);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi lấy danh sách unit', error });
    }
};

const getDistinctSuppliers = async (req, res) => {
    try {
        // Lấy danh sách các supplier.name không trùng lặp
        const suppliers = await productModel.distinct('supplier.name');
        res.status(200).json(suppliers);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi lấy danh sách nhà cung cấp', error });
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
        res.status(500).json({ success: false, message: 'Lỗi khi cập nhật thương hiệu', error });
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
