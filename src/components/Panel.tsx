import React, { useState } from 'react';
import '../styles/panel.css';
import StationName from './StationName';
import TimePicker from './TimePicker';
import Price from './Price';
import VoltageSelector from './VoltageSelector';

interface Station {
    id: number;
    name: string;
    location: { lat: number; lng: number };
    pricePerWatt: number;
}

interface TimeSelection {
    hours: number;
    minutes: number;
}

interface VoltageSelection {
    start: number;
    target: number;
}

interface ChargingStationPanelProps {
    price: number;
    stations: Station[];
    selectedStation: Station;
    setSelectedStation: (station: Station) => void;
    startTime: TimeSelection;
    setStartTime: (time: TimeSelection) => void;
    endTime: TimeSelection;
    setEndTime: (time: TimeSelection) => void;
    voltage: VoltageSelection;
    setVoltage: (voltage: VoltageSelection) => void;
    onSubmit: () => void;
}

const ChargingStationPanel: React.FC<ChargingStationPanelProps> = ({
    stations,
    price,
    selectedStation,
    setSelectedStation,
    startTime,
    setStartTime,
    endTime,
    setEndTime,
    voltage,
    setVoltage,
    onSubmit
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

    return (
        <div className="charging-panel">
            <Price price={price} />
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
                        startTime={startTime}
                        endTime={endTime}
                        setStartTime={setStartTime}
                        setEndTime={setEndTime}
                    />
                    <div className="voltage-section">
                        <VoltageSelector 
                            voltage={voltage}
                            setVoltage={setVoltage}
                        />
                    </div>
                </div>
                <div className="right-section">
                    <button 
                        className="checkout-button"
                        onClick={() => {
                            onSubmit();
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