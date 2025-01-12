import dotenv from 'dotenv';
import { calculateDynamicPrice } from './price.js';
dotenv.config();
import client from '../database/mongodb.js';

function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

function toRad(value) {
    return value * Math.PI / 180;
}

export const getMap = async (req, res) => {
    try {
        const { lat, lng } = req.query;
        const { current_battery, planned_time, desired_battery } = req.body;
        
        // Construct URL with query parameters
        const baseUrl = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json';
        const params = new URLSearchParams({
            location:  `${lat},${lng}`,
            radius: '1500',
            type: 'restaurant',
            key: process.env.GOOGLE_MAPS_API_KEY
        });

        const url = `${baseUrl}?${params.toString()}`;
        await client.connect();
        
        const response = await fetch(url);
        const data = await response.json();
        const results = data.results;

        const enrichedResults = await Promise.all(results.map(async (place) => {
            const distance = calculateDistance(
                parseFloat(lat),
                parseFloat(lng),
                place.geometry.location.lat,
                place.geometry.location.lng
            );
            
            // Estimate travel time (assuming average speed of 30 km/h in city)
            const averageSpeedKmH = 30;
            const timeHours = distance / averageSpeedKmH;
            const timeMinutes = Math.round(timeHours * 60);

            // query the location of the provider
            const provider_data = await client.db("data").collection("provider").findOne({ name: place.name });
            const plannedDateTime = new Date(planned_time);
            const userCount = provider_data.visit[`${plannedDateTime.getHours()}`]
            const { totalPrice, pricePerWatt, multiplier } = calculateDynamicPrice(
                45.3,
                userCount,
                plannedDateTime,
                provider_data._id
            );
            // ================================

            return {
                ...place,
                distance: {
                    value: distance,
                    text: `${distance.toFixed(1)} km`
                },
                duration: {
                    value: timeMinutes * 60, // in seconds
                    text: `${timeMinutes} mins`
                }, 
                start_time: new Date(new Date().getTime() + timeMinutes * 60 * 1000),
                end_time: new Date(new Date().getTime() + timeMinutes * 60 * 1000 + (desired_battery - current_battery) / provider_data.chargeRate * 60 * 1000),
                price: {
                    totalPrice,
                    pricePerWatt,
                    multiplier
                }
            };
        }));

        const sortedResults = enrichedResults
            .sort((a, b) => a.distance.value - b.distance.value)
            .slice(0, 5);

        await client.close();
        console.log(sortedResults);
        res.json(sortedResults);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}