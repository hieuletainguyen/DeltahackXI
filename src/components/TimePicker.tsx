import React, { useState } from 'react';
import { Timer } from 'lucide-react';
import '../styles/time.css';

interface TimeSelection {
    hours: number;
    minutes: number;
}

interface TimePickerProps {
    startTime: TimeSelection;
    endTime: TimeSelection;
    setStartTime: (time: TimeSelection) => void;
    setEndTime: (time: TimeSelection) => void;
}

const TimePicker: React.FC<TimePickerProps> = ({
    startTime,
    endTime,
    setStartTime,
    setEndTime
}) => {
    const [animatingNumber, setAnimatingNumber] = useState<string | null>(null);
    const [isIncrementing, setIsIncrementing] = useState<boolean>(true);

    const handleChange = (
        value: number, 
        setter: (value: number) => void, 
        max: number, 
        min: number, 
        key: string, 
        isIncrement: boolean,
        isMinutes: boolean
    ) => {
        let newValue;
        if (isMinutes) {
            newValue = isIncrement ? 
                value + 10 : 
                value - 10;
            if (newValue >= 60) newValue = 0;
            if (newValue < 0) newValue = 50;
        } else {
            newValue = isIncrement ? value + 1 : value - 1;
            if (newValue > max) newValue = min;
            if (newValue < min) newValue = max;
        }

        setIsIncrementing(isIncrement);
        setAnimatingNumber(key);
        setTimeout(() => {
            setter(newValue);
            setAnimatingNumber(null);
        }, 200);
    };

    const handleWheel = (
        event: React.WheelEvent, 
        value: number, 
        setter: (value: number) => void, 
        max: number, 
        min: number, 
        key: string,
        isMinutes: boolean
    ) => {
        const isScrollingUp = event.deltaY < 0;
        handleChange(value, setter, max, min, key, isScrollingUp, isMinutes);
    };

    const TimeNumber = ({ 
        value, 
        animKey, 
        setter, 
        max,
        isMinutes = false 
    }: { 
        value: number, 
        animKey: string,
        setter: (value: number) => void,
        max: number,
        isMinutes?: boolean
    }) => {
        const isAnimating = animatingNumber === animKey;
        let nextValue;
        if (isMinutes) {
            nextValue = isIncrementing ? 
                (value + 10 >= 60 ? 0 : value + 10) : 
                (value - 10 < 0 ? 50 : value - 10);
        } else {
            nextValue = isIncrementing ? 
                (value + 1) % (max + 1) : 
                (value - 1 + (max + 1)) % (max + 1);
        }
        
        return (
            <div 
                className="number-container"
                onWheel={(e) => handleWheel(e, value, setter, max, 0, animKey, isMinutes)}
            >
                <span className={`time-number ${isAnimating ? (isIncrementing ? 'slide-up-out' : 'slide-down-out') : ''}`}>
                    {value.toString().padStart(2, '0')}
                </span>
                {isAnimating && (
                    <span className={`time-number ${isIncrementing ? 'slide-up-in' : 'slide-down-in'}`}>
                        {nextValue.toString().padStart(2, '0')}
                    </span>
                )}
            </div>
        );
    };

    return (
        <div className="time-picker-container">
            <Timer className="time-icon" size={24} />
            <div className="time-input-group">
                <TimeNumber 
                    value={startTime.hours} 
                    animKey="startHours" 
                    setter={(hours) => setStartTime({ ...startTime, hours })} 
                    max={23} 
                />
                <span>:</span>
                <TimeNumber 
                    value={startTime.minutes} 
                    animKey="startMinutes" 
                    setter={(minutes) => setStartTime({ ...startTime, minutes })} 
                    max={59}
                    isMinutes={true}
                />
            </div>
            <span className="to-arrow">→</span>
            <div className="time-input-group">
                <TimeNumber 
                    value={endTime.hours} 
                    animKey="endHours" 
                    setter={(hours) => setEndTime({ ...endTime, hours })} 
                    max={23} 
                />
                <span>:</span>
                <TimeNumber 
                    value={endTime.minutes} 
                    animKey="endMinutes" 
                    setter={(minutes) => setEndTime({ ...endTime, minutes })} 
                    max={59}
                    isMinutes={true}
                />
            </div>
        </div>
    );
};

export default TimePicker;
