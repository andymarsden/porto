import { commands } from "$lib/commands";
import { startFlow } from "$lib/flows/engine.js";

function createIntentResponse(text, activeFlow = null, card = null, options = null) {
    return { text, activeFlow, card, options };
}

// Set this to your API endpoint when ready.
const INTENT_API_ENDPOINT = "https://infojam.app.n8n.cloud/webhook/7f34a391-02df-49d1-9438-400f40b56dda";

function parseIntentPayload(value) {
    if (!value) return null;

    const parseAsJson = (input) => {
        try {
            return JSON.parse(input);
        } catch {
            return null;
        }
    };

    let parsed = value;

    if (typeof parsed === "string") {
        const trimmed = parsed.trim();
        if (!trimmed) return null;

        parsed = parseAsJson(trimmed);

        // Some API responses can arrive as JSON-stringified JSON.
        if (typeof parsed === "string") {
            parsed = parseAsJson(parsed);
        }

        // Last attempt for escaped newlines.
        if (!parsed) {
            parsed = parseAsJson(trimmed.replace(/\\n/g, "\n"));
        }
    }

    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        return null;
    }

    return {
        intent: String(parsed.intent ?? "").replace(/^\//, "").toLowerCase(),
        action: String(parsed.action ?? "").toLowerCase(),
        confidence: typeof parsed.confidence === "number" ? parsed.confidence : null,
        entities: parsed.entities && typeof parsed.entities === "object" ? parsed.entities : {}
    };
}

async function fetchIntentPayloadFromApi(inputText) {
    if (!INTENT_API_ENDPOINT) return null;

    try {
        const response = await fetch(INTENT_API_ENDPOINT, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ text: inputText })
        });

        if (!response.ok) return null;

        // Support either raw JSON object or text payload that contains JSON.
        const contentType = response.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
            return parseIntentPayload(await response.json());
        }

        return parseIntentPayload(await response.text());
    } catch (error) {
        console.warn("[resolveIntent] Intent API call failed:", error);
        return null;
    }
}

// Returns a handler that starts a named flow and returns its first step
function flowCommand(flowId) {
    return async () => {
        const activeFlow = await startFlow(flowId);
        if (!activeFlow) return createIntentResponse("That flow is unavailable right now.");
        const firstStep = activeFlow.flow.steps[0];
        return createIntentResponse(firstStep.question, activeFlow, null, firstStep.options);
    };
}

// Each entry: prefix to match (without leading slash), and an async handler(args)
// args = text after the slash prefix, already trimmed
const COMMANDS = [
    {
        prefix: "onboard",
        handler: flowCommand("basic-details")
    },
    {
        prefix: "food",
        handler: flowCommand("favorite-food")
    },
    {
        prefix: "n",
        handler: async () => createIntentResponse("Notes are not wired yet in this sandbox. Try /echo <message> for now.")
    },
    {
        prefix: "echo",
        handler: async (args) => {
            const echoResponse = await commands.debug.echo({ name: "PortoUser", text: args });
            return createIntentResponse(echoResponse);
        }
    },
    {
        prefix: "music",
        handler: async (args) => {
            const music = args || "random";

            if (music === "stop") {
                const result = await commands.music.stop();
                console.log("[resolveIntent] Music stop command result:", result);
                return result?.ok === true
                    ? createIntentResponse("Music stopped.")
                    : createIntentResponse("Unfortunately stopping music is not wired yet in this sandbox.");
            }

            const result = await commands.music.enqueue({ music });
            if (!result?.ok) return createIntentResponse(`Could not queue music right now. Tried: ${music}`);
            return createIntentResponse(null, null, commands.music.createCard(result?.data));
        }
    },
    {
        prefix: "chart",
        handler: async () => {
            const chartCard = {
                type: "chart",
                labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
                datasets: [{ label: "Activity", data: [18, 21, 19, 24, 22, 26, 23] }]
            };
            return createIntentResponse(null, null, chartCard);
        }
    },
    {
        prefix: "barnsley",
        handler: async (args) => {
            const result = await commands.barnsley.search({ text: args });
            return createIntentResponse(result[0].choices[0].message.content);
        }
    },
    {
        // DEMO only: retrieve saved flow payloads via commands
        prefix: "flow-list",
        handler: async () => {
            const latestFlow = await commands.basicDetails.getLastSavedFlow();
            if (!latestFlow) return createIntentResponse("No saved flow payloads yet. Run /onboard and complete the flow first.");
            return createIntentResponse(`Latest flow payload:\n${JSON.stringify(latestFlow, null, 2)}`);
        }
    }
];

export async function resolveIntent(input) {
    const text = String(input ?? "").trim();

    if (!text) return createIntentResponse("Please enter a message.");

    // Match slash commands by prefix
    if (text.startsWith("/")) {
        const [slug, ...rest] = text.slice(1).split(" ");
        const args = rest.join(" ").trim();
        const command = COMMANDS.find(c => c.prefix === slug);
        if (command) return command.handler(args);
    }

    // const apiIntentPayload = await fetchIntentPayloadFromApi(text);
    // const intentPayload = apiIntentPayload ?? parseIntentPayload(input);
    // if (intentPayload?.intent) {
    //     const command = COMMANDS.find(c => c.prefix === intentPayload.intent);

    //     if (command) {
    //         const argsFromEntities = Object.values(intentPayload.entities)
    //             .filter(value => typeof value === "string" || typeof value === "number")
    //             .map(String)
    //             .join(" ")
    //             .trim();

    //         // start-flow should start the mapped flow command with no args.
    //         if (intentPayload.action === "start-flow") {
    //             return command.handler("");
    //         }

    //         return command.handler(argsFromEntities);
    //     }
    // }

    // No command matched — fall through to future AI intent resolution
    return createIntentResponse("Unknown command. Try /echo <message> or /flow-list (from intent).");
}
