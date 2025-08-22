import express from 'express';
import { getInvoices, updateInvoiceStatus } from '../controllers/saleController.js';

const router = express.Router();

router.get('/danhsachhoadon', getInvoices);
router.put('/capnhat/:id', updateInvoiceStatus);

export default router;
