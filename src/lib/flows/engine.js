
import { basicDetailsFlow } from "./basicDetails";
import { foodFlow } from "./food";
import { executeCommand } from "$lib/commands/execute";

const flowRegistry = {
    "basic-details": basicDetailsFlow,
    "favorite-food": foodFlow
};

function getSetupCommand(step) {
    return step?.setupCommand ?? step?.setup_command ?? null;
}

export async function startFlow(id) {
    const flow = flowRegistry[id];

    if (!flow) {
        return null;
    }
    const firstStep = flow.steps?.[0] ?? null;
    const setupCommand = getSetupCommand(firstStep);

    if (setupCommand) {
        try {
            await executeCommand(setupCommand, {
                id,
                stepId: firstStep.id,
                answers: {}
            });
        } catch (error) {
            console.warn(`[flows.engine] Setup command failed for flow id: ${id}`, error);
        }
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

export async function saveFlowAnswer(activeFlow, answer) {

    //run beforecommand for current step if exists
    const currentStep = getCurrentFlowStep(activeFlow);


    if (!currentStep) {
        return {
            activeFlow,
            nextStep: null,
            isComplete: true,
            answers: activeFlow?.answers ?? {}
        };
    }

    const normalizedAnswer = String(answer ?? "").trim();
    const answers = {
        ...activeFlow.answers,
        [currentStep.id]: normalizedAnswer
    };

    // run current step command if exists - this is a kind of validate command etc.

    if (currentStep?.command) {
        try {
            await executeCommand(currentStep.command, {
                answer: normalizedAnswer,
                stepId: currentStep.id,
                answers
            });
        } catch (error) {
            console.warn(`[flows.engine] Step command failed for flow id: ${activeFlow.id}, step id: ${currentStep.id}`, error);
        }
    }










    //Go to next step and save answer to current step
    const nextFlow = {
        ...activeFlow,
        answers,
        currentStep: activeFlow.currentStep + 1
    };
    //TODO if the next step has a pre command, run it here and handle errors gracefully



    return {
        activeFlow: nextFlow,
        nextStep: getCurrentFlowStep(nextFlow),
        isComplete: nextFlow.currentStep >= nextFlow.flow.steps.length,
        answers: nextFlow.answers
    };
}

// //NEW PROCESS
// import { executeCommand } from
//     "$lib/commands/execute";

// export async function handleFlowAnswer(flowState, answer) {

//     const step =
//         flowState.flow.steps[
//         flowState.currentStep
//         ];

//     // save answer
//     flowState.answers[step.id] = answer;

//     // run command if step has one
//     if (step.command) {

//         const result =
//             await executeCommand(
//                 step.command,
//                 {
//                     answer,
//                     stepId: step.id,
//                     answers: flowState.answers
//                 }
//             );

//         console.log(result);
//     }

//     flowState.currentStep++;

//     const nextStep =
//         flowState.flow.steps[
//         flowState.currentStep
//         ];

//     if (!nextStep) {
//         return {
//             done: true,
//             answers: flowState.answers
//         };
//     }

//     return {
//         done: false,
//         question: nextStep.question
//     };
// }