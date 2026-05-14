const DEFAULT_BARNSLEY_SEARCH_ENDPOINT = "https://infojam.app.n8n.cloud/webhook/c1bec63f-e2c4-4f37-b634-6d0b2f8ede89";

export const barnsleyCommands = {
    async search(text) {

console.log("Executing Barnsley search command with text:", text);
        const payload = {
            question: text.answer
        };

        const response = await fetch(DEFAULT_BARNSLEY_SEARCH_ENDPOINT, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });
        
        const result = await response.json();
const messageContent = result[0]?.choices[0]?.message?.content;
        // Log the message content from the webhook result
        // try {
        //     const messageContent = result[0]?.choices[0]?.message?.content;
        //     console.log("BARNSLEY message content:", messageContent);
        // } catch (e) {
        //     console.warn("Could not extract message content from webhook result", e);
        // }
        // console.log("BARNSLEY", result);

        //return result;

        let userAnswer = {};
        userAnswer.text = payload.answer?.toLowerCase() ?? "";
        //add a line break in the string below
        userAnswer.pre_text = "Thanks for your answer, ive found some information that maybe abe to help ---\n\n" + (messageContent ? messageContent + "\n\n ---\n\n **Next question:** \n\n" : "");
        userAnswer.post_text = "";
        return userAnswer;
    }
}

// export const barnsleyCommands = {
//     async search({ text }) {


//         const payload = {
//             question: text
//         };

//         const response = await fetch(DEFAULT_BARNSLEY_SEARCH_ENDPOINT, {
//                 method: "POST",
//                 headers: {
//                     "Content-Type": "application/json"
//                 },
//                 body: JSON.stringify(payload)
//             });
        
//         const result = await response.json();
//         console.log("BARNSLEY", result);

//         return result;
//     }
// }