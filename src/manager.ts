import { ChildProcess, fork } from "child_process";
import { Config, InstanceConfig } from "./config";
import { buildClientEnv } from "./worker/client-env";
import { CommandMessage } from "./messages";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { workers } from "./database/tables/worker/workers";
import { eq } from "drizzle-orm";

export interface WorkerManager {
  workers: Map<string, Worker>;

  start: (name: string) => void;
  stop: (name: string) => void;
  getInfo: (name: string) => WorkerInfo;

  executeCommand: (name: string, command: string, args: string[]) => void;
}

export interface Worker {
  process?: ChildProcess;
  env: NodeJS.ProcessEnv;
  state: WorkerState;
  info?: WorkerInfo;
}

export type WorkerState = "STOPPED" | "STARTED";

export interface WorkerInfo {
  currentIsland?: number;
}

export async function createWorkerManager(config: Config, db: NodePgDatabase): Promise<WorkerManager> {
  const _workers = new Map();

  let all_workers = await db.select().from(workers)
  all_workers
    .filter(({state}) => state == 1)
    .forEach(
      ({account, nickname}) => addWorker(nickname, account))

  async function loadWorker(name: string) {
    let res = await db.select().from(workers).where(eq(workers.nickname, name))
    let workerData = res[0]

    addWorker(workerData.nickname, workerData.account)
  }

  function addWorker(nickname: string, account: string) {
    const worker: Worker = {
      state: "STOPPED",
      env: buildClientEnv({
        host: config.minecraft.host,
        port: config.minecraft.port,
        account: account,
        nickname: nickname,
      }),
      info: null,
    };

    _workers.set(nickname, worker);
  }

  function getWorker(name: string): Worker {
    const worker = _workers.get(name);
    if (worker === undefined)
      throw new ClientManagerError("No worker with that specified name.", 404);

    return worker;
  }

  function startWorker(name: string) {
    const client = getWorker(name);
    if (client.state != "STOPPED")
      throw new ClientManagerError("Client is not stopped.", 409);

    const process = fork("./dist/worker/worker.js", { env: client.env });

    client.process = process;
    client.state = "STARTED";
    client.info = {};
  }

  function stopWorker(name: string) {
    const client = getWorker(name);
    if (client.state == "STOPPED")
      throw new ClientManagerError("Client is already stopped.", 409);

    client.process.kill();
    client.state = "STOPPED";
    client.info = null;
  }

  function getWorkerInfo(name: string): WorkerInfo {
    const worker = getWorker(name);
    if (worker.state != "STARTED")
      throw new ClientManagerError("Client is not started.", 409);

    return worker.info;
  }

  function executeCommand(name: string, command: string, args: string[]) {
    const worker = getWorker(name);
    if (worker.state != "STARTED")
      throw new ClientManagerError("Client is not started.", 409);

    const message: CommandMessage = {
      type: "command",
      command: command,
      args: args,
    };

    worker.process.send(JSON.stringify(message));
  }

  const clientManager: WorkerManager = {
    workers: _workers,
    start: startWorker,
    stop: stopWorker,
    getInfo: getWorkerInfo,
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
