// File: backend/models/rawProductModel.js

import mongoose from 'mongoose';

const rawProductSchema = new mongoose.Schema({
    productCode: { type: String },
    barcode: { type: String },
    name: { type: String },
    sellingPrice: { type: Number },
    note: { type: String },
    createdAt: { type: Date, default: Date.now },
    isUpdated: {
        type: Boolean,
        default: false,
    },
});

const rawProductModel = mongoose.model('RawProduct', rawProductSchema);

export default rawProductModel;
