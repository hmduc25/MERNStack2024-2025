import productModel from '../models/productModel.js';
import fs from 'fs';
import path from 'path';
import cloudinary from '../config/cloudinaryConfig.js';

// --- Hằng số để dễ dàng trích xuất Relative URL ---
// Đảm bảo CLOUDINARY_UPLOAD_SEGMENT khớp với phần Base URL của bạn
const CLOUDINARY_UPLOAD_SEGMENT = 'https://res.cloudinary.com/duntfc4ff/image/upload/';

// Hàm xử lý lỗi tập trung
const handleMongoError = (res, error) => {
    console.error('Lỗi MongoDB:', error);
    if (error.name === 'ValidationError') {
        return res.status(400).json({ success: false, message: `Lỗi xác thực: ${error.message}` });
    }
    if (error.code === 11000) {
        // Kiểm tra lỗi trùng lặp cho trường barcode
        if (error.keyPattern && error.keyPattern.barcode) {
            return res.status(409).json({ success: false, message: `Mã vạch (barcode) đã tồn tại.` });
        }
        return res.status(409).json({ success: false, message: `Dữ liệu đã tồn tại (trùng lặp).` });
    }
    res.status(500).json({ success: false, message: `Lỗi máy chủ: ${error.message}` });
};

// ------------------------------------------------------------------
// --- HÀM HỖ TRỢ CHO CLOUDINARY ---
// ------------------------------------------------------------------

/**
 * Trích xuất Relative URL (phần sau /upload/) từ Full URL Cloudinary.
 * @param {string} fullUrl - Full URL trả về từ Cloudinary (req.file.path).
 * @returns {string} Relative URL (ví dụ: v1234/folder/file.jpg)
 */
const extractRelativeUrl = (fullUrl) => {
    if (!fullUrl || !fullUrl.startsWith(CLOUDINARY_UPLOAD_SEGMENT)) {
        return fullUrl; // Trả về nguyên gốc nếu không khớp
    }
    // Trả về phần sau CLOUDINARY_UPLOAD_SEGMENT
    return fullUrl.substring(CLOUDINARY_UPLOAD_SEGMENT.length);
};

/**
 * Lấy public_id từ URL. Hỗ trợ cả Full URL và Relative URL.
 * @param {string} url - Full URL hoặc Relative URL của Cloudinary.
 * @returns {string|null} Public ID (ví dụ: mern-product-images/1732694843350-thuoc-la-ngua)
 */
