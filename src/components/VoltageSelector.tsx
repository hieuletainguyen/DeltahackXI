import React, { useState } from 'react';
import { Zap } from 'lucide-react';
import '../styles/voltage.css';

interface VoltageSelectorProps {
    value: number;
    onChange: (value: number) => void;
}

const VoltageSelector: React.FC<VoltageSelectorProps> = ({ value, onChange }) => {
    const [animating, setAnimating] = useState(false);
    const [isIncrementing, setIsIncrementing] = useState(true);

    const handleChange = (isIncrement: boolean) => {
        let newValue = isIncrement ? value + 10 : value - 10;
        
        if (newValue > 100) newValue = 0;
        if (newValue < 0) newValue = 100;

        setIsIncrementing(isIncrement);
        setAnimating(true);
        setTimeout(() => {
            onChange(newValue);
            setAnimating(false);
        }, 200);
    };

    const handleWheel = (event: React.WheelEvent) => {
        event.preventDefault();
        const isScrollingUp = event.deltaY < 0;
        handleChange(isScrollingUp);
    };

    const nextValue = isIncrementing ? 
        (value + 10 > 100 ? 0 : value + 10) : 
        (value - 10 < 0 ? 100 : value - 10);

    return (
        <div className="voltage-container">
            <Zap className="voltage-icon" size={24} />
            <div 
                className="voltage-number-container"
                onWheel={handleWheel}
            >
                <span className={`voltage-number ${animating ? (isIncrementing ? 'slide-up-out' : 'slide-down-out') : ''}`}>
                    {value}%
                </span>
                {animating && (
                    <span className={`voltage-number ${isIncrementing ? 'slide-up-in' : 'slide-down-in'}`}>
                        {nextValue}%
                    </span>
                )}
            </div>
        </div>
    );
};

export default VoltageSelector; 