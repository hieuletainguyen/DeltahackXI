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
        let newValue;
        if (key.includes('Minutes')) {
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

    const handleWheel = (event: React.WheelEvent, value: number, setter: (value: number) => void, max: number, min: number, key: string) => {
        event.preventDefault();
        const isScrollingUp = event.deltaY < 0;
        handleChange(value, setter, max, min, key, isScrollingUp);
    };

    const TimeNumber = ({ value, animKey, setter, max }: { 
        value: number, 
        animKey: string,
        setter: (value: number) => void,
        max: number 
    }) => {
        const isAnimating = animatingNumber === animKey;
        let nextValue;
        if (animKey.includes('Minutes')) {
            nextValue = isIncrementing ? 
                (value + 10 >= 60 ? 0 : value + 10) : 
                (value - 10 < 0 ? 50 : value - 10);
        } else {
            nextValue = isIncrementing ? 
                (value + 1) % (value >= 23 ? 24 : 60) : 
                (value - 1 + (value >= 23 ? 24 : 60)) % (value >= 23 ? 24 : 60);
        }
        
        return (
            <div 
                className="number-container"
                onWheel={(e) => handleWheel(e, value, setter, max, 0, animKey)}
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
            <div className="time-input-group">
                <div className="time-unit">
                    <TimeNumber value={startHours} animKey="startHours" setter={setStartHours} max={23} />
                    <span>:</span>
                    <TimeNumber value={startMinutes} animKey="startMinutes" setter={setStartMinutes} max={59} />
                </div>
                <span className="to-arrow">&#8594;</span>
                <div className="time-unit">
                    <TimeNumber value={endHours} animKey="endHours" setter={setEndHours} max={23} />
                    <span>:</span>
                    <TimeNumber value={endMinutes} animKey="endMinutes" setter={setEndMinutes} max={59} />
                </div>
            </div>
        </div>
    );
}
