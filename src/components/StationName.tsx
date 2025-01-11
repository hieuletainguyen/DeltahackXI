import React from 'react';
import '../styles/stationName.css';

interface Station {
    id: number;
    name: string;
}

interface StationNameProps {
    station: Station;
    animationClass: string;
    onPrevious: () => void;
    onNext: () => void;
}

const StationName: React.FC<StationNameProps> = ({ station, animationClass, onPrevious, onNext }) => {
    return (
        <div className="flex-center">
            <button className="arrow-button reverse" onClick={onPrevious}></button>
            <h3 className={`station-name ${animationClass}`}>{station.name}</h3>
            <button className="arrow-button" onClick={onNext}></button>
        </div>
    );
};

export default StationName; 