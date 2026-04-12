import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import BlogEditor, { type BlogPostData, type PrimarySource } from "@/components/admin/BlogEditor";

export const metadata: Metadata = { title: "Edit Blog Post | Admin" };

interface Props {
  params: Promise<{ id: string }>;
}

function tryParse<T>(str: string | null | undefined, fallback: T): T {
  if (!str) return fallback;
  try { return JSON.parse(str) as T; } catch { return fallback; }
}

export default async function EditBlogPostPage({ params }: Props) {
  const { id } = await params;

  // Resolve role for role-gated UI in editor
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("admin_session");
  const role: "admin" | "blogger" = sessionCookie?.value === "blogger" ? "blogger" : "admin";

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/blog/${id}`,
    { cache: "no-store" }
  );

  if (!res.ok) {
    notFound();
  }

  const doc = await res.json();

  // Parse the packed sections_json field if present
  const sectionsJson = tryParse<Record<string, string>>(doc.sections_json, {});

  const initialData: Partial<BlogPostData> = {
    title:                doc.title                || "",
    slug:                 doc.slug                 || "",
    excerpt:              doc.excerpt              || "",
    lane:                 doc.lane                 || "law-explained",
    author:               doc.author               || "",
    tags:                 doc.tags                 || "",
    featured:             doc.featured             ?? false,
    section_what_changed: doc.section_what_changed || "",
    section_law_says:     doc.section_law_says     || "",
    section_do_now:       sectionsJson.section_do_now       || "",
    section_uncertain:    sectionsJson.section_uncertain    || "",
    section_mistakes:     sectionsJson.section_mistakes     || "",
    primary_sources:      tryParse<PrimarySource[]>(sectionsJson.primary_sources, []),
    validated_at:         doc.validated_at         || "",
    score_legal_accuracy: doc.score_legal_accuracy ?? 0,
    score_primary_source: doc.score_primary_source ?? 0,
    score_currency:       doc.score_currency       ?? 0,
    score_scope:          doc.score_scope          ?? 0,
    score_operational:    doc.score_operational    ?? 0,
  };

  return <BlogEditor initialData={initialData} docId={id} role={role} initialStatus={doc.status} />;
}
