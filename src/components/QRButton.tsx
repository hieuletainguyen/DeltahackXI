import React, { useState } from 'react';
import { QrCode } from 'lucide-react';
import '../styles/QRButton.css';

const QRButton = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button 
                className="info-button"
                onClick={() => setIsOpen(true)}
            >
                <QrCode size={20} />
            </button>

            {isOpen && (
                <div className="popup-overlay" onClick={() => setIsOpen(false)}>
                    <div className="popup-content" onClick={e => e.stopPropagation()}>
                        <h3>Scan QR Code</h3>
                        <p>• Scan this code with your mobile device</p>
                        <p>• Get instant access to charging details</p>
                        <p>• Track your charging session</p>
                        <button 
                            className="close-button"
                            onClick={() => setIsOpen(false)}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default QRButton; 