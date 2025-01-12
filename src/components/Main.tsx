import React, { useState, useEffect } from 'react';
import MapComponent from './Map';
import ChargingStationPanel from './Panel';
import Login from './Login';
import Signup from './Signup';
import { useUser } from '../contexts/UserContext';

const dummyStations = [
    { id: 1, name: 'Station 1', location: { lat: 37.7749, lng: -122.4194 } },
    { id: 2, name: 'Station 2', location: { lat: 37.7849, lng: -122.4094 } },
    { id: 3, name: 'Station 3', location: { lat: 37.7949, lng: -122.3994 } },
];

interface Station {
    id: number;
    name: string;
    location: { lat: number; lng: number };
}

interface TimeSelection {
    hours: number;
    minutes: number;
}

interface VoltageSelection {
    start: number;
    target: number;
}

export default function Main() {
    const [selectedStation, setSelectedStation] = useState(dummyStations[0] as Station);
    const [startTime, setStartTime] = useState<TimeSelection>({ hours: 0, minutes: 0 });
    const [endTime, setEndTime] = useState<TimeSelection>({ hours: 0, minutes: 0 });
    const [batteryPercentage, setBatteryPercentage] = useState(100);
    const [voltage, setVoltage] = useState<VoltageSelection>({
        start: 20,
        target: 80
    });

    const [panelAttributes, setPanelAttributes] = useState({
        price: 0.00,
        station: selectedStation,
        startTime: { hours: 0, minutes: 0 },
        endTime: { hours: 0, minutes: 0 },
        voltage: { start: 20, target: 80 }
    });

    // Update panelAttributes whenever individual states change
    useEffect(() => {
        setPanelAttributes(prev => ({
            ...prev,
            startTime,
            endTime,
            voltage,
            station: selectedStation
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
            <div className="h-1/2 relative">
                <MapComponent 
                    stations={dummyStations} 
                    onStationSelect={setSelectedStation} 
                    setIsAuthenticated={setIsAuthenticated} 
                />
            </div>
            <div className="h-1/2 w-full">
                <ChargingStationPanel 
                    price={panelAttributes.price}
                    stations={dummyStations} 
                    selectedStation={selectedStation} 
                    setSelectedStation={setSelectedStation} 
                    startTime={startTime}
                    setStartTime={setStartTime}
                    endTime={endTime}
                    setEndTime={setEndTime}
                    voltage={voltage}
                    setVoltage={setVoltage}
                    onSubmit={handleSubmit}
                />
            </div>
        
        </div>
    );
}

