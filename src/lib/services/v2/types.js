/**
 * @typedef {"primary" | "secondary"} ResponseOptionType
 */

/**
 * @typedef {{
 *   id: string,
 *   label: string,
 *   value: string,
 *   type: ResponseOptionType,
 * }} ResponseOption
 */

/**
 * @typedef {"pending" | "complete" | "error"} MessageStatus
 */

/**
 * @typedef {{
 *   intent: string,
 *   message: string,
 *   options: ResponseOption[],
 *   status: MessageStatus,
 * }} AssistantResponse
 */

const VALID_STATUSES = new Set(["pending", "complete", "error"]);

function normalizeStatus(status) {
    return VALID_STATUSES.has(status) ? status : "complete";
}

function normalizeOptions(options) {
    return Array.isArray(options) ? options : [];
}

/**
 * @param {Partial<AssistantResponse>} response
 * @returns {AssistantResponse}
 */
export function normalizeAssistantResponse(response) {
    return {
        intent: String(response?.intent ?? "unknown"),
        message: String(response?.message ?? ""),
        options: normalizeOptions(response?.options),
        status: normalizeStatus(response?.status),
    };
}
