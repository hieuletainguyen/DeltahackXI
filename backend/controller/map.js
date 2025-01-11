import dotenv from 'dotenv';

dotenv.config();

export const getMap = async (req, res) => {
    try {
        const { lat, lng } = req.query;
        
        // Construct URL with query parameters
        const baseUrl = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json';
        const params = new URLSearchParams({
            location:  `${lat},${lng}`,
            radius: '1500',
            type: 'restaurant',
            key: process.env.GOOGLE_MAPS_API_KEY
        });

        const url = `${baseUrl}?${params.toString()}`;
        
        const response = await fetch(url);
        const data = await response.json();
        console.log(data);
        const results = data.results;
        res.json(results);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}