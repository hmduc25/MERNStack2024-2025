import express from 'express';
import { getInvoices } from '../controllers/saleController.js';

const router = express.Router();

router.get('/danhsachhoadon', getInvoices);

export default router;
