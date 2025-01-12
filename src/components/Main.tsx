import React, { useState, useEffect } from 'react';
import MapComponent from './Map';
import ChargingStationPanel from './Panel';
import Login from './Login';
import Signup from './Signup';
import { useUser } from '../contexts/UserContext';
import NearBySearch from './NearBySearch';
import { Station, ApiResponse } from '../types';

interface TimeSelection {
    hours: number;
    minutes: number;
}

interface VoltageSelection {
    start: number;
    target: number;
}

export default function Main() {
    const [stations, setStations] = useState<Station[]>([]);
    const [apiResponse, setApiResponse] = useState<ApiResponse[]>([]);
    const [selectedStation, setSelectedStation] = useState<Station | null>(null);
    const [startTime, setStartTime] = useState<TimeSelection>({ hours: 1, minutes: 10 });
    const [endTime, setEndTime] = useState<TimeSelection>({ hours: 1, minutes: 23 });
    const [voltage, setVoltage] = useState<VoltageSelection>({
        start: 20,
        target: 40
    });

    const handleTimeChange = (newStartTime: TimeSelection | null, newEndTime: TimeSelection | null) => {
        const start = newStartTime || startTime;
        const end = newEndTime || endTime;
        
        // If start time changes, adjust end time by the same amount
        if (newStartTime) {
            const hourDiff = newStartTime.hours - startTime.hours;
            const minuteDiff = newStartTime.minutes - startTime.minutes;
            
            const newEnd = {
                hours: (endTime.hours + hourDiff + 24) % 24,
                minutes: endTime.minutes + minuteDiff
            };
            
            // Handle minute overflow/underflow
            if (newEnd.minutes >= 60) {
                newEnd.hours = (newEnd.hours + 1) % 24;
                newEnd.minutes -= 60;
            } else if (newEnd.minutes < 0) {
                newEnd.hours = (newEnd.hours - 1 + 24) % 24;
                newEnd.minutes += 60;
            }
            
            setStartTime(start);
            setEndTime(newEnd);
            return;
        }
        
        // Validate that end time is always after start time
        const startMinutes = start.hours * 60 + start.minutes;
        const endMinutes = end.hours * 60 + end.minutes;
        if (endMinutes <= startMinutes) {
            return;
        }
        
        if (newEndTime) {
            const oldTimeDiff = getMinutesDifference(startTime, endTime);
            const newTimeDiff = getMinutesDifference(start, end);
            
            if (oldTimeDiff !== newTimeDiff) {
                const voltageDiff = voltage.target - voltage.start;
                const newVoltageDiff = Math.round(voltageDiff * (newTimeDiff / oldTimeDiff));
                const newTargetVoltage = voltage.start + newVoltageDiff;
                
                if (newTargetVoltage > voltage.start) {
                    setVoltage(prev => ({
                        ...prev,
                        target: newTargetVoltage
                    }));
                }
            }
            setEndTime(end);
        }
    };

    const [panelAttributes, setPanelAttributes] = useState({
        price: 0.00,
        station: selectedStation,
        startTime: { hours: startTime.hours, minutes: startTime.minutes },
        endTime: { hours: endTime.hours, minutes: endTime.minutes },
        voltage: { start: voltage.start, target: voltage.target }
    });

    const BATTERY_CAPACITY = 100;

    // Update panelAttributes whenever individual states change
    useEffect(() => {
        const price = selectedStation ? selectedStation.pricePerWatt * (voltage.target - voltage.start) * BATTERY_CAPACITY : 0;
        
        setPanelAttributes(prev => ({
            ...prev,
            startTime,
            endTime,
            voltage,
            station: selectedStation || stations[0],
            price: price
        }));
    }, [startTime, endTime, voltage, selectedStation]);

    // user variables
    const { user, setUser } = useUser();

    // authentication variables
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isSignup, setIsSignup] = useState(false);

    useEffect(() => {
        if (localStorage.getItem('user')) {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            setUser(user);
            setIsAuthenticated(true);
        }
    }, []);

    const handleLogin = async (user: object) => {
        setIsAuthenticated(true);
    };

    const handleSignup = (userData: { email: string; id: string }) => {
        setIsAuthenticated(true);
    };

    const handleSubmit = () => {
        console.log(panelAttributes);
        alert(`Booking successful: ${JSON.stringify(panelAttributes)}`);
    };

    // Function to calculate minutes between two TimeSelections
    const getMinutesDifference = (start: TimeSelection, end: TimeSelection) => {
        return (end.hours - start.hours) * 60 + (end.minutes - start.minutes);
    };

    // Function to convert minutes to TimeSelection
    const minutesToTimeSelection = (startTime: TimeSelection, minutes: number): TimeSelection => {
        const totalMinutes = startTime.hours * 60 + startTime.minutes + minutes;
        return {
            hours: Math.floor(totalMinutes / 60) % 24,
            minutes: totalMinutes % 60
        };
    };

    const handleVoltageChange = (newVoltage: VoltageSelection) => {
        const oldVoltageDiff = voltage.target - voltage.start;
        const newVoltageDiff = newVoltage.target - newVoltage.start;
        
        if (oldVoltageDiff !== newVoltageDiff) {
            // Calculate current time difference in minutes
            const currentTimeDiff = getMinutesDifference(startTime, endTime);
            
            // Calculate new time difference based on voltage ratio
            const newTimeDiff = Math.round(
                currentTimeDiff * (newVoltageDiff / oldVoltageDiff)
            );
            
            // Update end time based on new time difference
            const newEndTime = minutesToTimeSelection(startTime, newTimeDiff);
            setEndTime(newEndTime);
        }

        setVoltage(newVoltage);
    };

    if (!isAuthenticated) {
        return isSignup ? (
            <Signup onSignup={handleSignup} onLoginClick={() => setIsSignup(false)} />
        ) : (
            <Login 
                onLogin={handleLogin} 
                onSignupClick={() => setIsSignup(true)}
            />
        );
    }

    return (
        <div className="h-screen flex flex-col">
            <div className="h-1/2 relative overflow-hidden">
                <MapComponent 
                    stations={stations} 
                    setStations={setStations}
                    onStationSelect={setSelectedStation} 
                    setIsAuthenticated={setIsAuthenticated} 
                    apiResponse={apiResponse}
                    setApiResponse={setApiResponse}
                />
            </div>
            <div className="h-1/2 w-full">
                <ChargingStationPanel 
                    price={panelAttributes.price}
                    stations={stations} 
                    selectedStation={selectedStation} 
                    setSelectedStation={setSelectedStation} 
                    startTime={startTime}
                    setStartTime={(time) => handleTimeChange(time, null)}
                    endTime={endTime}
                    setEndTime={(time) => handleTimeChange(null, time)}
                    voltage={voltage}
                    setVoltage={handleVoltageChange}
                    onSubmit={handleSubmit}
                />
            </div>
        
        </div>
    );
}

