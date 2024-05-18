import { Command } from "./command";

export default {
    name: "tp",
    execute: async (context, bot) => {
        const target = context.args[0]
        bot.chat(`/visit id ${target}`)
    }
} satisfies Command