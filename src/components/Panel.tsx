import React, { useState, useEffect } from 'react';
import '../styles/panel.css';
import StationName from './StationName';
import TimePicker from './TimePicker';
import Price from './Price';
import VoltageSelector from './VoltageSelector';

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
    const [startHours, setStartHours] = useState(0);
    const [startMinutes, setStartMinutes] = useState(0);
    const [endHours, setEndHours] = useState(0);
    const [endMinutes, setEndMinutes] = useState(0);
    const [animationClass, setAnimationClass] = useState('');

    useEffect(() => {
        const totalMinutes = (endHours * 60 + endMinutes) - (startHours * 60 + startMinutes);
        setSelectedTime(totalMinutes);
    }, [startHours, startMinutes, endHours, endMinutes]);

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

    return (
        <div className="charging-panel">
            <Price price={0.45} />
            <div className="separator"></div>
            <StationName
                station={selectedStation}
                animationClass={animationClass}
                onPrevious={handlePreviousStation}
                onNext={handleNextStation}
            />
            <div className="separator"></div>
            <div className="bottom-container">
                <div className="left-section">
                    <TimePicker
                        startHours={startHours}
                        startMinutes={startMinutes}
                        endHours={endHours}
                        endMinutes={endMinutes}
                        setStartHours={setStartHours}
                        setStartMinutes={setStartMinutes}
                        setEndHours={setEndHours}
                        setEndMinutes={setEndMinutes}
                    />
                    <div className="voltage-section">
                        <VoltageSelector 
                            value={batteryPercentage}
                            onChange={setBatteryPercentage}
                        />
                    </div>
                </div>
                <div className="right-section">
                    <button 
                        className="checkout-button"
                        onClick={() => {
                            if (selectedStation) {
                                alert(`Booking ${selectedStation.name} from ${startHours}:${startMinutes.toString().padStart(2, '0')} to ${endHours}:${endMinutes.toString().padStart(2, '0')} with ${batteryPercentage}% battery`);
                            } else {
                                alert('Please select a charging station before continuing.');
                            }
                        }}
                    >
                        &#8594;
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChargingStationPanel; 