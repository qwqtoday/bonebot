import { Vec3 } from "vec3";
import { Command } from "./command"

export default {
    name: "look",
    execute: (context, bot) => {
        let coordArr = context.args[0].split(",")
        if (coordArr.length != 3) {
            context.respond("usage: look x,y,z")
            return;
        }
        let [x, y, z] = coordArr
        let pos = new Vec3(parseInt(x), parseInt(y), parseInt(z))
        bot.lookAt(pos)
    }
} satisfies Command