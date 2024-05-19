import { Command } from "./command";

export default {
    name: "toss",
    execute: async (context, bot) => {
        const target = context.args[0]
        if (target == "all") {
            for (let i = 0; i < bot.inventory.items().length; i++) {
                let item = bot.inventory.items()[i--];
                await bot.tossStack(item);
            }
            return;
        }
        
    }
} satisfies Command