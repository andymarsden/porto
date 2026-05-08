function hasWord(text, word) {
    const escapedWord = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(`\\b${escapedWord}\\b`, "i").test(text);
}

async function detect_intent(text) {

    const normalizedText = String(text ?? "").trim();
    const lowerText = normalizedText.toLowerCase();

    if (hasWord(lowerText, "weather")) {
        return "get_weather";
    }
    else if (lowerText.startsWith("/n") || lowerText === "new note") {
        return "create_note";
    }
    else if (hasWord(lowerText, "hello") || hasWord(lowerText, "hi")) {
        return "greeting";
    }
    else if (hasWord(lowerText, "echo")) {
        return "echo";
    }
    else if (lowerText.startsWith("/o") || hasWord(lowerText, "options")) {
        return "options";
    }
    else {
        //TODO call out to openAI for intent detection and return the result
        return "unknown";
    }
}


async function respond(message){


    const intent = await detect_intent(message);
    let responseMessage = "";
    let options = []; 
    let status = "complete";
    
    //TODO based on the intent, we will call different functions to get the response. For now we will return a mock response.

    //now we need to work out if we need to run a talent. Lets start simple.
    if (intent === "greeting") {
        responseMessage = "Hello! How can I help today?";
        options = [
            { id: "1", label: "Create a note", value: "new note", type: "primary" },
            { id: "2", label: "Show options", value: "/o", type: "secondary" },
        ];
    }
    else if (intent === "create_note") {
        responseMessage = "Sure, tell me what note you want to create.";
    }
    else if (intent === "get_weather") {
        responseMessage = "I can help with weather soon. For now, try another command.";
    }
    else if(intent === "echo"){
        responseMessage = await echo(message);
    }
    else if(intent === "options"){
        responseMessage = "Here are some options for you:";
        options = [
            { id: "1", label: "Tell me more", value: "Tell me more", type: "primary" },
            { id: "2", label: "hello", value: "echo", type: "secondary" },
        ]
        }
    else
    {
        responseMessage = "A boring default message";
    }

    //need to return message and options (if any) from this function. The chat engine will handle how to display the message and options.
    return {
        intent,
        message: responseMessage,
        options,
        status
    };
}


async function echo(message) {
    return "Hello! You said: " + message;
}


export {
	detect_intent,
    respond
};
