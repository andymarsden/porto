import { commands } from "./index";

export async function executeCommand(
    path,
    payload
) {

    const [group, action] = path.split(".");

    const command =
        commands?.[group]?.[action];

    if (!command) {
        throw new Error(
            `Unknown command: ${path}`
        );
    }

    return await command(payload);
}