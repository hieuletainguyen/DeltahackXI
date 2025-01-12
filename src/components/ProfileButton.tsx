import React, { useState } from 'react';
import { User, LogOut, Settings, CreditCard } from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import '../styles/profileButton.css';

interface ProfileButtonProps {
    setIsAuthenticated: (auth: boolean) => void;
}

const ProfileButton = ({ setIsAuthenticated }: ProfileButtonProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const { user, setUser } = useUser();
    
    const handleLogout = () => {
        localStorage.removeItem('user');
        setUser(null);
        setIsAuthenticated(false);
    };

    return (
        <>
            <button 
                className="profile-button"
                onClick={() => setIsOpen(true)}
            >
                <User size={20} />
            </button>

            {isOpen && (
                <div className="popup-overlay" onClick={() => setIsOpen(false)}>
                    <div className="popup-content" onClick={e => e.stopPropagation()}>
                        <div className="profile-header">
                            <User size={40} />
                            <h3>{user?.email}</h3>
                        </div>
                        
                        <div className="profile-options">
                            <button className="profile-option">
                                <Settings size={18} />
                                <span>Account Settings</span>
                            </button>
                            
                            <button className="profile-option">
                                <CreditCard size={18} />
                                <span>Payment Methods</span>
                            </button>
                            
                            <button className="profile-option logout" onClick={handleLogout}>
                                <LogOut size={18} />
                                <span>Log Out</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ProfileButton; 