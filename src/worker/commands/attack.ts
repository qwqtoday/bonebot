import { Command } from './command';

export default {
	name: 'attack',
	execute: (context, bot) => {
		const delay = parseInt(context.args[0]);
		if (isNaN(delay)) {
			context.respond('Invalid delay. usage: attack [delayMS] [entity1] [entity2] [entity3] ....');
			return;
		}
		if (delay < 1000) {
			context.respond('Delay must be at least 1000 ms');
			return;
		}
		bot.task.tasks['attack'].options.delay = delay;
		bot.task.tasks['attack'].options.entities = context.args.slice(1);
	},
} satisfies Command;