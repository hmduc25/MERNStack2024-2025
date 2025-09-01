// File: backend/models/rawProductModel.js

import mongoose from 'mongoose';

const rawProductSchema = new mongoose.Schema({
    productCode: { type: String },
    barcode: { type: String },
    name: { type: String },
    sellingPrice: { type: Number },
    note: { type: String },
});

const rawProductModel = mongoose.model('RawProduct', rawProductSchema);

export default rawProductModel;
