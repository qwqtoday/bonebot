import fs from 'fs';
import { Task, TaskOptions, TaskPlugin } from './task';

export interface TaskConfig {
    currentTask?: string
    tasks?: {
        [name: string]: TaskOptions
    }
}