//TODO
//can you o one more pass to make the command handling even cleaner by extracting each command (/onboard, /food, /echo, etc.) into a small command map so resolveIntent becomes mostly lookup + dispatch



import { commands } from "$lib/commands";
import { startFlow  } from "$lib/flows/engine.js";

function createIntentResponse(text, activeFlow = null) {
    return {
        text,
        activeFlow
    };
}

export async function resolveIntent(input) {
    const text = String(input ?? "").trim();

    if (!text) {
        return createIntentResponse("Please enter a message.");
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
        const activeFlow = startFlow("basic-details");

        if (!activeFlow) {
            return createIntentResponse("That flow is unavailable right now.");
        }

        return createIntentResponse(activeFlow.flow.steps[0].question, activeFlow);
        //return activeFlow.flow.steps[0].question;
    }

    if(text === "/food") {  
        console.log("Starting food flow...");
        const activeFlow = startFlow("favorite-food");

        if (!activeFlow) {
            return createIntentResponse("That flow is unavailable right now.");
        }

        return createIntentResponse(activeFlow.flow.steps[0].question, activeFlow);
        //return activeFlow.flow.steps[0].question;
    }

    if (text === "/n" || text.startsWith("/n ")) {
        return createIntentResponse("Notes are not wired yet in this sandbox. Try /echo <message> for now.");
    }

    if (text === "/echo" || text.startsWith("/echo ")) {
        const echoText = text.replace(/^\/echo\s?/, "").trim();
        const echoResponse = await commands.debug.echo({ name: "PortoUser",  text: echoText });
        return createIntentResponse(echoResponse);
        //return await commands.debug.echo({ name: "PortoUser",  text: echoText });
    }

    //DEMO only as basicDetails is hardcoded in the flow engine. This is to show how we can retrieve saved flow payloads via commands.
    if (text === "/flow-list") {
        const latestFlow = await commands.basicDetails.getLastSavedFlow();

        if (!latestFlow) {
            return createIntentResponse("No saved flow payloads yet. Run /onboard and complete the flow first.");
        }

        return createIntentResponse(`Latest flow payload:\n${JSON.stringify(latestFlow, null, 2)}`);
    }

    return createIntentResponse("Unknown command. Try /echo <message> or /flow-list (from intent).");

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