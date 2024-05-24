import { Command } from './command';
import { EquipmentDestination } from 'mineflayer';

export default {
	name: 'equip',
	execute: (context, bot) => {
		const [destination, itemName, ...args] = context.args
        const itemData = bot.registry.itemsByName[itemName]
        if (itemData === undefined) {
            context.respond("Item type does not exist")
            return;
        }
        const item = bot.inventory.findInventoryItem(itemData.id, null, false)
        if (item === null) {
            context.respond("Item not found in inventory")
            return;
        }
        if (!['hand', 'head', 'torso', 'legs', 'feet', 'off-hand'].includes(destination)) {
            context.respond("invalid destination.")
            return;
        }
        bot.equip(item, destination as EquipmentDestination)
	},
} satisfies Command;