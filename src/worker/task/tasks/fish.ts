import { Entity } from 'prismarine-entity';
import { Task } from '../task';

const NAME = 'fish';

export default {
	load: (bot) => {
		const info = bot.task.tasks[NAME].info;
		info.isFishing = false;
	},
	async run(bot) {
		const info = bot.task.tasks[NAME].info;
		if (info.isFishing) {return;}

		try {
			info.isFishing = true;
			await bot.look(bot.entity.yaw, 0, true);
			await bot.waitForTicks(5);
			await bot.equip(bot.registry.itemsByName.fishing_rod.id, 'hand');
			await bot.waitForTicks(Math.floor((Math.random() * 50) + 1));
			await bot.fish();
		}
		catch {

		}
		finally {
			info.isFishing = false;
		}
		return false;
	},
	default_options: {
		delay: 0,
	},
	info: {
		noDelay: true,
	},
} satisfies Task;