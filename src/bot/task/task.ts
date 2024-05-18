import { Bot } from "mineflayer";
import attackTask from "./tasks/attack";
import { loadTaskConfig, syncTaskConfig } from "./task-config";
import fish from "./tasks/fish";
import ciPut from "./tasks/ciPut";

declare module "mineflayer" {
    interface Bot {
        
        task: TaskPlugin
    }
}

export interface TaskPlugin {
    start: (name: string) => void
    stop: () => void
    tasks: {[name: string]: Task}
    currentTask?: string
    nextTaskRun: number
}

export interface Task {
    load: (bot: Bot) => void
    run: (bot: Bot) => boolean | Promise<boolean>
    default_options: TaskOptions
    options?: TaskOptions
    info: TaskInfo
}

// Info is for constant information for the task 
export type TaskInfo =
{
    noDelay: boolean
    [field: string]: any
}

// Options is for information that might be changed
export type TaskOptions = 
{   
    delay: number,
    [field: string]: any
}

const tasks: {[name: string]: Task} = {
    attack: attackTask,
    fish: fish,
    ciPut: ciPut
}

export function taskManager(bot: Bot) {
    bot.task = {
        start: startTask,
        stop: stopTask,
        currentTask: null,
        nextTaskRun: 0,
        tasks: tasks
    }

    Object.values(tasks).forEach((task) => {
        task.load(bot)
    })
    
    loadTaskConfig(bot.nickname, bot.task)

    function startTask(name: string) {
        bot.task.currentTask = name
        syncTaskConfig(bot.nickname, bot.task)
    }
    function stopTask() {
        bot.task.currentTask = null
        syncTaskConfig(bot.nickname, bot.task)
    }

    bot.on("physicsTick", async () => {
        if (!bot.task.currentTask)
            return;

        let task = bot.task.tasks[bot.task.currentTask]
        if ((!task.info.noDelay) && bot.task.nextTaskRun > Date.now()) 
            return;

        try {
            let hadRunProm = task.run(bot)
            if (task.info.noDelay) 
                return;
            let hadRun = hadRunProm instanceof Promise ? await hadRunProm : hadRunProm
            if (hadRun) {
                bot.task.nextTaskRun = Date.now() + task.options.delay
            }
        } catch (err) {
            console.error(err)
        }
    })
}