
import { basicDetailsFlow } from "./basicDetails";
import { foodFlow } from "./food";
import { executeCommand } from "$lib/commands/execute";

const flowRegistry = {
    "basic-details": basicDetailsFlow,
    "favorite-food": foodFlow
};

export async function startFlow(id) {
    const flow = flowRegistry[id];
    const firstStep = flow?.steps?.[0];
    console.log("From: startFlow - THIS STEP", flow);

    console.log("From: startFlow - First Step", firstStep);


    if (!flow) {
        return null;
    }
    // run first step command if exists

    if (firstStep?.setup_command) {

        const result =
            //await executeCommand(firstStep.command,{answer,stepId: firstStep.id,answers: flowState.answers});
            //no payload for first step, just id
            await executeCommand(firstStep.setup_command,{id});

        console.log("From: startFlow - First Step Command Result", result);
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

    // run current step command if exists

    if (currentStep?.command) {

        const result =
            await executeCommand(currentStep.command,{answer,stepId: currentStep.id,answers: activeFlow.answers});

        console.log("CURRENT STEP COMMAND", result);
    }










    //Go to next step and save answer to current step
    const nextFlow = {
        ...activeFlow,
        answers: {
            ...activeFlow.answers,
            [currentStep.id]: String(answer ?? "").trim()
        },
        currentStep: activeFlow.currentStep + 1
    };
    //TODO
    //run aftercommand for current step if exists

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