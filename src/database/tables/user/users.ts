import { eq } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { integer, pgTable, serial, smallint, uuid } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
    id: serial("id").primaryKey().unique(),
    uuid: uuid("uuid").notNull(),
    level: smallint("level").default(0)
})

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert



export async function getUserIdFromUUID(db: NodePgDatabase, uuid: string) {
    let result = await db.select({ id: users.id }).from(users)
      .where(eq(users.uuid, uuid))
    
    let user = result[0]
    if (user === undefined) 
      return null;
    return user.id
}

export async function getUserLevel(db: NodePgDatabase, user_id: number) {
  let result = await db
      .select({ level: users.level })
      .from(users)
      .where(eq(users.id, user_id))
  
  let user = result[0]

  return user ? user.level : -1
}