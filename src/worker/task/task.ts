import { Bot } from 'mineflayer';
import attack from './tasks/attack';
import fish from './tasks/fish';
import ciPut from './tasks/ciPut';
import floor from './tasks/floor';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import tnt_tag from './tasks/tnt_tag';
import sneak_jump from './tasks/sneak_jump';

declare module 'mineflayer' {
  interface Bot {
    task: TaskPlugin;
  }
}

export interface TaskPlugin {
  start: (name: string) => void;
  stop: () => void;
  tasks: { [name: string]: Task };
  currentTask?: string;
  nextTaskRun: number;
}

export interface Task {
  load: (bot: Bot) => void;
  run: (bot: Bot) => boolean | Promise<boolean>;
  default_options: TaskOptions;
  options?: TaskOptions;
  info: TaskInfo;
}

// Info is for constant information for the task
export type TaskInfo = {
  noDelay: boolean;
  [field: string]: any;
};

// Options is for information that might be changed
export type TaskOptions = {
  delay: number;
  [field: string]: any;
};

const tasks: { [name: string]: Task } = {
	attack: attack,
	fish: fish,
	ciPut: ciPut,
	floor: floor,
	tnt_tag,
	sneak_jump
};

export function taskManager(bot: Bot, db: NodePgDatabase) {
	bot.task = {
		start: startTask,
		stop: stopTask,
		currentTask: null,
		nextTaskRun: 0,
		tasks: tasks,
	};


	Object.values(tasks).forEach((task) => {
		task.options = Object()
		Object.assign(task.options, task.default_options)
		task.load(bot);
	});


	function startTask(name: string) {
		if (!Object.keys(tasks).includes(name))
			throw new Error("No task with that specified name")
		
		bot.task.currentTask = name;
	}
	function stopTask() {
		bot.pathfinder.stop()
		bot.autoEat.options.offhand = true
		bot.task.currentTask = null;
	}

	bot.on('physicsTick', async () => {
		if (!bot.task.currentTask) return

		const task = bot.task.tasks[bot.task.currentTask];
		if (!task.info.noDelay && bot.task.nextTaskRun > Date.now()) return;

		try {
			const hadRunProm = task.run(bot);
			if (task.info.noDelay) return;
			const hadRun =
        		hadRunProm instanceof Promise ? await hadRunProm : hadRunProm;
					if (hadRun) {
						bot.task.nextTaskRun = Date.now() + task.options.delay;
					}
		}
		catch (err) {
			console.error(err);
		}
	});
}
