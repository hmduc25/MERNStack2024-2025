// invoiceModel: Hóa đơn
import mongoose from 'mongoose';

const invoiceItemSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },
    productName: {
        type: String,
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
    },
    unitPrice: {
        type: Number,
        required: true,
    },
    totalPrice: {
        type: Number,
        required: true,
    },
    batchInfo: [
        {
            batchId: { type: mongoose.Schema.Types.ObjectId },
            batchNumber: { type: String },
            soldQuantity: { type: Number },
        },
    ],
});

const invoiceSchema = new mongoose.Schema(
    {
        invoiceCode: {
            type: String,
            required: true,
            unique: true,
        },
        invoiceDate: {
            type: Date,
            default: Date.now,
        },
        status: {
            type: String,
        },
        customerName: {
            type: String,
        },
        cashier: {
            id: {
                type: mongoose.Schema.Types.ObjectId,
                // ref: 'User', // Bạn có thể thêm ref này nếu có collection User
            },
            name: { type: String },
        },
        totalAmount: {
            type: Number,
            required: true,
        },
        paymentDetails: {
            method: {
                type: String,
                required: true,
            },
            soTienDaNhan: {
                type: Number,
                required: false,
            },
        },
        items: [invoiceItemSchema],
        discounts: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true },
);

const Invoice = mongoose.model('Invoice', invoiceSchema);
export default Invoice;
