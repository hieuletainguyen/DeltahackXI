import express from 'express';
import { getPrice } from '../controller/price.js';

const router = express.Router();

router.get('/price', getPrice);

export default router;
