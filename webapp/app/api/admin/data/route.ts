import { NextRequest, NextResponse } from "next/server";
import { databases, DB_ID, COLLECTIONS, Query } from "@/lib/appwrite";

const ALLOWED_COLLECTIONS = Object.values(COLLECTIONS);

export async function GET(request: NextRequest) {
  // Auth check
  const session = request.cookies.get("admin_session");
  if (!session || session.value !== "authenticated") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const collection = searchParams.get("collection") || "";
  const limit      = Math.min(parseInt(searchParams.get("limit") || "200"), 500);
  const source     = searchParams.get("source"); // optional filter e.g. source=consultation

  if (!ALLOWED_COLLECTIONS.includes(collection as any)) {
    return NextResponse.json({ error: "Invalid collection" }, { status: 400 });
  }

  try {
    const queries: string[] = [Query.orderDesc("$createdAt"), Query.limit(limit)];
    if (source) queries.push(Query.equal("source", source));

    const result = await databases.listDocuments(DB_ID, collection, queries);
    return NextResponse.json({ documents: result.documents, total: result.total });
  } catch (error: any) {
    console.error(`Admin data fetch [${collection}]:`, error);
    return NextResponse.json({ error: "Failed to fetch data." }, { status: 500 });
  }
}
