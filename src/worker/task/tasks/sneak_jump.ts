import { Bot } from 'mineflayer';
import { Task, TaskOptions } from '../task';

const NAME = 'sneak_jump';

export default {
	load: (bot) => {},
	run(bot) {
		const info = bot.task.tasks[NAME].info
        if (info.next === undefined) {
            info.next = "sneak"
        }
        const action = info.next
        bot.setControlState(action, true)
        bot.waitForTicks(5)
            .then(() => bot.setControlState(action, false))
        info.next = info.next == "sneak" ? "jump" : "sneak"
		return true;
	},
	default_options: {
		delay: 1500,
		entities: [],
	},
	info: {
		noDelay: false,
	},
} satisfies Task;
