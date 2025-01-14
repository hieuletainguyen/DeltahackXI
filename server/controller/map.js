import dotenv from 'dotenv';
import { ObjectId } from 'mongodb';
import client from '../database/mongodb.js';
import fs from 'fs';
import path from 'path';

dotenv.config();

const getHourlyMultiplier = (plannedTime, stationId, threshold = 50, surgeMultiplier = 1.1) => {
    // Dummy implementation
    return 1.0;
};


const calculateDynamicPrice = (watt, usageCount, plannedTime, stationId, basePricePerWatt = 0.20) => {
    const LESS_VISITED_THRESHOLD = 10;
    const MORE_VISITED_THRESHOLD = 50;

    let multiplier = 1.0;

    if (usageCount < LESS_VISITED_THRESHOLD) {
        multiplier = 0.9;
    } else if (usageCount < MORE_VISITED_THRESHOLD) {
        multiplier = 1.0;
    } else {
        multiplier = 1.2;
    }

    const timeBasedMultiplier = getHourlyMultiplier(plannedTime, stationId);
    multiplier *= timeBasedMultiplier;

    const pricePerWatt = basePricePerWatt * multiplier * (0.7 + Math.random() * (1.4 - 0.7)) * 0.02;
    const totalPrice = watt * pricePerWatt;

    return { totalPrice, pricePerWatt, multiplier };
};

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
        console.log(lat, lng);
        const { current_battery, planned_time, desired_battery } = req.body;

        await client.connect().then(() => {
            console.log("Connected to MongoDB");
        }).catch((err) => {
            console.log(err);
        });
        
        const baseUrl = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json';
        const params = new URLSearchParams({
            location:  `${lat},${lng}`,
            radius: '2500',
            type: 'gas_station',
            key: process.env.GOOGLE_MAPS_API_KEY
        });

        const url = `${baseUrl}?${params.toString()}`;
        
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
            var provider_data = await client.db("data").collection("provider").findOne({ name: place.name });
            if (!provider_data) {
                const newProviderData = {
                    name: place.name,
                    location: {
                        lat: place.geometry.location.lat,
                        lng: place.geometry.location.lng
                    },
                    visit: Object.fromEntries(Array.from({length: 23}, (_, i) => [`${i + 1}`, []])) // Initialize visit dictionary with keys 1-23 and empty lists as values
                };

                await client.db("data").collection("provider").insertOne(newProviderData);
                console.log(newProviderData);
                provider_data = newProviderData;
            }
            const plannedDateTime = new Date(planned_time);
            const userCount = provider_data.visit[`${plannedDateTime.getHours()}`]
            const { totalPrice, pricePerWatt, multiplier } = calculateDynamicPrice(
                45.3,
                userCount,
                plannedDateTime,
                provider_data._id
            );

            //query the booking time of the station if not foiund, create a new one
            var station_data_queue = await client.db("data").collection("queue").findOne({ stationId: provider_data._id });
            if (!station_data_queue) {
                station_data_queue = {
                    stationId: provider_data._id,
                    queue: Object.fromEntries(Array.from({length: 23}, (_, i) => [`${i}`, []]))
                };
                await client.db("data").collection("queue").insertOne(station_data_queue);
            }

            const bookedTimes = [];
            for (let hour in station_data_queue.queue) {
                if (station_data_queue.queue[hour].length > 0) {
                    bookedTimes.push({
                        hour: parseInt(hour),
                        bookings: station_data_queue.queue[hour]
                    });
                }
            }
            // ================================
            const randomStartTime = Math.floor(Math.random() * 23);
            const startTime = new Date(new Date().getTime() + randomStartTime * 60 * 1000);
            const endTime = new Date(startTime.getTime() + (desired_battery - current_battery) / (provider_data.chargeRate || 5) * 60 * 8000);
            return {
                station: {
                    id: provider_data._id,
                    name: place.name,
                    location: {
                        lat: place.geometry.location.lat,
                        lng: place.geometry.location.lng
                    },
                    pricePerWatt: pricePerWatt
                },
                distance: {
                    value: distance,
                    text: `${distance.toFixed(1)} km`
                },
                start_time: startTime,
                end_time: endTime,
                bookedTimes: bookedTimes
            };
        }));

        const sortedResults = enrichedResults
            .sort((a, b) => a.distance.value - b.distance.value)
            .slice(0, 5);

        await client.close();
        console.log(sortedResults);
        const nameOfTargets = sortedResults.map((item) => item.station.name);
        const filePath = path.join(process.cwd(), '../python/nearest_stations.json');
        fs.writeFileSync(filePath, JSON.stringify(nameOfTargets, null, 2), 'utf8');
        console.log('Response saved to', filePath);

        res.json(sortedResults);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}


export const confirmBooking = async (req, res) => {
    const { stationId, username, planned_time, voltage } = req.body;
    const token = req.headers.authorization;
    
    if (!token) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    await client.connect();
    if (!stationId || !username || !planned_time || !voltage) {
        return res.status(400).json({ error: "Invalid request since not all fields are provided" });
    }

    const provider_data = await client.db("data").collection("provider").findOne({ _id: new ObjectId(stationId) });
    if (!provider_data) {
        return res.status(400).json({ error: "Invalid request since station not found" });
    }

    const station_data_queue = await client.db("data").collection("queue").findOne({ stationId: new ObjectId(stationId) });
    if (!station_data_queue) {
        return res.status(400).json({ error: "Cannot find station in queue" });
    }

    const plannedDateTime = planned_time.split(':')[0];
    console.log(plannedDateTime);
    const booking = station_data_queue.queue;
    if (booking[plannedDateTime].length >= 2) {
        return res.status(400).json({ error: "Station is full" });
    }
    booking[plannedDateTime].push({
        username: username,
        planned_time: planned_time,
        voltage: voltage
    });
    await client.db("data").collection("queue").updateOne({ stationId: new ObjectId(stationId) }, { $set: { queue: booking } });
    await client.close();
    console.log("Booking confirmed");
    res.json({ success: true });
}

export const execution_return = async (req, res) => {
    try {
        const execution_response = JSON.parse(fs.readFileSync('../../python/execution_response.json', 'utf8'));
        res.json({ success: true, response: execution_response });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}