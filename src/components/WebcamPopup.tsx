import React, { useEffect, useRef, useState } from 'react';

interface WebcamPopupProps {
    onClose: () => void;
}

const WebcamPopup: React.FC<WebcamPopupProps> = ({ onClose }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        const startCamera = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ 
                    video: true,
                    audio: false 
                });
                
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (err) {
                setError('Failed to access camera');
                console.error('Camera error:', err);
            }
        };

        startCamera();

        // Cleanup
        return () => {
            const stream = videoRef.current?.srcObject as MediaStream;
            stream?.getTracks().forEach(track => track.stop());
        };
    }, []);

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            zIndex: 2000,
        }}>
            <div style={{
                backgroundColor: 'rgba(0, 0, 0, 0.9)',
                padding: '30px',
                borderRadius: '12px',
                maxWidth: '500px',
                width: '90%',
                position: 'relative',
                textAlign: 'center'
            }}>
                <h1 style={{
                    color: '#4CAF50',
                    marginBottom: '10px',
                    fontSize: '2rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    textShadow: '0 2px 4px rgba(0,0,0,0.2)',
                    fontFamily: "'Segoe UI', Arial, sans-serif"
                }}>
                    Order Complete ✨
                </h1>
                <h2 style={{
                    color: 'white',
                    marginBottom: '20px',
                    fontSize: '1.2rem',
                    fontWeight: 500
                }}>
                    Use this to scan the QR code on the charging machines
                </h2>
                {error ? (
                    <div style={{ color: 'red' }}>{error}</div>
                ) : (
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        style={{
                            width: '100%',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                        }}
                    />
                )}
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        background: 'none',
                        border: 'none',
                        color: 'white',
                        fontSize: '24px',
                        cursor: 'pointer',
                        padding: '5px'
                    }}
                >
                    ✕
                </button>
            </div>
        </div>
    );
};

export default WebcamPopup; 