import { Command } from './command';

export default {
	name: 'sit',
	execute: (context, bot) => {
		bot.chat('/sit');
	},
} satisfies Command;