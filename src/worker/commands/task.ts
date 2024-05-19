import { Command } from './command';

export default {
	name: 'task',
	execute: (context, bot) => {
		switch (context.args[0]) {
		case 'start':
			bot.task.start(context.args[1]);
			break;
		case 'stop':
			bot.task.stop();
			break;
		}
	},
} satisfies Command;