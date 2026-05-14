
import { basicDetailsFlow } from "./basicDetails";
import { foodFlow } from "./food";
import { executeCommand } from "$lib/commands/execute";

const flowRegistry = {
    "basic-details": basicDetailsFlow,
    "favorite-food": foodFlow
};

const BRACKETED_OPTION_PATTERN = /^\[([a-z0-9])\]\s*(.*)$/i;

function normalizeForMatch(value) {
    return String(value ?? "").trim().toLowerCase();
}

function parseBracketedOption(option) {
    const match = String(option ?? "").trim().match(BRACKETED_OPTION_PATTERN);

    if (!match) {
        return null;
    }

    return {
        label: normalizeForMatch(match[1]),
        text: normalizeForMatch(match[2])
    };
}

function resolveOptionAnswer(userInput, options = []) {
    const normalizedInput = normalizeForMatch(userInput);

    if (!normalizedInput || !Array.isArray(options) || options.length === 0) {
        return null;
    }

    const exactOption = options.find((option) => normalizeForMatch(option) === normalizedInput);
    if (exactOption) {
        return exactOption;
    }

    const byLabel = options.find((option) => parseBracketedOption(option)?.label === normalizedInput);
    if (byLabel) {
        return byLabel;
    }

    const byText = options.find((option) => {
        const parsed = parseBracketedOption(option);
        if (!parsed) {
            return false;
        }
        return parsed.text === normalizedInput;
    });

    return byText ?? null;
}

function getSetupCommand(step) {
    return step?.setupCommand ?? step?.setup_command ?? null;
}

function getValidateCommand(step) {
    return step?.validate ?? step?.validateCommand ?? step?.validate_command ?? null;
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

export function getCurrentFlowStep(activeFlow, preText = "", postText = "", replaceText = "") {
    if (!activeFlow?.flow?.steps?.length) {
        return null;
    }

    const currentStep = activeFlow.flow.steps[activeFlow.currentStep];
    if (!currentStep) {
        return null;
    }
    currentStep.question = `${preText}${currentStep.question}${postText}` // Dont need the replace yet,.replace("{replace}", replaceText);

    return currentStep;
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
    let finalAnswer = normalizedAnswer;

    if (currentStep.options?.length) {
        const matchedOption = resolveOptionAnswer(normalizedAnswer, currentStep.options);

        if (!matchedOption) {
            return {
                activeFlow,
                nextStep: getCurrentFlowStep(activeFlow),
                isComplete: false,
                answers: activeFlow.answers,
                errorMessage:
                    "Please choose one of the listed options (you can type the letter or the full option text)."
            };
        }

        finalAnswer = matchedOption;
    }

    const candidateAnswers = {
        ...activeFlow.answers,
        [currentStep.id]: finalAnswer
    };

    //VALIDATION PROCESS
    const validateCommand = getValidateCommand(currentStep);

    if (validateCommand) {
        try {
            const validationResult = await executeCommand(validateCommand, {
                answer: finalAnswer,
                stepId: currentStep.id,
                answers: candidateAnswers
            });

            const isValidationFailure =
                validationResult === false ||
                validationResult?.ok === false ||
                validationResult?.valid === false;

            if (isValidationFailure) {
                return {
                    activeFlow,
                    nextStep: getCurrentFlowStep(activeFlow),
                    isComplete: false,
                    answers: activeFlow.answers,
                    errorMessage:
                        validationResult?.message ??
                        validationResult?.error ??
                        "Invalid answer, please try again."
                };
            }
        } catch (error) {
            return {
                activeFlow,
                nextStep: getCurrentFlowStep(activeFlow),
                isComplete: false,
                answers: activeFlow.answers,
                errorMessage: error?.message ?? "Invalid answer, please try again."
            };
        }
    }

    const answers = candidateAnswers;

    // run current step command if exists - this is a kind of validate command etc.

    let pre_text = "";
    let post_text = "";

    if (currentStep?.command) {
        try {
            const result = await executeCommand(currentStep.command, {
                answer: finalAnswer,
                stepId: currentStep.id,
                answers
            });
        
        // If the command returns a pre_text, we can use it to modify the next question or for other purposes in the flow.
        pre_text = result?.pre_text ?? "";
        // Similarly, if the command returns a post_text, we can use it to add additional information after the question.
        post_text = result?.post_text ?? "";
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
        nextStep: getCurrentFlowStep(nextFlow, pre_text,post_text),
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