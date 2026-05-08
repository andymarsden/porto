async function detect_intent(text) {

    //Dummy delay to simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 350));

    // Simulate intent detection with simple keyword matching
    const lowerText = text.toLowerCase();
    if (lowerText.includes('weather')) {
        return 'get_weather';
    }
    else if(lowerText.startsWith('/n')){
        return 'create_note';
    }
    else if (lowerText.includes('hello') || lowerText.includes('hi')) {
        return 'greeting';
    }
    else {
        //TODO call out to openAI for intent detection and return the result
        return 'unknown';
    }
}


async function respond(message){
    const intent = await detect_intent(message);
    //TODO based on the intent, we will call different functions to get the response. For now we will return a mock response.

    //need to return message and options (if any) from this function. The chat engine will handle how to display the message and options.
    return {
        message,
        intent
    };
}
export {
	detect_intent,
    respond
};
