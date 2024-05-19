import { Command } from "./command";

export default {
    name: "say",
    execute: (context, bot) => {
        bot.chat(context.raw)
    }
} satisfies Command