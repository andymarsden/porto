

// import {
//     createNote,
//     editNote
// } from "$lib/actions/notes";

export const debugCommands = {

    async echo({text}){
        return `Echo: ${text}`;
    }
    // async new({ text }) {
    //     return await createNote({ text });
    // },

    // async edit({ id, text }) {
    //     return await editNote({ id, text });
    // }
};