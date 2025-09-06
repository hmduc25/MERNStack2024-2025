// productModel.js
import mongoose from 'mongoose';

const batchSchema = new mongoose.Schema({
    entryDate: { type: String },
    batchNumber: { type: String, required: true },
    expirationDate: { type: String },
    purchasePrice: { type: Number, required: true },
    quantity: { type: Number, required: true },
    remaining: { type: Number, required: true },
});

const productSchema = new mongoose.Schema({
    productCode: { type: String, required: true, unique: true },
    barcode: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    category: { type: String, required: true },
    brand: { type: String },
    purchasePrice: { type: Number, required: true },
    sellingPrice: { type: Number, required: true },
    unit: { type: String, required: true },
    totalQuantity: { type: Number, required: true },
    description: { type: String },
    notes: { type: String },
    supplier: {
        name: { type: String, required: true },
        contact: { type: String },
        address: { type: String },
    },
    image: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    batches: [batchSchema],
    productStatus: {
        type: String,
        enum: ['active', 'inactive', 'hidden'],
        default: 'active',
    },
});

// Middleware để tự động cập nhật `updatedAt` khi chỉnh sửa
productSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

const productModel = mongoose.model.Product || mongoose.model('Product', productSchema);

export default productModel;
