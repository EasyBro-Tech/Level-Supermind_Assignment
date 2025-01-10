
const dotenv = require('dotenv');
dotenv.config()

// class LangflowClient {
//     constructor(baseURL, applicationToken) {
//         this.baseURL = baseURL;
//         this.applicationToken = applicationToken;
//     }
//     async post(endpoint, body, headers = {"Content-Type": "application/json"}) {
//         headers["Authorization"] = `Bearer ${this.applicationToken}`;
//         headers["Content-Type"] = "application/json";
//         const url = `${this.baseURL}${endpoint}`;
//         try {
//             const response = await fetch(url, {
//                 method: 'POST',
//                 headers: headers,
//                 body: JSON.stringify(body)
//             });
//             console.log(response)

//             const responseMessage = await JSON.parse(response)
//             if (!response.ok) {
//                 throw new Error(`${response.status} ${response.statusText} - ${JSON.stringify(responseMessage)}`);
//             }
//             return responseMessage;
//         } catch (error) {
//             console.error('Request Error:', error.message);
//             throw error;
//         }
//     }

//     async initiateSession(flowId, langflowId, inputValue, inputType = 'chat', outputType = 'chat', stream = false, tweaks = {}) {
//         const endpoint = `/lf/${langflowId}/api/v1/run/${flowId}?stream=${stream}`;
//         return this.post(endpoint, { input_value: inputValue, input_type: inputType, output_type: outputType, tweaks: tweaks });
//     }

//     handleStream(streamUrl, onUpdate, onClose, onError) {
//         const eventSource = new EventSource(streamUrl);

//         eventSource.onmessage = event => {
//             const data = JSON.parse(event.data);
//             onUpdate(data);
//         };

//         eventSource.onerror = event => {
//             console.error('Stream Error:', event);
//             onError(event);
//             eventSource.close();
//         };

//         eventSource.addEventListener("close", () => {
//             onClose('Stream closed');
//             eventSource.close();
//         });

//         return eventSource;
//     }

//     async runFlow(flowIdOrName, langflowId, inputValue, inputType = 'chat', outputType = 'chat', tweaks = {}, stream = false, onUpdate, onClose, onError) {
//         try {
//             const initResponse = await this.initiateSession(flowIdOrName, langflowId, inputValue, inputType, outputType, stream, tweaks);
//             console.log('Init Response:', initResponse);
//             if (stream && initResponse && initResponse.outputs && initResponse.outputs[0].outputs[0].artifacts.stream_url) {
//                 const streamUrl = initResponse.outputs[0].outputs[0].artifacts.stream_url;
//                 console.log(`Streaming from: ${streamUrl}`);
//                 this.handleStream(streamUrl, onUpdate, onClose, onError);
//             }
//             return initResponse;
//         } catch (error) {
//             console.error('Error running flow:', error);
//             onError('Error initiating session');
//         }
//     }
// }

// export async function main(inputValue, inputType = 'chat', outputType = 'chat', stream = false) {
//     const flowIdOrName = '875f0881-1997-4f60-9d93-47a77f0f2dd4';
//     const langflowId = '8766b3a4-9151-42c7-9bc9-5802af9381ae';
//     const applicationToken = process.env.LangFlowToken;
//     const langflowClient = new LangflowClient('https://api.langflow.astra.datastax.com',applicationToken);

//     try {
//       const tweaks = {
//   "ChatInput-jpVtT": {},
//   "ParseData-xGXg3": {},
//   "Prompt-dV3E0": {},
//   "SplitText-8K4m6": {},
//   "ChatOutput-oKPH4": {},
//   "AstraDB-0QleU": {},
//   "AstraDB-1A4JB": {},
//   "File-OwHRJ": {},
// };
//       response = await langflowClient.runFlow(
//           flowIdOrName,
//           langflowId,
//           inputValue,
//           inputType,
//           outputType,
//           tweaks,
//           stream,
//           (data) => console.log("Received:", data.chunk), // onUpdate
//           (message) => console.log("Stream Closed:", message), // onClose
//           (error) => console.log("Stream Error:", error) // onError
//       );
//       if (response && response.outputs) {
//           const flowOutputs = response.outputs[0];
//           const firstComponentOutputs = flowOutputs.outputs[0];
//           const output = firstComponentOutputs.outputs.message;
//           return output
//       }else{
//         throw new Error("Error Occured");
//       }
//     } catch (error) {
//         throw new Error({errorMsg:error.message});   
//     }
// }

