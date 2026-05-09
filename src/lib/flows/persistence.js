import { commands } from "$lib/commands";

const flowPersistenceHandlers = {
    "basic-details": commands.basicDetails,
    "favorite-food": commands.food
};

export async function persistCompletedFlow(flowId, answers) {
    const handler = flowPersistenceHandlers[flowId];

    if (!handler?.saveFlow) {
        console.warn(`[flows.persistence] No saveFlow handler configured for flow id: ${flowId}`);
        return null;
    }

    return handler.saveFlow({ answers });
}
