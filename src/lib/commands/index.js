// Command registry
// This file is the entry point for all commands. It imports the command modules and exports them as a single object that can be used by the command handler.

// import { noteCommands } from "./note";
// import { taskCommands } from "./task";

// export const commands = {
//     note: noteCommands,
//     task: taskCommands
// };

import { debugCommands } from "./debug";
import { basicDetailsCommands } from "./basic-details";
import { foodCommands } from "./food";
import { playCommands } from "./play";

export const commands = {
    debug: debugCommands,
    basicDetails: basicDetailsCommands,
    food: foodCommands,
    play: playCommands
    // note: noteCommands,
    // task: taskCommands
};