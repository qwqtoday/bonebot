import { Bot } from "mineflayer";
import { Task, TaskOptions } from "../task";

const NAME = "attack"

export default {
    load: (bot) => {

    },
    run(bot) {
        const options = bot.task.tasks[NAME].options
        const entities: string[] = options.entities
        let nearbyEntities = Object.values(bot.entities).filter((entity) => 
            entities.includes(entity.name) && 
            bot.entity.position.distanceTo(entity.position) < 3
        ).sort((entity_a, entity_b) => 
            bot.entity.position.distanceTo(entity_a.position) - bot.entity.position.distanceTo(entity_b.position) )
        
        if (nearbyEntities.length == 0)
            return false;

        bot.attack(nearbyEntities[0])
        return true;
    },
    default_options: {
        delay: 1500,
        entities: []
    },
    info: {
        noDelay: false
    }
} satisfies Task