import { drizzle } from 'drizzle-orm/postgres-js';

// biome-ignore lint/style/noNonNullAssertion: Just do it
export const db = drizzle(process.env.DATABASE_URL!);
