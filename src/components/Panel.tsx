import React from 'react';
import '../styles/panel.css';
import '../styles/stationName.css';

interface Station {
    id: number;
    name: string;
}

interface ChargingStationPanelProps {
    stations: Station[];
    selectedStation: Station;
    setSelectedStation: (station: Station) => void;
    selectedTime: number;
    setSelectedTime: (time: number) => void;
    batteryPercentage: number;
    setBatteryPercentage: (percentage: number) => void;
}

const ChargingStationPanel: React.FC<ChargingStationPanelProps> = ({
    stations,
    selectedStation,
    setSelectedStation,
    selectedTime,
    setSelectedTime,
    batteryPercentage,
    setBatteryPercentage
}) => {
    const currentIndex = stations.findIndex(station => station.id === selectedStation.id);

    const handleNextStation = () => {
        const nextIndex = (currentIndex + 1) % stations.length;
        setSelectedStation(stations[nextIndex]);
    };

    const handlePreviousStation = () => {
        const prevIndex = (currentIndex - 1 + stations.length) % stations.length;
        setSelectedStation(stations[prevIndex]);
    };

    return (
        <div className="charging-panel">
            <div className="flex-center">
                <button className="arrow-button reverse" onClick={handlePreviousStation}></button>
                <h3 className="station-name">{selectedStation.name}</h3>
                <button className="arrow-button" onClick={handleNextStation}></button>
            </div>
            <div className="separator"></div>
            <input
                type="range"
                min="0"
                max="24"
                value={selectedTime}
                onChange={(e) => setSelectedTime(Number(e.target.value))}
            />
            <div className="separator"></div>
            <input
                type="number"
                value={batteryPercentage}
                onChange={(e) => setBatteryPercentage(Number(e.target.value))}
            />
            <div className="separator"></div>
            <button onClick={() => {
                if (selectedStation) {
                    alert(`Booking ${selectedStation.name} at ${selectedTime} hours with ${batteryPercentage}% battery`);
                } else {
                    alert('Please select a charging station before continuing.');
                }
            }}>
                Continue
            </button>
        </div>
    );
};

export default ChargingStationPanel; 