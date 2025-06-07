/**
 * @file
 * Console-based UI for manual testing of the game loop.
 * 
 * To run this test, run `node <path_here>/ConsoleUI.js` in the terminal.
 */

// glue code to allow CommonJS repl
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const repl = require('repl');

import { ConsoleUI } from "../../../frontend/consoleUI.js";
import { gameHandler } from "../../../backend/gameHandler.js";

let ui = new ConsoleUI();
let handler = new gameHandler(ui);


console.log("--------------------------------------\nNew? Try `game.help()` to see available commands.\n--------------------------------------");

// more glue because `-i` doesn't work with ESM
const r = repl.start();
r.context.handler = handler;
r.context.game = ui;