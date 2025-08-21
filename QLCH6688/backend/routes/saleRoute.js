import express from 'express';
import { sellProducts, getLastInvoiceCode } from '../controllers/saleController.js';

const saleRouter = express.Router();

// Route xử lý bán hàng (POST request)
saleRouter.post('/sell', sellProducts);
saleRouter.get('/laymahoadoncuoicung', getLastInvoiceCode);

export default saleRouter;
