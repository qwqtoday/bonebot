import { Bot } from 'mineflayer';
import { Task, TaskOptions } from '../task';

const NAME = 'attack';

export default {
	load: (bot) => {},
	run(bot) {
		bot.autoEat.options.offhand = true;
		const options = bot.task.tasks[NAME].options;
		const entities: number[] = (options.entities as string[]).map((entityName) => bot.registry.entitiesByName[entityName]?.id);
		const nearestEntity = bot.nearestEntity(
			(entity) =>
				entities.includes(entity.entityType) &&
          		bot.entity.position.distanceTo(entity.position) < 3,
		)

		if (nearestEntity === null) return false;

		bot.attack(nearestEntity);
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
