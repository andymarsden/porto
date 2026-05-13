const createdFlowRegistry = new Map();

function normalizeFlowId(value) {
    return String(value ?? "")
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
}

function normalizeStep(step, index) {
    const question = String(step?.question ?? "").trim();
    if (!question) {
        throw new Error(`Step ${index + 1} is missing a question.`);
    }

    const options = Array.isArray(step?.options)
        ? step.options
              .map((item) => String(item ?? "").trim())
              .filter(Boolean)
        : [];

    const normalizedStep = {
        id: `step-${index + 1}`,
        question
    };

    if (options.length > 0) {
        normalizedStep.options = options;
    }

    return normalizedStep;
}

function normalizeFlow(flow) {
    const id = normalizeFlowId(flow?.id);
    if (!id) {
        throw new Error("Flow id is required.");
    }

    if (!Array.isArray(flow?.steps) || flow.steps.length === 0) {
        throw new Error("At least one step is required.");
    }

    return {
        id,
        steps: flow.steps.map((step, index) => normalizeStep(step, index))
    };
}

function cloneFlow(flow) {
    if (!flow) return null;
    return {
        id: flow.id,
        steps: flow.steps.map((step) => ({
            ...step,
            options: Array.isArray(step.options) ? [...step.options] : undefined
        }))
    };
}

export function listCreatedFlows() {
    return Array.from(createdFlowRegistry.values()).map((flow) => cloneFlow(flow));
}

export function getCreatedFlow(id) {
    const key = normalizeFlowId(id);
    return cloneFlow(createdFlowRegistry.get(key));
}

export function createFlow(flow) {
    const normalizedFlow = normalizeFlow(flow);

    if (createdFlowRegistry.has(normalizedFlow.id)) {
        throw new Error(`Flow \"${normalizedFlow.id}\" already exists.`);
    }

    createdFlowRegistry.set(normalizedFlow.id, normalizedFlow);
    return cloneFlow(normalizedFlow);
}

export function updateFlow(flow) {
    const normalizedFlow = normalizeFlow(flow);

    if (!createdFlowRegistry.has(normalizedFlow.id)) {
        throw new Error(`Flow \"${normalizedFlow.id}\" does not exist.`);
    }

    createdFlowRegistry.set(normalizedFlow.id, normalizedFlow);
    return cloneFlow(normalizedFlow);
}

export function removeFlow(id) {
    const key = normalizeFlowId(id);
    createdFlowRegistry.delete(key);
}
