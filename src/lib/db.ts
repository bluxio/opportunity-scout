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

export interface UserFeedback {
  id: string;
  createdAt: string;
  bucket: string;
  pursued: string[];
  skipped: string[];
  note?: string;
  topMoves: string[];
}

export async function saveUserFeedback(
  feedback: UserFeedback,
): Promise<boolean> {
  const database = await getDb();
  if (!database) return false;

  await database.collection<UserFeedback>("user_feedback").insertOne(feedback);
  return true;
}

export interface FeedbackSummary {
  total: number;
  pursued: Record<string, number>;
  skipped: Record<string, number>;
  notes: string[];
  byBucket: Record<string, number>;
}

export async function summarizeUserFeedback(): Promise<FeedbackSummary | null> {
  const database = await getDb();
  if (!database) return null;

  const rows = await database
    .collection<UserFeedback>("user_feedback")
    .find({})
    .sort({ createdAt: -1 })
    .limit(200)
    .toArray();

  const pursued: Record<string, number> = {};
  const skipped: Record<string, number> = {};
  const byBucket: Record<string, number> = {};
  const notes: string[] = [];

  for (const row of rows) {
    byBucket[row.bucket] = (byBucket[row.bucket] ?? 0) + 1;
    for (const id of row.pursued) {
      pursued[id] = (pursued[id] ?? 0) + 1;
    }
    for (const id of row.skipped) {
      skipped[id] = (skipped[id] ?? 0) + 1;
    }
    if (row.note) notes.push(row.note);
  }

  return { total: rows.length, pursued, skipped, notes, byBucket };
}
