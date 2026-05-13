export const qriosCommands = {

    async testresponse(text) {
        const response = `This is a response from the qrios command! You said: ${text}`;
        return response;
    },

    async yourtext(text) {
        const displayText = `This is what you entered: ${text}`;
        return displayText;
    }

}
