import express from 'express';
import { getMap } from '../controller/map.js';

const router = express.Router();

router.get('/api/places', getMap);

export default router;