const getPublicIdFromUrl = (url) => {
    if (!url) return null;
    try {
        let pathWithVersionAndExtension;

        if (url.startsWith('http')) {
            // Trường hợp Full URL (như từ req.file.path hoặc bản ghi cũ)
            const parts = url.split('/upload/');
            if (parts.length < 2) return null;
            pathWithVersionAndExtension = parts[1];
        } else {
            // Trường hợp Relative URL (đã được lưu trong DB)
            pathWithVersionAndExtension = url;
        }

        // Loại bỏ version (ví dụ: 'v1678888888/') nếu có
        const versionMatch = pathWithVersionAndExtension.match(/^v\d+\//);
        if (versionMatch) {
            pathWithVersionAndExtension = pathWithVersionAndExtension.substring(versionMatch[0].length);
        }

        // Loại bỏ phần mở rộng
        const lastDotIndex = pathWithVersionAndExtension.lastIndexOf('.');
        if (lastDotIndex > 0) {
            pathWithVersionAndExtension = pathWithVersionAndExtension.substring(0, lastDotIndex);
        }

        // Public ID chính là phần còn lại (bao gồm cả folder name)
        return pathWithVersionAndExtension;
    } catch (e) {
        console.error('❌ Lỗi khi trích xuất Public ID:', e);
        return null;
    }
};

// ------------------------------------------------------------------
// --- CRUD OPERATIONS ĐÃ SỬA ĐỔI ---
// ------------------------------------------------------------------

const addProduct = async (req, res) => {
    let image_full_url = req.file ? req.file.path : null;

    // 🛑 Lấy Relative URL để lưu vào DB
    let image_relative_url = image_full_url ? extractRelativeUrl(image_full_url) : null;

    // console.log('req.body: ', req.body); // DEBUG
    // console.log('Image Relative URL to save:', image_relative_url); // DEBUG

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
            // Sửa logic batch number nếu cần, tạm giữ nguyên
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
        image: image_relative_url, // 🛑 LƯU RELATIVE URL
        productStatus: req.body.productStatus,
        batches: batches,
    });

    try {
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
        // req.file.path là FULL URL của ảnh mới đã được Cloudinary trả về
        const newImageFullURL = req.file ? req.file.path : null;

        // 🛑 Lấy Relative URL để lưu vào DB
        const newImageRelativeURL = newImageFullURL ? extractRelativeUrl(newImageFullURL) : null;

        const product = await productModel.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Sản phẩm không tồn tại' });
        }

        if (updatedData.productCode && updatedData.productCode !== product.productCode) {
            return res.status(400).json({ success: false, message: 'Không thể thay đổi productCode' });
        }

        // --- LOGIC XÓA ẢNH CŨ TRÊN CLOUDINARY ---
        if (newImageFullURL) {
            // Kiểm tra xem sản phẩm đã có ảnh cũ chưa
            if (product.image) {
                const oldImage = product.image; // Có thể là Full hoặc Relative URL

                // Hàm getPublicIdFromUrl xử lý cả hai loại URL
                const publicId = getPublicIdFromUrl(oldImage);

                if (publicId) {
                    try {
                        const destructionResult = await cloudinary.uploader.destroy(publicId);

                        if (destructionResult.result === 'ok') {
                            console.log(`✅ Đã xóa ảnh cũ trên Cloudinary thành công: ${publicId}`);
                        } else {
                            console.log(
                                `⚠️ Cloudinary báo lỗi xóa hoặc publicId không hợp lệ: ${publicId}. Result: ${destructionResult.result}`,
                            );
                        }
                    } catch (err) {
                        console.error('❌ Lỗi THỰC SỰ khi gọi API xóa Cloudinary:', err.message);
                    }
                } else {
                    console.log('⚠️ Không thể trích xuất Public ID từ URL cũ. Bỏ qua việc xóa ảnh cũ.');
                }
            }
            updatedData.image = newImageRelativeURL;
        }

        // --- CẬP NHẬT TRƯỜNG DỮ LIỆU CƠ BẢN ---
        const today = new Date();
        const todayISO = today.toISOString().split('T')[0];
        const futureDate = new Date(today);
        futureDate.setFullYear(2099);
        const defaultExpirationDate = futureDate.toISOString().split('T')[0];

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
        product.image = newImageRelativeURL || product.image; // 🛑 Cập nhật trường image với Relative URL mới

        // --- LOGIC XỬ LÝ BATCHES (GIỮ NGUYÊN) ---
        if (updatedData.batches) {
            let newBatches = [];
            try {
                newBatches = JSON.parse(updatedData.batches);
            } catch (error) {
                console.error('Lỗi khi parse batches:', error.message);
                return res.status(400).json({ success: false, message: 'Lỗi trong việc parse batches' });
            }

            const existingBatchesMap = new Map(product.batches.map((batch) => [batch._id.toString(), batch]));
            const newBatchesToProcess = new Map(newBatches.map((batch) => [batch._id, batch]));

            product.batches.forEach((batch) => {
                if (!newBatchesToProcess.has(batch._id.toString())) {
                    product.batches.pull(batch._id);
                }
            });

            newBatches.forEach((newBatch) => {
                const existingBatch = existingBatchesMap.get(newBatch._id);

                if (existingBatch) {
                    const quantity = parseInt(newBatch.quantity);
                    if (parseInt(existingBatch.quantity) !== quantity) {
                        existingBatch.quantity = quantity;
                        existingBatch.remaining = quantity;
                    }
                    existingBatch.entryDate = newBatch.entryDate || todayISO;
                    existingBatch.expirationDate = newBatch.expirationDate || defaultExpirationDate;
                    existingBatch.purchasePrice = parseInt(newBatch.purchasePrice);
                } else {
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

const removeProduct = async (req, res) => {
    try {
        const product = await productModel.findById(req.body.id);
        if (product && product.image) {
            // product.image là Relative URL
            const publicId = getPublicIdFromUrl(product.image); // Lấy public_id từ Relative URL

            if (publicId) {
                try {
                    await cloudinary.uploader.destroy(publicId);
                    console.log('Đã xóa ảnh sản phẩm trên Cloudinary thành công:', publicId);
                } catch (err) {
                    console.error('Lỗi khi xóa ảnh trên Cloudinary:', err);
                    // Tiếp tục xóa sản phẩm khỏi DB dù việc xóa ảnh Cloudinary có lỗi
                }
            }
        }
        await productModel.findByIdAndDelete(req.body.id);
        res.json({ success: true, message: `Đã xóa sản phẩm thành công ${req.body.id}` });
    } catch (error) {
        handleMongoError(res, error);
    }
};

// ------------------------------------------------------------------
// --- CÁC HÀM KHÁC (GIỮ NGUYÊN) ---
// ------------------------------------------------------------------

const listAllProducts = async (req, res) => {
    try {
        const products = await productModel.find({});
        res.json({ success: true, data: products });
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
            remaining: newQuantity,
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
        const brands = await productModel.distinct('brand');
        res.status(200).json(brands);
    } catch (error) {
        handleMongoError(res, error);
    }
};

const getDistinctUnits = async (req, res) => {
    try {
        const units = await productModel.distinct('unit');
        res.status(200).json(units);
    } catch (error) {
        handleMongoError(res, error);
    }
};

const getDistinctSuppliers = async (req, res) => {
    try {
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

        const products = await productModel.find({});

        for (const product of products) {
            const currentBrand = product.brand;
            const newBrand = brandMap[currentBrand] || 'other';

            if (currentBrand !== newBrand) {
                product.brand = newBrand;
                await product.save();
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
