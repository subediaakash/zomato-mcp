import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "../drizzle/src/db/schema";


const client = postgres(process.env.DATABASE_URL!);
const db = drizzle(client, { schema });

async function resetDB() {
    await client`DROP SCHEMA public CASCADE;`;
    await client`CREATE SCHEMA public;`;
    console.log("✅ Database reset complete!");
}

resetDB().finally(() => client.end());