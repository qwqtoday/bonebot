export default interface ClientEnv {
    host: string
    port: number
    account: string
    nickname: string
}

export function loadClientEnv() : ClientEnv {
    return {
        host: process.env.SERVER_HOST ?? "ab.natoriqct.xyz",
        port: parseInt(process.env.SERVER_PORT) ?? 25565,
        account: process.env.ACCOUNT,
        nickname: process.env.NICKNAME
    }
}

export function buildClientEnv(env: ClientEnv) : NodeJS.ProcessEnv {
    return {
        SERVER_HOST: env.host,
        SERVER_PORT: env.port.toString(),
        ACCOUNT: env.account,
        NICKNAME: env.nickname
    }
}