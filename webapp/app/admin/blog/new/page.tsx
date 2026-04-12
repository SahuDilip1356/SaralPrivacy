import type { Metadata } from "next";
import { cookies } from "next/headers";
import BlogEditor from "@/components/admin/BlogEditor";

export const metadata: Metadata = { title: "New Blog Post | Admin" };

export default async function NewBlogPostPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("admin_session");
  const role: "admin" | "blogger" = sessionCookie?.value === "blogger" ? "blogger" : "admin";

  return <BlogEditor docId={null} role={role} />;
}
