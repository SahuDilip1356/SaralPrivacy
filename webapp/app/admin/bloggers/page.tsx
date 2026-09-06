import type { Metadata } from "next";

import { queryDocuments } from "@/lib/db";
import BloggersClient from "./BloggersClient";

export const metadata: Metadata = { title: "Blogger Management | Admin" };
export const dynamic = "force-dynamic";

async function fetchBloggers() {
  try {
    const result = await queryDocuments("blogger_accounts", {
      orderBy: { field: "$createdAt", dir: "desc" },
      limit: 100,
    });
    // Spread to plain objects — Appwrite Models.Document are class instances
    // which Next.js App Router cannot serialize across the Server→Client boundary
    return result.docs.map((doc: Record<string, unknown>) => ({ ...doc }));
  } catch {
    return [];
  }
}

export default async function BloggersPage() {
  const bloggers = await fetchBloggers();
  return <BloggersClient initialBloggers={bloggers} />;
}
