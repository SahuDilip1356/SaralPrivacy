import type { Metadata } from "next";
import { databases, DB_ID, COLLECTIONS, Query } from "@/lib/appwrite";
import BloggersClient from "./BloggersClient";

export const metadata: Metadata = { title: "Blogger Management | Admin" };
export const dynamic = "force-dynamic";

async function fetchBloggers() {
  try {
    const result = await databases.listDocuments(DB_ID, COLLECTIONS.BLOGGER_ACCOUNTS, [
      Query.orderDesc("$createdAt"),
      Query.limit(100),
    ]);
    // Spread to plain objects — Appwrite Models.Document are class instances
    // which Next.js App Router cannot serialize across the Server→Client boundary
    return result.documents.map(doc => ({ ...doc }));
  } catch {
    return [];
  }
}

export default async function BloggersPage() {
  const bloggers = await fetchBloggers();
  return <BloggersClient initialBloggers={bloggers} />;
}
