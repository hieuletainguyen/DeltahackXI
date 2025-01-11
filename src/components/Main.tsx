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

export default function Main() {
    const [selectedStation, setSelectedStation] = useState(dummyStations[0] as Station);
    const [selectedTime, setSelectedTime] = useState(0);
    const [batteryPercentage, setBatteryPercentage] = useState(100);


        //user varaibles
    const { user, setUser } = useUser();

    //authentication varaibles
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isSignup, setIsSignup] = useState(false);

    useEffect(() => {
        // if (localStorage.getItem('user')) {
        //     const user = JSON.parse(localStorage.getItem('user') || '{}');
        //     setUser(user);
        //     setIsAuthenticated(true);
        // }
    }, []);

    const handleLogin = async (user: object) => {
        setIsAuthenticated(true);
    };

    const handleSignup = (userData: { email: string; id: string }) => {
        setIsAuthenticated(true);
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
        <div className="main-container">
            <MapComponent stations={dummyStations} onStationSelect={setSelectedStation} />
            <ChargingStationPanel 
                stations={dummyStations} 
                selectedStation={selectedStation} 
                setSelectedStation={setSelectedStation} 
                selectedTime={selectedTime} 
                setSelectedTime={setSelectedTime} 
                batteryPercentage={batteryPercentage} 
                setBatteryPercentage={setBatteryPercentage} 
            />
        </div>
    );
}

