import fs from "fs";

export interface Config {
    name: string
    owner: string
    app: AppConfig
    minecraft: MinecraftConfig
}

export interface AppConfig {
    port: number
}
export interface MinecraftConfig {
    host: string
    port: number
    version: string
    allowed_users: string[]
    instances: InstanceConfig[]
}


export interface InstanceConfig {
    job: string
    nickname: string
    account: string
    viewDistance?: number
}


export function getConfig() : Config {
    let content = fs.readFileSync("./config.json", "utf-8")
    return JSON.parse(content)
}