import client from "../database/mongodb.js";


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

    const pricePerWatt = basePricePerWatt * multiplier;
    const totalPrice = watt * pricePerWatt;

    return { totalPrice, pricePerWatt, multiplier };
};

export const getPrice = async (req, res) => {
    try {
        const { station_id, planned_time, watt } = req.body;
        // !latitude || !longitude
        if (!station_id || !planned_time || !watt) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        const plannedDateTime = new Date(planned_time);

        const user_data = await client.db("data").collection("user").findOne({ _id: station_id });
        const userCount = user_data.visit[`${plannedDateTime.getHours()}`]
        if (!user_data) {
            return res.status(404).json({ error: 'User not found' });
        }        
        const { totalPrice, pricePerWatt, multiplier } = calculateDynamicPrice(
            parseFloat(watt),
            userCount,
            plannedDateTime,
            station_id
        );

        res.status(200).json({
            success: true,
            total_price: totalPrice,
            price_per_watt: pricePerWatt,
            multiplier: multiplier
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};