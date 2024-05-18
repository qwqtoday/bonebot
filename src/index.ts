import { getConfig } from "./config";
import { app } from "./app";
import { createClientManager } from "./manager";
import { scheduler } from "timers/promises"

const config = getConfig()
const clientManager = createClientManager(config)

clientManager.clients.forEach((client) => {
    clientManager.start(client.options.nickname)
    scheduler.wait(3000)
})

app.set("client manager", clientManager)

app.listen(config.app.port)