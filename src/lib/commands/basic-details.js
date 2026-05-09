export const basicDetailsCommands = {
    async saveFlow({ answers }) {
        // Temporary mock persistence path for flow payloads.
        console.log("[basic-details.saveFlow]", answers);

        return {
            ok: true,
            savedAt: new Date().toISOString(),
            answers
        };
    }
};
