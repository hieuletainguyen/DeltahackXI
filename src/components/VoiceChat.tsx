// import React, { useEffect, useState } from 'react';
// import executionData from '../../python/execution_response.json';

// interface ExecutionResponse {
//     execution_response: string;
// }

// const VoiceChat = (setExecutionResponse: (response: ExecutionResponse) => void) => {
//     useEffect(() => {
//         const checkData = () => {
//             const response = (executionData as ExecutionResponse).execution_response;
//             setExecutionResponse({execution_response: response});
//         };
//         const intervalId = setInterval(checkData, 5000);
//         return () => clearInterval(intervalId);
//     }, []);

// };

// export default VoiceChat;