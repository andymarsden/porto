
import { basicDetailsFlow } from "./basicDetails";

const flowRegistry = {
    "basic-details": basicDetailsFlow
};

export function startFlow(id) {
    const flow = flowRegistry[id];

    if (!flow) {
        return null;
    }

    return {
        id,
        currentStep: 0,
        answers: {},
        flow
    };
}

export function getCurrentFlowStep(activeFlow) {
    if (!activeFlow?.flow?.steps?.length) {
        return null;
    }

    return activeFlow.flow.steps[activeFlow.currentStep] ?? null;
}

export function saveFlowAnswer(activeFlow, answer) {
    const currentStep = getCurrentFlowStep(activeFlow);

    if (!currentStep) {
        return {
            activeFlow,
            nextStep: null,
            isComplete: true,
            answers: activeFlow?.answers ?? {}
        };
    }

    const nextFlow = {
        ...activeFlow,
        answers: {
            ...activeFlow.answers,
            [currentStep.id]: String(answer ?? "").trim()
        },
        currentStep: activeFlow.currentStep + 1
    };

    return {
        activeFlow: nextFlow,
        nextStep: getCurrentFlowStep(nextFlow),
        isComplete: nextFlow.currentStep >= nextFlow.flow.steps.length,
        answers: nextFlow.answers
    };
}