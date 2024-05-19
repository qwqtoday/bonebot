import { Command } from "./command";

export default {
    name: "ciPut",
    execute: (context, bot) => {
        let delay = parseInt(context.args[0])
        if (isNaN(delay)) {
            context.respond("Invalid delay. usage: attack [delayMS] [entity1] [entity2] [entity3] ....")
            return;
        }
        if (delay < 1500) {
            context.respond("Delay must be at least 1500 ms")
            return;
        }
        bot.task.tasks["ciPut"].options.delay = delay
        bot.task.tasks["ciPut"].options.items = context.args.slice(1)
    }
} satisfies Command