import { Bot, Chest } from 'mineflayer';
import { Task, TaskOptions } from '../task';
import { Window } from 'prismarine-windows';


const NAME = 'ciPut';

export default {
	load: (bot) => {

	},
	run(bot) {
		const options = bot.task.tasks[NAME].options;
		async function windowOpen(window: Window<Chest>) {
			// @ts-ignore
			if (window.title.value != '上传物品') {
				console.log(window.title);
				bot.off('windowOpen', windowOpen);
				return;
			}
			const items = window.itemsRange(54, 89).filter((item) =>
				options.items.includes(item.name));

			const itemCount: Map<number, number> = new Map();
			items.forEach((item) => itemCount.set(item.type, itemCount.has(item.type) ? itemCount.get(item.type) + item.count : item.count));
			try {
				for (const item of itemCount) {
					await bot.transfer({
						window: window,
						itemType: item[0],
						metadata: null,
						count: item[1],
						destStart: 0,
						destEnd: 53,
						sourceStart: 54,
						sourceEnd: 89,
					});
				}
			}
			catch (err) {
				console.error(err);
			}
			finally {
				bot.off('windowOpen', windowOpen);
			}
		}
		bot.chat('/ci put');
		bot.on('windowOpen', windowOpen);
		return true;
	},
	default_options: {
		delay: 3000,
		items: [],
	},
	info: {
		noDelay: false,
	},
} satisfies Task;