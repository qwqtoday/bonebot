import { drizzle } from "drizzle-orm/node-postgres";
import { Client } from "pg";
import { Config } from "../config";

export async function setup_database(config: Config) {
  const client = new Client({
    connectionString: config.database.url,
  });

  await client.connect();
  const db = drizzle(client);

  return db;
}
