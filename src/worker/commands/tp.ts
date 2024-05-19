import { Command } from './command';

export default {
	name: 'tp',
	execute: async (context, bot) => {
		const target = context.args[0];
		if (isNaN(Number(target))) {
			bot.chat(`/is tp ${target}`);
			return;
		}
		bot.chat(`/visit id ${target}`);
	},
} satisfies Command;