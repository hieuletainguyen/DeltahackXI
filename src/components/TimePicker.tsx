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

    const handleStartHourChange = (hours: number) => setStartTime({ ...startTime, hours });
    const handleEndHourChange = (hours: number) => setEndTime({ ...endTime, hours });
    const handleStartMinuteChange = (minutes: number) => setStartTime({ ...startTime, minutes });
    const handleEndMinuteChange = (minutes: number) => setEndTime({ ...endTime, minutes });

    const handleHourChange = (isStart: boolean, increment: boolean) => {
        const timeObj = isStart ? startTime : endTime;
        const setTimeObj = isStart ? setStartTime : setEndTime;
        let newHours = increment ? timeObj.hours + 1 : timeObj.hours - 1;
        
        if (newHours > 23) newHours = 0;
        if (newHours < 0) newHours = 23;
        
        setTimeObj({ ...timeObj, hours: newHours });
    };

    const handleChange = (
        value: number, 
        setter: (value: number) => void, 
        max: number, 
        min: number, 
        key: string, 
        isIncrement: boolean,
        isMinutes: boolean
    ) => {
        let newValue: number;
        if (isMinutes) {
            newValue = isIncrement ? value + 10 : value - 10;
            
            if (key === 'endMinutes') {
                if (newValue >= 60) {
                    newValue = newValue % 60;
                    setEndTime({
                        hours: endTime.hours + 1 > 23 ? 0 : endTime.hours + 1,
                        minutes: newValue
                    });
                    setIsIncrementing(isIncrement);
                    setAnimatingNumber(key);
                    setTimeout(() => {
                        setAnimatingNumber(null);
                    }, 200);
                    return;
                } else if (newValue < 0) {
                    newValue = newValue + 60;
                    setEndTime({
                        hours: endTime.hours - 1 < 0 ? 23 : endTime.hours - 1,
                        minutes: newValue
                    });
                    setIsIncrementing(isIncrement);
                    setAnimatingNumber(key);
                    setTimeout(() => {
                        setAnimatingNumber(null);
                    }, 200);
                    return;
                }
            } else if (key === 'startMinutes') {
                if (newValue >= 60) {
                    newValue = newValue % 60;
                    setStartTime({
                        hours: startTime.hours + 1 > 23 ? 0 : startTime.hours + 1,
                        minutes: newValue
                    });
                    setIsIncrementing(isIncrement);
                    setAnimatingNumber(key);
                    setTimeout(() => {
                        setAnimatingNumber(null);
                    }, 200);
                    return;
                } else if (newValue < 0) {
                    newValue = newValue + 60;
                    setStartTime({
                        hours: startTime.hours - 1 < 0 ? 23 : startTime.hours - 1,
                        minutes: newValue
                    });
                    setIsIncrementing(isIncrement);
                    setAnimatingNumber(key);
                    setTimeout(() => {
                        setAnimatingNumber(null);
                    }, 200);
                    return;
                }
            }
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
        let nextValue: number;
        
        if (isMinutes) {
            if (animKey === 'endMinutes') {
                nextValue = isIncrementing ? 
                    (value + 10 >= 60 ? value + 10 - 60 : value + 10) : 
                    (value - 10 < 0 ? value - 10 + 60 : value - 10);
            } else {
                nextValue = isIncrementing ? 
                    ((value + 10) % 60) : 
                    (value - 10 < 0 ? value - 10 + 60 : value - 10);
            }
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
                    setter={handleStartHourChange}
                    max={23} 
                />
                <span>:</span>
                <TimeNumber 
                    value={startTime.minutes} 
                    animKey="startMinutes" 
                    setter={handleStartMinuteChange}
                    max={59}
                    isMinutes={true}
                />
            </div>
            <span className="to-arrow">→</span>
            <div className="time-input-group">
                <TimeNumber 
                    value={endTime.hours} 
                    animKey="endHours" 
                    setter={handleEndHourChange}
                    max={23} 
                />
                <span>:</span>
                <TimeNumber 
                    value={endTime.minutes} 
                    animKey="endMinutes" 
                    setter={handleEndMinuteChange}
                    max={59}
                    isMinutes={true}
                />
            </div>
        </div>
    );
};

export default TimePicker;
