import { Vec3 } from 'vec3';
import { Command } from './command';

export default {
	name: 'look',
	execute: (context, bot) => {
		const coordArr = context.args[0].split(',');
		if (coordArr.length != 3) {
			context.respond('usage: look x,y,z');
			return;
		}
		const [x, y, z] = coordArr;
		const pos = new Vec3(parseInt(x), parseInt(y), parseInt(z));
		bot.lookAt(pos);
	},
} satisfies Command;