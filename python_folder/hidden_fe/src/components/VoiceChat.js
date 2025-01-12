import React, { useEffect } from 'react';

const VoiceChat = () => {
    useEffect(() => {
        const handleKeyPress = async (event) => {
            if (event.code === 'Space') {
                event.preventDefault();
                
                try {
                    await fetch('http://localhost:5000/start-voice-chat', {
                        method: 'POST',
                    });
                } catch (err) {
                    console.error('Failed to connect to voice chat service:', err);
                }
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, []);

    return <div>Hello World</div>;
};

export default VoiceChat;