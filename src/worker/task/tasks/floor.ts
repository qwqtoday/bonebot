import { Task } from "../task";
import Cuboid from "mineflayer-cuboid";
import { Vec3 } from "vec3";
const NAME = "floor";

export default {
  load: (bot) => {},
  run(bot) {
    let info = bot.task.tasks[NAME].info;

    if (info.area === undefined || info.switching_x === undefined) {
      bot.task.stop();
    }
    // if it ran out of item, end.
    if (bot.inventory.slots[45] === null) {
      bot.setControlState("forward", false);
      bot.setControlState("sprint", false);
      bot.task.stop();
    }

    // set information
    let pos = bot.entity.position;

    // set area
    let area: Cuboid = info.area;

    // values that can change every tick
    let shouldX = area.point1.x + (info.row * 3 + 1.5);
    let startZ = info.row % 2 == 0 ? area.point1.z + 1 : area.point2.z - 1;
    let goalZ = info.row % 2 == 0 ? area.point2.z - 1 : area.point1.z + 1;

    if (!info.switching_x && Math.abs(pos.x - shouldX) > 0.3) {
      bot.lookAt(new Vec3(shouldX, area.point1.y + 2, startZ), true);
      bot.setControlState("forward", true);
      bot.setControlState("sprint", true);
    } else if (
      Math.abs(pos.x - shouldX) <= 0.3 &&
      Math.abs(pos.z - goalZ) > 0.3
    ) {
      bot.lookAt(new Vec3(shouldX, area.point1.y + 2, goalZ));
      bot.setControlState("forward", true);
      bot.setControlState("sprint", true);
    } else if (
      !info.switching_x &&
      Math.abs(pos.x - shouldX) <= 0.3 &&
      Math.abs(pos.z - goalZ) < 0.3
    ) {
      info.row += 1;
      // check end
      if (info.row > area.getXWidth() / 3) {
        bot.setControlState("forward", false);
        bot.setControlState("sprint", false);
        bot.task.stop();
        return;
      }
      info.switching_x = true;
    } else if (info.switching_x && Math.abs(pos.x - shouldX) > 0.3) {
      bot.lookAt(new Vec3(shouldX, area.point1.y + 2, startZ), true);
      bot.setControlState("forward", true);
      bot.setControlState("sprint", true);
    } else if (info.switching_x && Math.abs(pos.x - shouldX) < 0.3) {
      info.switching_x = false;
    } else {
      bot.setControlState("forward", false);
      bot.setControlState("sprint", false);
    }

    return false;
  },
  default_options: {
    delay: 0,
  },
  info: {
    noDelay: true,
  },
} satisfies Task;
