import React, { useState, useEffect } from 'react';
import '../styles/stationName.css';
import { Station } from '../types';

interface StationNameProps {
    station: Station;
    onPrevious: () => void;
    onNext: () => void;
}

const StationName: React.FC<StationNameProps> = ({ station, onPrevious, onNext }) => {
    const [animationClass, setAnimationClass] = useState('');
    const [currentStation, setCurrentStation] = useState(station);
    const [isUserTriggered, setIsUserTriggered] = useState(false);

    // useEffect(() => {
    //     if (!isUserTriggered && station?.name !== currentStation?.name) {
    //         setAnimationClass('slide-out-left');
    //         setTimeout(() => {
    //             setCurrentStation(station);
    //             setAnimationClass('slide-in-right');
    //         }, 200);
    //     }
    //     setIsUserTriggered(false); // Reset the flag after handling
    // }, [station, currentStation, isUserTriggered]);

    const handleNext = () => {
        setIsUserTriggered(() => true);
        setAnimationClass('slide-out-left');
        setTimeout(() => {
            onNext();
            setAnimationClass('slide-in-right');
        }, 300);
    };

    const handlePrevious = () => {
        setIsUserTriggered(() => true);
        setAnimationClass('slide-out-right');
        setTimeout(() => {
            onPrevious();
            setAnimationClass('slide-in-left');
        }, 300);
    };

    return (
        <div className="flex-center">
            <button className="arrow-button reverse" onClick={handlePrevious}></button>
            <h3 className={`station-name ${animationClass}`}>{station?.name}</h3>
            <button className="arrow-button" onClick={handleNext}></button>
        </div>
    );
};

export default StationName; 