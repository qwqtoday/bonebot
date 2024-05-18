import { Bot } from "mineflayer"
import task from "./task";
import say from "./say";
import look from "./look";
import action from "./action";
import toss from "./toss";
import tp from "./tp";
import sit from "./sit";


export interface Command {
    name: string

    execute: (context: CommandContext, bot: Bot) => void
}

export interface CommandContext {
    name: string
    args: string[]
    raw: string
    respond: (message: string) => void
}


export const commands: {[name: string]: Command} = {
    task,
    say,
    look,
    action,
    toss,
    tp,
    sit
}