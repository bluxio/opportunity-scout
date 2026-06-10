import { MongoClient, type Db, type Collection } from "mongodb";
import type { SearchSession } from "@/lib/types";

const COLLECTION = "search_sessions";

let client: MongoClient | null = null;
let db: Db | null = null;

async function getDb(): Promise<Db | null> {
  const uri = process.env.MONGODB_URI;
  if (!uri) return null;

  if (!client) {
    client = new MongoClient(uri);
    await client.connect();
    db = client.db(process.env.MONGODB_DB ?? "opportunity_scout");
  }

  return db;
}

function getCollection(db: Db): Collection<SearchSession> {
  return db.collection<SearchSession>(COLLECTION);
}

export async function saveSearchSession(
  session: SearchSession,
): Promise<SearchSession> {
  const database = await getDb();
  if (!database) {
    return session;
  }

  await getCollection(database).insertOne(session);
  return session;
}

export async function getSearchSession(
  id: string,
): Promise<SearchSession | null> {
  const database = await getDb();
  if (!database) return null;

  return getCollection(database).findOne({ id });
}

export async function listSearchSessions(
  limit = 10,
): Promise<SearchSession[]> {
  const database = await getDb();
  if (!database) return [];

  return getCollection(database)
    .find({})
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray();
}

export function isDbConfigured(): boolean {
  return Boolean(process.env.MONGODB_URI);
}
