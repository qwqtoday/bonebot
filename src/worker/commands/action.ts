import { ControlState } from 'mineflayer';
import { Command } from './command';

const controlStates = [
	'forward',
	'back',
	'left',
	'right',
	'jump',
	'sprint',
	'sneak',
];

export default {
	name: 'action',
	execute: (context, bot) => {
		const action = context.args[0] as ControlState;
		const time = parseInt(context.args[1]) * 100 || 100;
		if (!controlStates.includes(action)) {
			context.respond(`invalid control state. correct usage: action [${controlStates.join(',')}] [time]`);
			return;
		}

		bot.setControlState(action, true);
		setTimeout(() => bot.setControlState(action, false), time);
	},
} satisfies Command;