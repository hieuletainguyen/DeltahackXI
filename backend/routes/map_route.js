import express from 'express';
import { getMap, confirmBooking } from '../controller/map.js';

const router = express.Router();

router.post('/api/places', getMap);

router.post('/api/confirm-booking', confirmBooking);

export default router;

