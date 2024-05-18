import { loadClientEnv } from "./client-env";
import { Bot, BotOptions, createBot } from "mineflayer";
import { taskManager } from "./task/task";
import { loader as autoEat } from "@nxg-org/mineflayer-auto-eat";
import { Command, CommandContext, commands } from "./commands/command";
import { getConfig } from "../config";
import { CommandMessage, Message } from "../messages";

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
async function startBot() {
  console.log(`starting bot ${env.nickname}`);

  bot = createBot(options);
  // load plugins
  bot.loadPlugin(taskManager);
  bot.loadPlugin(autoEat);

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

  bot.on("whisper", (sender, message) => {
    // Check is the user allowed to use this bot, if it is not, then return
    if (!config.minecraft.allowed_users.includes(sender)) return;

    let [command, ...args] = message.split(" ");
    bot.executeCommand({
      name: command,
      args: args,
      raw: args.join(" "),
      respond: (message) => bot.whisper(sender, message),
    });
  });

  bot.once("spawn", () => {
    console.log(`Bot ${env.nickname} has been spawned.`);
    bot.chatAddPattern(
      new RegExp(
        `(?:\\(.{1,15}\\)|\\[.{1,15}\\]|.){0,5}?(\\w+) -> ${bot.username}: (.*)`,
      ),
      "whisper",
    );
  });

  bot.once("end", (reason) => {
    console.log(
      `bot ${env.nickname} ended for ${reason}. restartting in 1 minutes`,
    );
    setTimeout(startBot, 60000);
  });

  bot.on("error", (err) => {
    console.error(`bot ${env.nickname} has occured an error.\n${err}`);
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
