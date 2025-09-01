// File: backend/routes/rawProductRoute.js

import express from 'express';
import { addRawProduct, listRawProducts, removeRawProduct } from '../controllers/rawProductController.js';

const rawProductRouter = express.Router();

rawProductRouter.post('/themghichu', addRawProduct);
rawProductRouter.get('/danhsachghichu', listRawProducts);
rawProductRouter.post('/xoaghichu', removeRawProduct);

export default rawProductRouter;
