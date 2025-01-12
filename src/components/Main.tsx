import React, { useState, useEffect } from 'react';
import MapComponent from './Map';
import ChargingStationPanel from './Panel';
import Login from './Login';
import Signup from './Signup';
import { useUser } from '../contexts/UserContext';
import NearBySearch from './NearBySearch';
import WebcamPopup from './WebcamPopup';
import ProviderSettings from './ProviderSettings';
import CustomerSettings from './CustomerSettings';
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
        start: 40,
        target: 80
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

    const [execution, setExecution] = useState<string>('[Execution: setVoltage: 30/40][Execution: setTime: 12-00/13-00]');


    useEffect(() => {
        if (stations.length === 0) return;
        if (execution === '') return;

        if (execution.includes('Execution: ')) {
            let command = execution.slice(1, -1).split('][');
            console.log(command);

            command.forEach(cmd => {
                if (cmd.includes('setStation')) {
                    const stationName = cmd.split(':')[2].trim();
                    const station = stations.find(station => station.name === stationName);
                    if (station) {
                        setSelectedStation(station);
                    }
                } else if (cmd.includes('setTime')) {
                    const times = cmd.split(':')[2].trim().split('/');
                    const startTimeParts = times[0].split('-');
                    const endTimeParts = times[1].split('-');
                    
                    setTimeout(() => {
                        setStartTime({
                            hours: parseInt(startTimeParts[0]),
                            minutes: parseInt(startTimeParts[1])
                        });
                        
                        setEndTime({
                            hours: parseInt(endTimeParts[0]),
                            minutes: parseInt(endTimeParts[1])
                        });
        
                        setPanelAttributes(prev => ({
                            ...prev,
                            startTime: { hours: parseInt(startTimeParts[0]), minutes: parseInt(startTimeParts[1]) },
                            endTime: { hours: parseInt(endTimeParts[0]), minutes: parseInt(endTimeParts[1]) },
                        }));
                    }, 10);
                } else if (cmd.includes('setVoltage')) {
                    const voltageParts = cmd.split(':')[2].trim().split('/');
                    const startVoltage = parseInt(voltageParts[0]);
                    const targetVoltage = parseInt(voltageParts[1]);
                    
                    setTimeout(() => {
                        setVoltage({ start: startVoltage, target: targetVoltage });
                    }, 10);
                } else if (cmd.includes('submit')) {
                    setTimeout(() => {
              
                        handleSubmitForm();
                    }, 10);
                }
            });
        }
        
        
    }, [execution, stations]);

    // Calculate price multiplier based on proximity to 5 PM
    const getPriceMultiplier = (time: TimeSelection): number => {
        const PEAK_HOUR = 17; 
        const MAX_MULTIPLIER = 1.1;
        const MIN_MULTIPLIER = 0.9;
        
        // Convert current time to minutes from midnight
        const currentTimeInMinutes = time.hours * 60 + time.minutes;
        const peakTimeInMinutes = PEAK_HOUR * 60;
        
        // Calculate distance from peak time (in minutes)
        const distanceFromPeak = Math.abs(currentTimeInMinutes - peakTimeInMinutes);
        const maxDistance = 12 * 60; // 12 hours as max distance
        
        // Calculate multiplier - closer to peak means higher multiplier
        const multiplier = MAX_MULTIPLIER - 
            ((MAX_MULTIPLIER - MIN_MULTIPLIER) * (distanceFromPeak / maxDistance));
            
        return Math.min(MAX_MULTIPLIER, Math.max(MIN_MULTIPLIER, multiplier));
    };

    // Update panelAttributes whenever individual states change
    useEffect(() => {
        let price = selectedStation ? selectedStation.pricePerWatt * (voltage.target - voltage.start) * BATTERY_CAPACITY : 0;
        price = price * getPriceMultiplier(startTime);

        setPanelAttributes(prev => ({
            ...prev,
            startTime,
            endTime,
            voltage,
            station: selectedStation || stations[0],
            price: price
        }));
    }, [startTime, endTime, voltage, selectedStation]);

    useEffect(() => {
        if (apiResponse.length < 5) return;
        
        const newStations = apiResponse.map(item => ({
            id: item.station.id.toString(),
            name: item.station.name,
            location: item.station.location,
            pricePerWatt: item.station.pricePerWatt
        }));
        
        setStations(newStations);
        setSelectedStation(newStations[0]);
    }, [apiResponse]);

    useEffect(() => {

        if (!selectedStation) return;
        if (apiResponse.length < 5) return;
        
        const selectedResponse = apiResponse.find(item => item.station.id === selectedStation.id);
        if (selectedResponse) {
            const startDateTime = new Date(selectedResponse.start_time);
            const endDateTime = new Date(selectedResponse.end_time);
            
            setStartTime({
                hours: startDateTime.getHours(),
                minutes: startDateTime.getMinutes()
            });
            
            setEndTime({
                hours: endDateTime.getHours(),
                minutes: endDateTime.getMinutes()
            });
        }
        

    }, [selectedStation, apiResponse]);

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

        // Add event listener for profile-option button
        const profileButton = document.querySelector('.profile-option');
        if (profileButton) {
            profileButton.addEventListener('click', () => setShowProviderSettings(true));
        }

        // Cleanup listener
        return () => {
            const profileButton = document.querySelector('.profile-option');
            if (profileButton) {
                profileButton.removeEventListener('click', () => setShowProviderSettings(true));
            }
        };
    }, []);

    const handleLogin = async (user: object) => {
        setIsAuthenticated(true);
    };

    const handleSignup = (userData: { email: string; id: string }) => {
        setIsAuthenticated(true);
    };

    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const [showWebcam, setShowWebcam] = useState(false);
    const [showProviderSettings, setShowProviderSettings] = useState(false);
    const [showCustomerSettings, setShowCustomerSettings] = useState(false);

    const handleSubmitForm = () => {
        console.log(panelAttributes);
        setShowSuccessPopup(true);
        setShowWebcam(true);
        setTimeout(() => {
            setShowSuccessPopup(false);
            setShowWebcam(false);
        }, 3000); // Show for 10 seconds
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

    // Add this function to handle provider form submission
    const handleProviderSubmit = (data: { chargerName: string; powerEfficiency: number; pricePerHour: number; location: string }) => {
        console.log('Provider settings submitted:', data);
        // Here you would typically send this data to your backend
        setShowProviderSettings(false);
    };

    // Add this function to handle customer form submission
    const handleCustomerSubmit = (data: { name: string; expectedBattery: number; carModel: string }) => {
        console.log('Customer settings submitted:', data);
        // Here you would typically send this data to your backend
        setShowCustomerSettings(false);
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
            
            {showWebcam && (
                <WebcamPopup onClose={() => setShowWebcam(false)} />
            )}
            {showProviderSettings && (
                <ProviderSettings
                    onClose={() => setShowProviderSettings(false)}
                    onSubmit={handleProviderSubmit}
                    setShowCustomerSettings={setShowCustomerSettings}
                />
            )}
            {showCustomerSettings && (
                <CustomerSettings 
                    onClose={() => setShowCustomerSettings(false)}
                    onSubmit={handleCustomerSubmit}
                    setShowProviderSettings={setShowProviderSettings}
                />
            )}
            <button
                id="submitButton"
                onClick={handleSubmitForm}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: 'transparent',
                    border: 'none',
                    pointerEvents: 'none',
                    zIndex: 1500,
                    display: execution.includes('submit') ? 'block' : 'none'
                }}
                aria-label="Submit Form"
            />
            <div className="h-1/2 relative overflow-hidden">
                <MapComponent 
                    stations={stations} 
                    setStations={setStations}
                    onStationSelect={setSelectedStation} 
                    setIsAuthenticated={setIsAuthenticated} 
                    apiResponse={apiResponse}
                    setApiResponse={setApiResponse}
                    setShowProviderSettings={setShowProviderSettings}
                    setShowCustomerSettings={setShowCustomerSettings}
                />
                <button
                    onClick={() => {
                        const commands = [
                            '[Execution: setStation: Hayes Street Grill]',
                            '[Execution: setVoltage: 30/70]',
                            '[Execution: setVoltage: 30/60][Execution: setTime: 13-00/13-30]',
                            '[Execution: submit]'
                        ];
                        const currentIndex = commands.findIndex(cmd => cmd === execution);
                        const nextIndex = (currentIndex + 1) % commands.length;
                        setExecution(commands[nextIndex]);
                    }}
                    style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        padding: '8px 16px',
                        backgroundColor: '#007aff',
                        color: 'white',
                        borderRadius: '4px',
                        zIndex: 1000
                    }}
                >
                    Test Command
                </button>
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
                    onSubmit={handleSubmitForm}
                    apiResponse={apiResponse}
                    setApiResponse={setApiResponse}
                />
            </div>
        
        </div>
    );
}

