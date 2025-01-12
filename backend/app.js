import express from 'express';
import cors from 'cors';
import mapRoutes from './routes/map_route.js';
import priceRoutes from './routes/price_route.js';
const app = express();

app.use(cors());

app.use(express.json());

app.use(mapRoutes);
app.use(priceRoutes);

app.listen(9897, () => {
    console.log('Server is running on port 9897');
});

export default app;
