//TODO
//can you o one more pass to make the command handling even cleaner by extracting each command (/onboard, /food, /echo, etc.) into a small command map so resolveIntent becomes mostly lookup + dispatch



import { commands } from "$lib/commands";
import { startFlow  } from "$lib/flows/engine.js";

function createIntentResponse(text, activeFlow = null, card = null) {
    return {
        text,
        activeFlow,
        card
    };
}

export async function resolveIntent(input) {
    const text = String(input ?? "").trim();

    if (!text) {
        return createIntentResponse("Please enter a message.");
    }

    if(text === "/onboard") {  
        console.log("Starting onboarding flow...");
        const activeFlow = await startFlow("basic-details");

        if (!activeFlow) {
            return createIntentResponse("That flow is unavailable right now.");
        }

        return createIntentResponse(activeFlow.flow.steps[0].question, activeFlow);
        //return activeFlow.flow.steps[0].question;
    }

    if(text === "/food") {  
        //console.log("Starting food flow...");
        const activeFlow = await startFlow("favorite-food");
        //console.log("From: resolveIntent - Active Flow", activeFlow);
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

    if (text === "/play" || text.startsWith("/play ")) {
        const music = text.replace(/^\/play\s?/, "").trim() || "random";
        const result = await commands.play.enqueue({ music });

        if (!result?.ok) {
            return createIntentResponse(`Could not queue music right now. Tried: ${music}`);
        }

        const albumCard = {
            type: "album",
            name: result?.data?.name ?? "Unknown album",
            artist: result?.data?.artists?.[0]?.name ?? "Unknown artist",
            // use the 300px image if available, fall back down the list
            imageUrl: result?.data?.images?.[1]?.url ?? result?.data?.images?.[0]?.url ?? null,
        };
        return createIntentResponse(null, null, albumCard);
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
}