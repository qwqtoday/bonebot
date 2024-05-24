import { Vec3 } from 'vec3';
import { Command } from './command';
import { goals } from 'mineflayer-pathfinder';

export default {
	name: 'goto',
	execute: (context, bot) => {
		const coordArr = context.args[0].split(',');
		if (coordArr.length != 3) {
			context.respond('usage: goto x,y,z');
			return;
		}
		const [x, y, z] = coordArr.map((n) => parseInt(n));
		
        const goal = new goals.GoalBlock(x, y, z)

        bot.pathfinder.setGoal(goal, true)
	},
} satisfies Command;