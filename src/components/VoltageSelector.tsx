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
}

const VoltageSelector: React.FC<VoltageSelectorProps> = ({ voltage, setVoltage }) => {
    const [animatingNumber, setAnimatingNumber] = useState<string | null>(null);
    const [isIncrementing, setIsIncrementing] = useState(true);

    const handleVoltageChange = (isStart: boolean, isIncrement: boolean) => {
        const currentValue = isStart ? voltage.start : voltage.target;
        let newValue = isIncrement ? currentValue + 10 : currentValue - 10;

        // Only prevent negative values
        if (newValue < 0) newValue = 0;

        // Ensure start voltage < target voltage
        if (isStart && newValue >= voltage.target) return;
        if (!isStart && newValue <= voltage.start) return;

        setIsIncrementing(isIncrement);
        setAnimatingNumber(isStart ? 'start' : 'target');

        setTimeout(() => {
            setVoltage({ ...voltage, [isStart ? 'start' : 'target']: newValue });
            setAnimatingNumber(null);
        }, 200);
    };

    const VoltageNumber = ({ value, isStart }: { value: number; isStart: boolean }) => (
        <div 
            className="voltage-number-container"
            onWheel={(e) => handleVoltageChange(isStart, e.deltaY < 0)}
        >
            <span className={`voltage-number ${animatingNumber === (isStart ? 'start' : 'target') ? 
                (isIncrementing ? 'slide-up-out' : 'slide-down-out') : ''}`}>
                {value}%
            </span>
            {animatingNumber === (isStart ? 'start' : 'target') && (
                <span className={`voltage-number ${isIncrementing ? 'slide-up-in' : 'slide-down-in'}`}>
                    {isIncrementing ? value + 10 : Math.max(value - 10, 0)}%
                </span>
            )}
        </div>
    );

    return (
        <div className="voltage-container">
            <Zap className="voltage-icon" size={24} />
            <div className="voltage-display">
                <VoltageNumber value={voltage.start} isStart={true} />
                <span className="voltage-arrow">→</span>
                <VoltageNumber value={voltage.target > 100 ? 100 : voltage.target} isStart={false} />
            </div>
        </div>
    );
};

export default VoltageSelector; 