import { loadClientEnv } from "./client-env";
import { Bot, BotOptions, createBot } from "mineflayer";
import { taskManager } from "./task/task";
import { plugin as autoEat } from "mineflayer-auto-eat";
import { Command, CommandContext, commands } from "./commands/command";
import { getConfig } from "../config";
import { CommandMessage, Message } from "../messages";
import { setup_database } from "../database/database";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { getUserIdFromUUID, getUserLevel, users } from "../database/tables/user/users";
import { getOwnerIdFromNickname } from "../database/tables/worker/workers";

const env = loadClientEnv();
const config = getConfig();

const options: BotOptions = {
  host: env.host,
  port: env.port,
  username: env.account,
  auth: "microsoft",
};

declare module "mineflayer" {
  interface Bot {
    nickname: string;
    executeCommand: (context: CommandContext) => void;
  }
}

let bot: Bot;
async function startBot(db: NodePgDatabase = null) {
  if (db === null) {
    db = await setup_database(config)
  }

  console.log(`starting bot ${env.nickname}`);

  bot = createBot(options);
  
  // load plugins
  taskManager(bot, db)
  bot.loadPlugin(autoEat);

  bot._client.on("packet", (data, meta) => {
    const excludedPackets = [
      "ping",
      "keep_alive",
      "update_time",
      "map_chunk"
    ]

    if (excludedPackets.includes(meta.name)) return;
    console.log(meta.name, data)
  })
  bot.nickname = env.nickname;

  bot.executeCommand = (context) => {
    let command: Command = commands[context.name];
    if (command === undefined) {
      context.respond("Command not found.");
      return;
    }
    try {
      command.execute(context, bot);
    } catch (err) {
      console.error(err);
    }
  };

  bot.on("whisper", async (sender, message) => {
    let uuid = bot.players[sender]?.uuid
    if (uuid === null || uuid === undefined) return;
    let user_id = await getUserIdFromUUID(db, uuid)
    if (user_id === null)
      return;

    let user_level = await getUserLevel(db, user_id)
    
    let owner_id = await getOwnerIdFromNickname(db, bot.nickname)
    
    // Check is the user allowed to use this bot, if it is not, then return
    if (user_level >= 2 || owner_id == user_id) {
      let [command, ...args] = message.split(" ");
      bot.executeCommand({
        name: command,
        args: args,
        raw: args.join(" "),
        respond: (message) => bot.whisper(sender, message),
      });
    }
  });

  bot.once("spawn", () => {
    console.log(`Bot ${env.nickname} has been spawned.`);
    bot.chatAddPattern(
      new RegExp(
        `(?:\\(.{1,15}\\)|\\[.{1,15}\\]|.){0,5}?(\\w+) -> ${bot.username}: (.*)`,
      ),
      "whisper",
    );
    bot.autoEat.enable()
  });

  bot.once("end", (reason) => {
    console.log(
      `bot ${env.nickname} ended for ${reason}. restartting in 1 minutes`,
    );
    setTimeout(() => startBot(db), 60000);
  });
  bot.on("dismount", () => {
    console.log("dismount")
  })

  bot.on("error", (err) => {
    console.error(`bot ${env.nickname} has occured an error.\n${err}`);
    bot.end()
    bot.emit("end", err.message);
  });
}
process.on("message", (msg) => {
  const message: Message = JSON.parse(msg as string);

  switch (message.type) {
    case "command":
      {
        let commandMessage = message as CommandMessage;
        bot.executeCommand({
          name: commandMessage.command,
          args: commandMessage.args,
          raw: commandMessage.args.join(" "),
          respond: () => undefined,
        });
      }
      break;
  }
});

startBot();
