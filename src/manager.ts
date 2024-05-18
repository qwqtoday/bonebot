import { ChildProcess, fork } from "child_process";
import { Config, InstanceConfig } from "./config";
import { buildClientEnv } from "./bot/client-env";
import { CommandMessage } from "./messages";

export interface ClientManager {
  clients: Map<string, Client>;

  start: (name: string) => void;
  stop: (name: string) => void;
  getInfo: (name: string) => ClientInfo;

  executeCommand: (name: string, command: string, args: string[]) => void;
}

export interface Client {
  process?: ChildProcess;
  options: InstanceConfig;
  env: NodeJS.ProcessEnv;
  state: ClientState;
  info?: ClientInfo;
}

export type ClientState = "STOPPED" | "STARTED";

export interface ClientInfo {
  currentIsland?: number;
}

export function createClientManager(config: Config): ClientManager {
  const clients = new Map();

  config.minecraft.instances.forEach((instanceConfig) => {
    const client: Client = {
      options: instanceConfig,
      state: "STOPPED",
      env: buildClientEnv({
        host: config.minecraft.host,
        port: config.minecraft.port,
        account: instanceConfig.account,
        nickname: instanceConfig.nickname,
      }),
      info: null,
    };

    clients.set(instanceConfig.nickname, client);
  });

  function getClient(name: string): Client {
    const client = clients.get(name);
    if (client === undefined)
      throw new ClientManagerError("No client with that specified name.", 404);

    return client;
  }

  function startClient(name: string) {
    const client = getClient(name);
    if (client.state != "STOPPED")
      throw new ClientManagerError("Client is not stopped.", 409);

    const process = fork("./dist/bot/client.js", { env: client.env });

    client.process = process;
    client.state = "STARTED";
    client.info = {};
  }

  function stopClient(name: string) {
    const client = getClient(name);
    if (client.state == "STOPPED")
      throw new ClientManagerError("Client is already stopped.", 409);

    client.process.kill();
    client.state = "STOPPED";
    client.info = null;
  }

  function getClientInfo(name: string): ClientInfo {
    const client = getClient(name);
    if (client.state != "STARTED")
      throw new ClientManagerError("Client is not started.", 409);

    return client.info;
  }

  function executeCommand(name: string, command: string, args: string[]) {
    const client = getClient(name);
    if (client.state != "STARTED")
      throw new ClientManagerError("Client is not started.", 409);

    const message: CommandMessage = {
      type: "command",
      command: command,
      args: args,
    };

    client.process.send(JSON.stringify(message));
  }

  const clientManager: ClientManager = {
    clients: clients,
    start: startClient,
    stop: stopClient,
    getInfo: getClientInfo,
    executeCommand: executeCommand,
  };

  return clientManager;
}

export class ClientManagerError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}
