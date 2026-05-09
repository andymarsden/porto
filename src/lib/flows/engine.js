
import { basicDetailsFlow } from "./basicDetails";

const flowRegistry = {
    "basic-details": basicDetailsFlow
};

export function startFlow(id) {
    const flow = flowRegistry[id];

    return {
        id,
        currentStep: 0,
        answers: {},
        flow
    };
}