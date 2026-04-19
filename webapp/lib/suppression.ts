import { databases, DB_ID, COLLECTIONS, Query } from "./appwrite";

const BLOCKED_STATUSES = ["unsubscribed", "bounced", "complained"];

export async function isSuppressed(email: string): Promise<boolean> {
  const normalized = email.trim().toLowerCase();

  const subRes = await databases.listDocuments(DB_ID, COLLECTIONS.SUBSCRIBERS, [
    Query.equal("email", normalized),
    Query.limit(1),
  ]);
  if (subRes.documents[0] && BLOCKED_STATUSES.includes(subRes.documents[0].status)) {
    return true;
  }

  const outRes = await databases.listDocuments(DB_ID, COLLECTIONS.OUTREACH_CONTACTS, [
    Query.equal("email", normalized),
    Query.limit(1),
  ]);
  if (outRes.documents[0] && BLOCKED_STATUSES.includes(outRes.documents[0].status)) {
    return true;
  }

  return false;
}
