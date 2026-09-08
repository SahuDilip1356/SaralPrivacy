import type { Metadata } from "next";
import OutreachUnsubscribeClient from "./OutreachUnsubscribeClient";

export const metadata: Metadata = {
  title: "Removed from list — SaralPrivacy",
  robots: { index: false, follow: false },
};

export default async function OutreachUnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token = "" } = await searchParams;
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-sm mx-4">
        <div className="px-8 py-6 border-b border-slate-100">
          <p className="font-bold text-lg text-navy-700">Saral<span className="text-green-500">Privacy</span></p>
          <p className="text-xs text-slate-400 mt-0.5">Unsubscribe</p>
        </div>
        <OutreachUnsubscribeClient token={token} />
      </div>
    </div>
  );
}
