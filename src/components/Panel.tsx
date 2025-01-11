import React, { useState } from 'react';
import '../styles/panel.css';
import StationName from './StationName';

interface Station {
    id: number;
    name: string;
    location: { lat: number; lng: number };
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
    const [animationClass, setAnimationClass] = useState('');

    const currentIndex = stations.findIndex(station => station.id === selectedStation.id);

    const handleNextStation = () => {
        setAnimationClass('slide-out-left');
        setTimeout(() => {
            const nextIndex = (currentIndex + 1) % stations.length;
            setSelectedStation(stations[nextIndex]);
            setAnimationClass('slide-in-right');
        }, 200);
    };

    const handlePreviousStation = () => {
        setAnimationClass('slide-out-right');
        setTimeout(() => {
            const prevIndex = (currentIndex - 1 + stations.length) % stations.length;
            setSelectedStation(stations[prevIndex]);
            setAnimationClass('slide-in-left');
        }, 200);
    };

    const handleStationNameChange = (newStation: Station) => {
        setAnimationClass('slide-out-right');
        setTimeout(() => {
            setSelectedStation(newStation);
            setAnimationClass('slide-in-left');
        }, 200);
    };

    return (
        <div className="charging-panel">
            <StationName
                station={selectedStation}
                animationClass={animationClass}
                onPrevious={handlePreviousStation}
                onNext={handleNextStation}
            />

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
                    handleStationNameChange({ id: 3, name: 'Station 3', location: { lat: 37.7949, lng: -122.3994 } });
                    // alert(`Booking ${selectedStation.name} at ${selectedTime} hours with ${batteryPercentage}% battery`);
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