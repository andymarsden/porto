import { commands } from "$lib/commands";
import { startFlow } from "$lib/flows/engine.js";

function createIntentResponse(text, activeFlow = null, card = null, options = null) {
    return {
        text,
        activeFlow,
        card,
        options
    };
}

export async function resolveIntent(input) {
    const text = String(input ?? "").trim();

    if (!text) {
        return createIntentResponse("Please enter a message.");
    }

    if (text === "/onboard") {
        const activeFlow = await startFlow("basic-details");

        if (!activeFlow) {
            return createIntentResponse("That flow is unavailable right now.");
        }

        const firstStep = activeFlow.flow.steps[0];
        return createIntentResponse(firstStep.question, activeFlow, null, firstStep.options);
        //return activeFlow.flow.steps[0].question;
    }

    if (text === "/food") {
        const activeFlow = await startFlow("favorite-food");
        if (!activeFlow) {
            return createIntentResponse("That flow is unavailable right now.");
        }

        const firstStep = activeFlow.flow.steps[0];
        return createIntentResponse(firstStep.question, activeFlow, null, firstStep.options);
        //return activeFlow.flow.steps[0].question;
    }

    if (text === "/n" || text.startsWith("/n ")) {
        return createIntentResponse("Notes are not wired yet in this sandbox. Try /echo <message> for now.");
    }

    if (text === "/echo" || text.startsWith("/echo ")) {
        const echoText = text.replace(/^\/echo\s?/, "").trim();

        const echoResponse = await commands.debug.echo({ name: "PortoUser", text: echoText });


        return createIntentResponse(echoResponse);
        //return await commands.debug.echo({ name: "PortoUser",  text: echoText });
    }

    if (text === "/music" || text.startsWith("/music ")) {
        const music = text.replace(/^\/music\s?/, "").trim() || "random";

        if (music === "stop") {
            //Stop Music

            const result = await commands.music.stop();
            console.log("[resolveIntent] Music stop command result:", result);


            if (result?.ok === true) {
                return createIntentResponse("Music stopped.");
            }
            else {
                return createIntentResponse("Unfortunately stopping music is not wired yet in this sandbox. Try /music stop to see the intended flow, but the command will fail for now. Sorry about that!");
            }
        }

        const result = await commands.music.enqueue({ music });

        if (!result?.ok) {
            return createIntentResponse(`Could not queue music right now. Tried: ${music}`);
        }

        const albumCard = commands.music.createCard(result?.data);
        return createIntentResponse(null, null, albumCard);
    }

    if (text === "/chart" || text.startsWith("/chart ")) {
        const chartCard = {
            type: "chart",
            labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
            datasets: [{
                label: "Activity",
                data: [18, 21, 19, 24, 22, 26, 23],
            }]
        };
        return createIntentResponse(null, null, chartCard);
    }

    if(text === "/barnsley" || text.startsWith("/barnsley ")) {
        const search_string = text.replace(/^\/barnsley\s?/, "").trim()
        const result = await commands.barnsley.search({ text: search_string });
        const messageContent = result[0].choices[0].message.content;
        return createIntentResponse(messageContent);
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