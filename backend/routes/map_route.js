import express from 'express';
import { getMap } from '../controller/map.js';

const router = express.Router();

router.post('/api/places', getMap);

export default router;

