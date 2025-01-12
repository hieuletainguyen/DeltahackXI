import React, { useState } from 'react';
import '../styles/time.css';

interface TimePickerProps {
    startHours: number;
    startMinutes: number;
    endHours: number;
    endMinutes: number;
    setStartHours: (hours: number) => void;
    setStartMinutes: (minutes: number) => void;
    setEndHours: (hours: number) => void;
    setEndMinutes: (minutes: number) => void;
}

export default function TimePicker({
    startHours,
    startMinutes,
    endHours,
    endMinutes,
    setStartHours,
    setStartMinutes,
    setEndHours,
    setEndMinutes
}: TimePickerProps) {
    const [animatingNumber, setAnimatingNumber] = useState<string | null>(null);
    const [isIncrementing, setIsIncrementing] = useState<boolean>(true);

    const handleChange = (value: number, setter: (value: number) => void, max: number, min: number, key: string, isIncrement: boolean) => {
        const newValue = isIncrement ? value + 1 : value - 1;
        if (newValue <= max && newValue >= min) {
            setIsIncrementing(isIncrement);
            setAnimatingNumber(key);
            setTimeout(() => {
                setter(newValue);
                setAnimatingNumber(null);
            }, 200);
        }
    };

    const TimeNumber = ({ value, animKey }: { value: number, animKey: string }) => {
        const isAnimating = animatingNumber === animKey;
        const nextValue = isIncrementing ? 
            (value + 1) % (value >= 23 ? 24 : 60) : 
            (value - 1 + (value >= 23 ? 24 : 60)) % (value >= 23 ? 24 : 60);
        
        return (
            <div className="number-container">
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
            <div className="time-input-group">
                <div className="time-unit">
                    <TimeNumber value={startHours} animKey="startHours" />
                    <div className="button-group">
                        <button onClick={() => handleChange(startHours, setStartHours, 23, 0, 'startHours', true)}>+</button>
                        <button onClick={() => handleChange(startHours, setStartHours, 23, 0, 'startHours', false)}>-</button>
                    </div>
                    <span>:</span>
                    <TimeNumber value={startMinutes} animKey="startMinutes" />
                    <div className="button-group">
                        <button onClick={() => handleChange(startMinutes, setStartMinutes, 59, 0, 'startMinutes', true)}>+</button>
                        <button onClick={() => handleChange(startMinutes, setStartMinutes, 59, 0, 'startMinutes', false)}>-</button>
                    </div>
                </div>
                <span className="to-arrow">&#8594;</span>
                <div className="time-unit">
                    <TimeNumber value={endHours} animKey="endHours" />
                    <div className="button-group">
                        <button onClick={() => handleChange(endHours, setEndHours, 23, 0, 'endHours', true)}>+</button>
                        <button onClick={() => handleChange(endHours, setEndHours, 23, 0, 'endHours', false)}>-</button>
                    </div>
                    <span>:</span>
                    <TimeNumber value={endMinutes} animKey="endMinutes" />
                    <div className="button-group">
                        <button onClick={() => handleChange(endMinutes, setEndMinutes, 59, 0, 'endMinutes', true)}>+</button>
                        <button onClick={() => handleChange(endMinutes, setEndMinutes, 59, 0, 'endMinutes', false)}>-</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
