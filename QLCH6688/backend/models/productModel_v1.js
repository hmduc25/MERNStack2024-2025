import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    productCode: { type: String, required: true, unique: true }, // Mã hàng
    barcode: { type: String, required: true, unique: true }, // Mã vạch
    name: { type: String, required: true }, // Tên sản phẩm
    category: { type: String, required: true }, // Danh mục
    brand: { type: String }, // Thương hiệu
    purchasePrice: { type: Number, required: true }, // Giá nhập
    sellingPrice: { type: Number, required: true }, // Giá bán
    unit: { type: String, required: true }, // Đơn vị tính
    stock: { type: Number, required: true }, // Tồn kho
    description: { type: String }, // Mô tả
    notes: { type: String }, // Ghi chú
    supplier: {
        // Nhà cung cấp
        name: { type: String, required: true },
        contact: { type: String },
        address: { type: String },
        email: { type: String },
    },
    image: { type: String }, // Hình ảnh
    createdAt: { type: Date, default: Date.now }, // Ngày tạo
    updatedAt: { type: Date, default: Date.now }, // Ngày cập nhật
});

// Middleware để tự động cập nhật `updatedAt` khi chỉnh sửa
productSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

// Tạo model từ schema
const productModel = mongoose.model.Product || mongoose.model('Product', productSchema);

export default productModel;
