import { redirect } from "next/navigation";

// /blog redirects to /briefings — the Insights section lives there
export default function BlogPage() {
  redirect("/briefings");
}
