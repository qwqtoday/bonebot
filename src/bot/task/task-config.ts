import fs from "fs";
import { Task, TaskOptions, TaskPlugin } from "./task";

export interface TaskConfig {
    currentTask?: string
    tasks?: {
        [name: string]: TaskOptions
    }
}

export function loadTaskConfig(name: string, taskPlugin: TaskPlugin)  {
    const taskConfigPath = `./${name}.taskconfig.json`

    if (!fs.existsSync(taskConfigPath)) {
        taskPlugin.currentTask = null

        for (let name in taskPlugin.tasks) {
            let task = taskPlugin.tasks[name]
            task.options = Object()
            Object.assign(task.options, task.default_options)
        }
        
        syncTaskConfig(name, taskPlugin)
        return;
    }

    let content = fs.readFileSync(taskConfigPath, "utf-8")
    let taskConfig: TaskConfig = JSON.parse(content)
    taskPlugin.currentTask = taskConfig.currentTask
    for (let name in taskPlugin.tasks) {
        taskPlugin.tasks[name].options = Object()
        Object.assign(taskPlugin.tasks[name].options, taskPlugin.tasks[name].default_options)
        Object.assign(taskPlugin.tasks[name].options, taskConfig.tasks[name])
    }

    syncTaskConfig(name, taskPlugin)
}

export function syncTaskConfig(name: string, taskPlugin: TaskPlugin) {
    const taskConfigPath = `./${name}.taskconfig.json`

    let taskConfig: TaskConfig = {
        currentTask: taskPlugin.currentTask,
        tasks: {} 
    }
    for (let name in taskPlugin.tasks) {
        taskConfig.tasks[name] = Object()
        Object.assign(taskConfig.tasks[name], taskPlugin.tasks[name].options)
    }

    let content = JSON.stringify(taskConfig, null, "    ");
    fs.writeFileSync(taskConfigPath, content)
}