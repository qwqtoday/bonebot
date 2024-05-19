import { Vec3 } from "vec3";
import { Command } from "./command";
import Cuboid from "mineflayer-cuboid";

export default {
  name: "floor",
  async execute(context, bot) {
    let blockName = context.args[0];
    let point_a = context.args[1];
    let point_b = context.args[2];

    let itemInfo = bot.registry.itemsByName[blockName];

    if (itemInfo === undefined) {
      context.respond("Cannot find that type of block");
      return;
    }

    let [ax, ay, az] = point_a.split(",").map((n) => parseInt(n));
    let [bx, by, bz] = point_b.split(",").map((n) => parseInt(n));

    if (ax > bx || az > bz) {
      context.respond("ax must be less than bx and az must be less than bz");
      return;
    }

    if (ay != by) {
      context.respond("ay must equal to by");
      return;
    }

    try {
      await bot.equip(itemInfo.id, "off-hand");
    } catch (e) {
      console.log(e);
      context.respond("Equipping that block failed");
      return;
    }

    bot.chat(`/ci enableautofill ${itemInfo.name}`);
    bot.chat("/assist autofloor true");

    const floorTask = bot.task.tasks["floor"];
    floorTask.info.area = new Cuboid(
      new Vec3(ax, ay, az),
      new Vec3(bx, by, bz),
    );

    floorTask.info.switching_x = false;
    floorTask.info.row = 0;

    bot.autoEat.options.offhand = false;

    bot.task.start("floor");
  },
} satisfies Command;
