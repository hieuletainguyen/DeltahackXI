import React, { useEffect, useState } from 'react';

import Login from '../components/Login';
import Signup from '../components/Signup';
import { useUser } from '../contexts/UserContext';


const Main: React.FC = () => {
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
        <div className="w-full h-screen bg-gray-100">
        </div>
    );
};

export default Main;