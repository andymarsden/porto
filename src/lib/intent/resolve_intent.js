import { commands } from "$lib/commands";

export async function resolveIntent(input) {

    if (input.startsWith("/n ")) {

        const text = input.replace("/n ", "");

        return await commands.note.new({
            text
        });
    }

    if(input.startsWith("/echo ")){

        const text = input.replace("/echo ", "");

        return await commands.debug.echo({text});
    }

    // if (input.startsWith("/ne ")) {

    //     const [, id, text] = input.split("|");

    //     return await commands.note.edit({
    //         id,
    //         text
    //     });
    // }

    // if (input.startsWith("/t ")) {

    //     const text = input.replace("/t ", "");

    //     return await commands.task.new({
    //         text
    //     });
    // }

    // if (input.startsWith("/te ")) {

    //     const [, id, text] = input.split("|");

    //     return await commands.task.edit({
    //         id,
    //         text
    //     });
    // }
}