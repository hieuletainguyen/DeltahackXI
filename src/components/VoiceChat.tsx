import React, { useEffect, useState } from 'react';
import executionData from '../../python/execution_response.json';

interface ExecutionResponse {
    execution_response: string;
}

const VoiceChat = () => {
    const [executionResponse, setExecutionResponse] = useState({execution_response: ""});
    useEffect(() => {
        const checkData = () => {
            const response = (executionData as ExecutionResponse).execution_response;
            setExecutionResponse({execution_response: response});
        };
        const intervalId = setInterval(checkData, 5000);
        return () => clearInterval(intervalId);
    }, []);

    return <div>{executionResponse.execution_response}</div>;
};

export default VoiceChat;