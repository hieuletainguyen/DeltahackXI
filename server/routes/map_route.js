import express from 'express';
import { getMap, confirmBooking, execution_return } from '../controller/map.js';

const router = express.Router();

router.post('/api/places', getMap);

router.post('/api/confirm-booking', confirmBooking);

router.get('/api/execution_return', execution_return);
export default router;

