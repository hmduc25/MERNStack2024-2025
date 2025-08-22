import productModel from '../models/productModel.js';
import invoiceModel from '../models/invoiceModel.js';
import mongoose from 'mongoose';

const sellProducts = async (req, res) => {
    const { salesData, invoiceCode, customerName, cashier, paymentDetails, discounts, status } = req.body;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const updatedProducts = [];
        const invoiceItems = [];
        let totalAmount = 0;

        for (const item of salesData) {
            const { productId, quantitySold } = item;

            const product = await productModel.findById(productId).session(session);
            if (!product) {
                throw new Error(`Sản phẩm không tồn tại: ${productId}`);
            }

            const requestedQuantity = Number(quantitySold);
            if (isNaN(requestedQuantity) || requestedQuantity <= 0) {
                throw new Error('Số lượng sản phẩm bán ra không hợp lệ.');
            }

            if (product.totalQuantity < requestedQuantity) {
                throw new Error(
                    `Tồn kho không đủ cho sản phẩm: ${product.name}. Tồn kho còn: ${product.totalQuantity}, yêu cầu: ${requestedQuantity}`,
                );
            }

            // Sắp xếp batches theo hạn sử dụng (FIFO)
            product.batches.sort((a, b) => new Date(a.expirationDate) - new Date(b.expirationDate));

            let remainingToSell = requestedQuantity;
            const batchInfo = [];

            for (const batch of product.batches) {
                if (remainingToSell <= 0) break;

                const currentRemaining = Number(batch.remaining);
                if (isNaN(currentRemaining)) {
                    throw new Error('Dữ liệu tồn kho lô hàng không hợp lệ.');
                }

                const soldFromBatch = Math.min(currentRemaining, remainingToSell);

                batch.remaining = currentRemaining - soldFromBatch;
                remainingToSell -= soldFromBatch;

                batchInfo.push({
                    batchId: batch._id,
                    batchNumber: batch.batchNumber,
                    soldQuantity: soldFromBatch,
                });
            }

            product.markModified('batches');
            product.totalQuantity -= requestedQuantity;

            await product.save({ session });
            updatedProducts.push(product);

            const itemTotalPrice = requestedQuantity * product.sellingPrice;
            invoiceItems.push({
                productId: product._id,
                productName: product.name,
                quantity: requestedQuantity,
                unitPrice: product.sellingPrice,
                totalPrice: itemTotalPrice,
                batchInfo: batchInfo,
            });
            totalAmount += itemTotalPrice;
        }

        totalAmount -= discounts || 0;

        const newInvoice = new invoiceModel({
            invoiceCode: invoiceCode,
            invoiceDate: new Date(),
            status: status,
            customerName: customerName,
            cashier: cashier,
            totalAmount: totalAmount,
            paymentDetails: paymentDetails,
            items: invoiceItems,
            discounts: discounts || 0,
        });

        await newInvoice.save({ session });
        await session.commitTransaction();
        session.endSession();

        res.json({
            success: true,
            message: 'Đã xử lý bán hàng và tạo hóa đơn thành công',
            data: updatedProducts,
            invoice: newInvoice,
        });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        res.status(400).json({ success: false, message: `Lỗi xử lý bán hàng: ${error.message}` });
    }
};

const getInvoices = async (req, res) => {
    try {
        const invoices = await invoiceModel.find().sort({ invoiceDate: -1 });
        res.status(200).json({ success: true, data: invoices });
    } catch (error) {
        res.status(500).json({ success: false, message: `Lỗi truy vấn hóa đơn: ${error.message}` });
    }
};

// Lấy mã hóa đơn cuối cùng
const getLastInvoiceCode = async (req, res) => {
    try {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        const todayPrefix = `HD${yyyy}${mm}${dd}`; // Tạo tiền tố ngày ví dụ: HD20250817

        // Tìm hóa đơn cuối cùng được tạo trong ngày hôm nay
        const lastInvoice = await invoiceModel
            .findOne({ invoiceCode: { $regex: `^${todayPrefix}` } })
            .sort({ createdAt: -1 })
            .select('invoiceCode');

        let lastCode;
        if (lastInvoice) {
            lastCode = lastInvoice.invoiceCode;
        } else {
            // Nếu không có hóa đơn nào trong ngày hôm nay,
            // coi như mã cuối cùng của ngày hôm qua là HD...0000 để frontend bắt đầu từ 0001
            lastCode = `${todayPrefix}0000`;
        }

        res.json({ success: true, lastCode });
    } catch (error) {
        res.status(500).json({ success: false, message: `Lỗi: ${error.message}` });
    }
};

const updateInvoiceStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    // Kiểm tra tính hợp lệ của trạng thái mới
    if (!status || (status !== 'completed' && status !== 'pending')) {
        return res.status(400).json({ success: false, message: 'Trạng thái không hợp lệ.' });
    }

    try {
        const updatedInvoice = await invoiceModel.findByIdAndUpdate(
            id,
            { status: status },
            { new: true, runValidators: true },
        );

        if (!updatedInvoice) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy hóa đơn.' });
        }

        res.json({
            success: true,
            message: 'Cập nhật trạng thái hóa đơn thành công.',
            data: updatedInvoice,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: `Lỗi khi cập nhật trạng thái: ${error.message}` });
    }
};

export { sellProducts, getInvoices, getLastInvoiceCode, updateInvoiceStatus };
