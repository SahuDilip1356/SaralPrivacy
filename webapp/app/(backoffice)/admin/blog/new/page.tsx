import type { Metadata } from "next";
import { cookies } from "next/headers";
import { verifyAdminSessionToken, ADMIN_SESSION_COOKIE } from "@/lib/adminSession";
import BlogEditor from "@/components/admin/BlogEditor";

export const metadata: Metadata = { title: "New Blog Post | Admin" };

export default async function NewBlogPostPage() {
  const cookieStore = await cookies();
  const session = await verifyAdminSessionToken(
    cookieStore.get(ADMIN_SESSION_COOKIE)?.value
  );
  const role: "admin" | "blogger" = session?.role === "blogger" ? "blogger" : "admin";

  return <BlogEditor docId={null} role={role} />;
}
