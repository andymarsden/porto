import { commands } from "$lib/commands";

export async function resolveIntent(input) {
    const text = String(input ?? "").trim();

    if (!text) {
        return "Please enter a message.";
    }

    if (!text.startsWith("/")) {
        return null;
    }

    if (text === "/n" || text.startsWith("/n ")) {
        return "Notes are not wired yet in this sandbox. Try /echo <message> for now.";
    }

    if (text === "/echo" || text.startsWith("/echo ")) {
        const echoText = text.replace(/^\/echo\s?/, "").trim();

        return await commands.debug.echo({ name: "PortoUser",  text: echoText });
    }

    return "Unknown command. Try /echo <message>.";

    // if (text.startsWith("/ne ")) {

    //     const [, id, text] = input.split("|");

    //     return await commands.note.edit({
    //         id,
    //         text
    //     });
    // }

    // if (text.startsWith("/t ")) {

    //     const text = input.replace("/t ", "");

    //     return await commands.task.new({
    //         text
    //     });
    // }

    // if (text.startsWith("/te ")) {

    //     const [, id, text] = input.split("|");

    //     return await commands.task.edit({
    //         id,
    //         text
    //     });
    // }
}