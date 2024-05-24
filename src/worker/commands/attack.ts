import { Command } from './command';

export default {
	name: 'attack',
	execute: (context, bot) => {
		const delay = parseInt(context.args[0]);
		if (isNaN(delay)) {
			context.respond('Invalid delay. usage: attack [delayMS] [entity1] [entity2] [entity3] ....');
			return;
		}
		if (delay < 500) {
			context.respond('Delay must be at least 500 ms');
			return;
		}
		bot.task.tasks['attack'].options.delay = delay;
		bot.task.tasks['attack'].options.entities = context.args.slice(1);
	},
} satisfies Command;