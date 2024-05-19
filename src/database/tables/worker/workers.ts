import {
	integer,
	pgEnum,
	pgTable,
	serial,
	uniqueIndex,
	varchar,
	uuid,
	smallint,
} from 'drizzle-orm/pg-core';
import { users } from '../user/users';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';

export const workers = pgTable('workers', {
	id: serial('id').primaryKey(),
	owner_id: integer('owner_id').references(() => users.id),
	nickname: varchar('nickname', { length: 20 })
		.notNull(),
	account: varchar('account', { length: 256 })
		.notNull(),
	state: smallint('state').default(0),
});

export type Worker = typeof workers.$inferSelect;
export type NewWorker = typeof workers.$inferInsert;

export async function getOwnerIdFromNickname(db: NodePgDatabase, nickname: string) {
	const result = await db
		.select({ owner_id: workers.owner_id })
		.from(workers)
		.where(eq(workers.nickname, nickname));

	const worker = result[0];

	return worker ? worker.owner_id : null;
}