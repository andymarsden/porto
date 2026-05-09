import { commands } from "$lib/commands";
import { startFlow  } from "$lib/flows/engine.js";

export async function resolveIntent(input) {
    const text = String(input ?? "").trim();

    if (!text) {
        return "Please enter a message.";
    }

    // if (!text.startsWith("/")) {
    //     return null;
    // }

    // if (intent === "start-onboarding") {
    //     activeFlow = startFlow("basic-details");
    //     return activeFlow.flow.steps[0].question;
    // }

    if(text === "/onboard") {  
        console.log("Starting onboarding flow...");
        let activeFlow = startFlow("basic-details");
        return activeFlow.flow.steps[0].question;
    }

    if (text === "/n" || text.startsWith("/n ")) {
        return "Notes are not wired yet in this sandbox. Try /echo <message> for now.";
    }

    if (text === "/echo" || text.startsWith("/echo ")) {
        const echoText = text.replace(/^\/echo\s?/, "").trim();

        return await commands.debug.echo({ name: "PortoUser",  text: echoText });
    }

    //DEMO only as basicDetails is hardcoded in the flow engine. This is to show how we can retrieve saved flow payloads via commands.
    if (text === "/flow-list") {
        const latestFlow = await commands.basicDetails.getLastSavedFlow();

        if (!latestFlow) {
            return "No saved flow payloads yet. Run /onboard and complete the flow first.";
        }

        return `Latest flow payload:\n${JSON.stringify(latestFlow, null, 2)}`;
    }

    return "Unknown command. Try /echo <message> or /flow-list (from intent).";

    // if (text.startsWith("/ne ")) {

    //     const [, id, text] = input.split("|");

    //     return await commands.note.edit({
    //         id,
    //         text
    //     });
    // }

    // if (text.startsWith("/t ")) {

    //     const text = input.replace("/t ", "");

    //     return await commands.task.new({
    //         text
    //     });
    // }

    // if (text.startsWith("/te ")) {

    //     const [, id, text] = input.split("|");

    //     return await commands.task.edit({
    //         id,
    //         text
    //     });
    // }
}