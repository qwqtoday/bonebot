import { scheduler } from 'timers/promises';
import { getConfig } from './config';
import { createWorkerManager } from './manager';
import { setup_database } from './database/database';


async function main() {
	const config = getConfig();
	const db = await setup_database(config);
	const workerManager = await createWorkerManager(config, db);


	for (const [nickname, worker] of workerManager.workers.entries()) {
		workerManager.start(nickname);
		break;
	}
}

main();
