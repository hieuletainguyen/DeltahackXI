import React, { useState } from 'react';
import { Zap } from 'lucide-react';
import '../styles/voltage.css';

interface VoltageSelection {
    start: number;
    target: number;
}

interface VoltageSelectorProps {
    voltage: VoltageSelection;
    setVoltage: (voltage: VoltageSelection) => void;
    onVoltageChange?: (newVoltage: VoltageSelection) => void;
}

const VoltageSelector: React.FC<VoltageSelectorProps> = ({ 
    voltage, 
    setVoltage,
    onVoltageChange 
}) => {
    const [animatingNumber, setAnimatingNumber] = useState<string | null>(null);
    const [isIncrementing, setIsIncrementing] = useState(true);

    const handleChange = (
        value: number,
        isStart: boolean,
        isIncrement: boolean
    ) => {
        let newValue = isIncrement ? value + 10 : value - 10;
        if (newValue > 100) newValue = 0;
        if (newValue < 0) newValue = 100;

        // Validate voltage ranges
        if (isStart) {
            if (newValue >= voltage.target) {
                return;
            }
        } else {
            if (newValue <= voltage.start) {
                return;
            }
        }

        setIsIncrementing(isIncrement);
        setAnimatingNumber(isStart ? 'start' : 'target');
        
        const newVoltage = {
            ...voltage,
            [isStart ? 'start' : 'target']: newValue
        };

        setTimeout(() => {
            setVoltage(newVoltage);
            onVoltageChange?.(newVoltage);
            setAnimatingNumber(null);
        }, 200);
    };

    const handleWheel = (event: React.WheelEvent, isStart: boolean) => {
        event.preventDefault();
        const isScrollingUp = event.deltaY < 0;
        handleChange(
            isStart ? voltage.start : voltage.target,
            isStart,
            isScrollingUp
        );
    };

    const VoltageNumber = ({ value, isStart }: { value: number; isStart: boolean }) => {
        const isAnimating = animatingNumber === (isStart ? 'start' : 'target');
        const nextValue = isIncrementing ? 
            (value + 10 > 100 ? 0 : value + 10) : 
            (value - 10 < 0 ? 100 : value - 10);
    

        return (
            <div 
                className="voltage-number-container"
                onWheel={(e) => handleWheel(e, isStart)}
            >
                <span className={`voltage-number ${isAnimating ? (isIncrementing ? 'slide-up-out' : 'slide-down-out') : ''}`}>
                    {value}%
                </span>
                {isAnimating && (
                    <span className={`voltage-number ${isIncrementing ? 'slide-up-in' : 'slide-down-in'}`}>
                        {nextValue}%
                    </span>
                )}
            </div>
        );
    };

    return (
        <div className="voltage-container">
            <Zap className="voltage-icon" size={24} />
            <div className="voltage-display">
                <VoltageNumber value={voltage.start} isStart={true} />
                <span className="voltage-arrow">→</span>
                <VoltageNumber value={voltage.target} isStart={false} />
            </div>
        </div>
    );
};

export default VoltageSelector; 