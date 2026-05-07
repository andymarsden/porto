async function detect_intent(text) {

    //Dummy delay to simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 350));


    // Simulate intent detection with simple keyword matching
    const lowerText = text.toLowerCase();
    if (lowerText.includes('weather')) {
        return 'get_weather';
    }
    if (lowerText.includes('hello') || lowerText.includes('hi')) {
        return 'greeting';
    }

}

export {
	detect_intent
};
