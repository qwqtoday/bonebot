import { Bot } from 'mineflayer';
import { Task, TaskOptions } from '../task';
import { Entity } from 'prismarine-entity';
import { goals } from 'mineflayer-pathfinder';
import { Vec3 } from 'vec3';

const playerFilter = (entity: Entity) => entity.type == "player"
const havePassengerFilter = (entity: Entity) => entity.passengers.length != 0

const NAME = 'tnt_tag';

const TNT_TAG_REGION = [209, 207]

const corners = [
	new Vec3(1916477, 156, 1700107),
	new Vec3(1716547, 156, 1700036),
	new Vec3(1916477, 156, 1700036),
	new Vec3(1716547, 156, 1700107)
]

const bestIdleSpot = new Vec3(1716508, 155, 1700070)

export default {
	load: (bot) => {},
	run(bot) {
		let info = bot.task.tasks[NAME].info

		// fix information
		if (info.visitTntTagIslandCounter === undefined) {
			info.visitTntTagIslandCounter = 0
		}
		
		info.visitTntTagIslandCounter -= 1

		// check if the bot is in tnt tag island
        const botCurrentRegion = [
            bot.entity.position.x >> 13,
            bot.entity.position.z >> 13
        ]
		
		const botNotInRegion = TNT_TAG_REGION[0] != botCurrentRegion[0] || TNT_TAG_REGION[1] != botCurrentRegion[1]

        if (botNotInRegion && (info.visitTntTagIslandCounter < 0)) {
			info.visitTntTagIslandCounter = 100
			bot.chat("/visit id 43893")
			return
		} else if (botNotInRegion) {
			return
		}

		if (bot.game.gameMode === "spectator") return;
		bot.pathfinder.movements.updateCollisionIndex()
		bot.pathfinder.movements.allowFreeMotion = true
		bot.pathfinder.movements.allow1by1towers = false
		bot.pathfinder.movements.canDig = false

		if (bot.entity.passengers.length !== 0) {
			const nearestPlayer = bot
				.nearestEntity((entity) => playerFilter(entity) && bot.entity != entity)
			if (nearestPlayer === null) return;
			if (bot.entity.position.distanceTo(nearestPlayer.position) <= 2.9) {
				bot.attack(nearestPlayer)
			}
			const goal = new goals.GoalFollow(nearestPlayer, 2.9)
			bot.pathfinder.setGoal(goal)
			return;
		} 
		
		const peopleWithTnt = Object.values(bot.entities)
			.filter(playerFilter)
			.filter(havePassengerFilter)
		
		if (peopleWithTnt.length === 0) {
			const goal = new goals.GoalBlock(bestIdleSpot.x, bestIdleSpot.y, bestIdleSpot.z)

			bot.pathfinder.setGoal(goal, true)
			return;
		}

		const closestPersonWithTNT = peopleWithTnt.reduce(
			(personA, personB) => bot.entity.position.distanceTo(personA.position) < bot.entity.position.distanceTo(personB.position) ? personA : personB
		)

		if (bot.entity.position.distanceTo(closestPersonWithTNT.position) <= 2.9) {
			bot.attack(closestPersonWithTNT)
		}
		
		const bestCorner = corners.reduce((cornerA, cornerB) => 
			peopleWithTnt.map((entity) => cornerA.distanceTo(entity.position)).reduce((d1, d2) => d1 + d2) > peopleWithTnt.map((entity) => cornerB.distanceTo(entity.position)).reduce((d1, d2) => d1 + d2) ? cornerA : cornerB
		)
		const goal = new goals.GoalBlock(bestCorner.x, bestCorner.y, bestCorner.z)

		bot.pathfinder.setGoal(goal, true)
		
		return false;
	},
	default_options: {
		delay: 0
	},
	info: {
		noDelay: true,
	},
} satisfies Task;
