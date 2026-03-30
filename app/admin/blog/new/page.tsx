import type { Metadata } from "next";
import BlogEditor from "@/components/admin/BlogEditor";

export const metadata: Metadata = { title: "New Blog Post | Admin" };

export default function NewBlogPostPage() {
  return <BlogEditor docId={null} />;
}
