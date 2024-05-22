import { loadClientEnv } from './client-env';
import { Bot, BotOptions, createBot } from 'mineflayer';
import { taskManager } from './task/task';
import { plugin as autoEat } from 'mineflayer-auto-eat';
import { Command, CommandContext, commands } from './commands/command';
import { getConfig } from '../config';
import { CommandMessage, Message } from '../messages';
import { setup_database } from '../database/database';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { getUserIdFromUUID, getUserLevel } from '../database/tables/user/users';
import { getOwnerIdFromNickname } from '../database/tables/worker/workers';
import { Movements, pathfinder } from 'mineflayer-pathfinder';

const env = loadClientEnv();
const config = getConfig();

const options: BotOptions = {
	host: env.host,
	port: env.port,
	username: env.account,
	version: config.minecraft.version,
	auth: 'microsoft',
};

declare module 'mineflayer' {
    interface Bot {
        nickname: string;
        executeCommand: (context: CommandContext) => void;
    }
}

let bot: Bot;
async function startBot(db: NodePgDatabase | null = null) {
	if (db === null) {
		db = await setup_database(config);
	}

	console.log(`starting bot ${env.nickname}`);

	bot = createBot(options);
	
	console.log(`registry version ${bot.registry.version.minecraftVersion}`)
	
	// @ts-ignore
	console.log(bot.registry.dimensionsByName)

	// load plugins
	taskManager(bot, db);
	bot.loadPlugin(autoEat);
	bot.loadPlugin(pathfinder)

	bot.nickname = env.nickname;

	bot.executeCommand = (context) => {
		const command: Command = commands[context.name];
		if (command === undefined) {
			context.respond('Command not found.');
			return;
		}
		try {
			command.execute(context, bot);
		}
		catch (err) {
			console.error(err);
		}
	};

	bot.on('whisper', async (sender, message) => {
		const uuid = bot.players[sender]?.uuid;
		if (uuid === null || uuid === undefined) return;
		const user_id = await getUserIdFromUUID(db, uuid);
		if (user_id === null) {return;}

		const user_level = await getUserLevel(db, user_id);

		const owner_id = await getOwnerIdFromNickname(db, bot.nickname);

		// Check is the user allowed to use this bot, if it is not, then return
		if (user_level >= 2 || owner_id == user_id) {
			const [command, ...args] = message.split(' ');
			bot.executeCommand({
				name: command,
				args: args,
				raw: args.join(' '),
				respond: (message) => bot.whisper(sender, message),
			});
		}
	});

	bot.once('spawn', () => {
		console.log(`Bot ${env.nickname} has been spawned.`);
		bot.chatAddPattern(
			new RegExp(
				`(?:\\(.{1,15}\\)|\\[.{1,15}\\]|.){0,5}?(\\w+) -> ${bot.username}: (.*)`,
			),
			'whisper',
		);
		bot.autoEat.enable();
		
		// setup movements
		const movements = new Movements(bot)
		bot.pathfinder.setMovements(movements)
		movements.allowSprinting = true
		movements.allowParkour = true
		movements.canDig = false
	});

	bot.once('end', (reason) => {
		console.log(
			`bot ${env.nickname} ended for ${reason}. restartting in 1 minutes`,
		);
		setTimeout(() => startBot(db), 60000);
	});
	bot.on('dismount', () => {
		console.log('dismount');
	});

	bot.on('error', (err) => {
		console.error(`bot ${env.nickname} has occured an error.\n${err}`);
		bot.end();
		bot.emit('end', err.message);
	});
}
process.on('message', (msg) => {
	const message: Message = JSON.parse(msg as string);

	switch (message.type) {
	case 'command':
		{
			const commandMessage = message as CommandMessage;
			bot.executeCommand({
				name: commandMessage.command,
				args: commandMessage.args,
				raw: commandMessage.args.join(' '),
				respond: () => undefined,
			});
		}
		break;
	}
});

startBot();