const axios = require('axios');

const API_BASE_URL = 'https://api.langflow.astra.datastax.com';
const APPLICATION_TOKEN = process.env.APPLICATION_TOKEN

async function initiateSession(flowId, langflowId, inputValue, inputType = 'chat', outputType = 'chat', stream = false, tweaks = {}) {
    const endpoint = `/lf/${langflowId}/api/v1/run/${flowId}?stream=${stream}`;
    const url = `${API_BASE_URL}${endpoint}`;

    const headers = {
        'Authorization': APPLICATION_TOKEN,
        'Content-Type': 'application/json',
    };

    const body = {
        input_value: inputValue,
        input_type: inputType,
        output_type: outputType,
        tweaks: tweaks,
    };

    try {
        const response = await axios.post(url, body, { headers });
        return response.data;
    } catch (error) {
        console.error('Error initiating session:', error.response?.data || error.message);
        throw error; 
    }
}

function handleStream(streamUrl, onUpdate, onClose, onError) {
    const eventSource = new EventSource(streamUrl);

    eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        onUpdate(data);
    };

    eventSource.onerror = (event) => {
        console.error('Stream Error:', event);
        onError(event);
        eventSource.close();
    };

    eventSource.addEventListener('close', () => {
        onClose('Stream closed');
        eventSource.close();
    });

    return eventSource;
}

async function runFlow(flowId, langflowId, inputValue, inputType = 'chat', outputType = 'chat', tweaks = {}, stream = false, onUpdate, onClose, onError) {
    try {
        const initResponse = await initiateSession(flowId, langflowId, inputValue, inputType, outputType, stream, tweaks);
        // console.log('Init Response:', initResponse);

        if (stream && initResponse?.outputs?.[0]?.outputs?.[0]?.artifacts?.stream_url) {
            const streamUrl = initResponse.outputs[0].outputs[0].artifacts.stream_url;
            handleStream(streamUrl, onUpdate, onClose, onError);
        } else {
            return initResponse;
        }
    } catch (error) {
        onError('Error initiating session');
        if(error.message.includes("Request failed with status code 500") && error.response?.data?.detail.includes("Resource has been exhausted")){
            throw new Error('Resource limit has been exhausted');
        }else{
            // console.log(error)
            throw new Error(error.message)
        }        
    }
}

async function main(inputValue, inputType = 'chat', outputType = 'chat', stream = false) {
    const flowId = '875f0881-1997-4f60-9d93-47a77f0f2dd4';
    const langflowId = '8766b3a4-9151-42c7-9bc9-5802af9381ae';
    const tweaks = {
        "ChatInput-jpVtT": {},
        "ParseData-xGXg3": {},
        "Prompt-dV3E0": {},
        "SplitText-8K4m6": {},
        "ChatOutput-oKPH4": {},
        "AstraDB-0QleU": {},
        "AstraDB-1A4JB": {},
        "File-OwHRJ": {},
        "Google Generative AI Embeddings-KYI7z": {},
        "GoogleGenerativeAIModel-osp4T": {},
        "Google Generative AI Embeddings-gObYf": {},
    };

    try {
        const response = await runFlow(
            flowId,
            langflowId,
            inputValue,
            inputType,
            outputType,
            tweaks,
            stream,
            (data) => console.log('Received:', data.chunk), // onUpdate
            (message) => console.log('Stream Closed:', message), // onClose
            (error) => console.error('Stream Error:', error) // onError
        );

        if (response?.outputs) {
            const flowOutputs = response.outputs[0];
            const firstComponentOutputs = flowOutputs.outputs[0];
            const output = firstComponentOutputs.outputs.message;
            return output.message.text
        }
        throw new Error(response);
    } catch (error) {

        const errmsg = error.message
        throw new Error(errmsg);
    }
}


module.exports = {main}