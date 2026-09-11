"use client";
// The handoff seam — THE thing this whole slice exists to test. On click it:
//   1. writes a small handoff payload (CATEGORIES only, never personal data) to
//      sessionStorage for the Mapping stage to pick up later (Phase D),
//   2. fires the instrumented click event (the metric that unlocks Phases B–E),
//   3. routes to the /data-mapping hub.
// sessionStorage is wrapped in try/catch — if it throws (private mode / quota) the
// navigation still happens; the payload is optional to the nav.
import { useRouter } from "next/navigation";
import { trackEvent } from "@/lib/analytics";
import type { DiscoveryRegister } from "@/lib/discovery/register";

export const HANDOFF_KEY = "sp_discovery_handoff";

export default function HandoffCTA({ register }: { register: DiscoveryRegister }) {
  const router = useRouter();

  function go() {
    const payload = {
      nicheId: register.nicheId,
      nicheName: register.nicheName,
      generatedAt: register.generatedAt,
      counts: register.counts,
      // just the mapping seeds — questions + priorities + category links, no PII
      mappingSeeds: register.risks.map((r) => ({
        question: r.suggestedMappingQuestion,
        priority: r.mappingPriority,
        category: r.category,
        relatedStorage: r.relatedStorage ?? null,
        relatedRecipient: r.relatedRecipient ?? null,
      })),
    };
    try {
      sessionStorage.setItem(HANDOFF_KEY, JSON.stringify(payload));
    } catch {
      /* private mode / quota — proceed without the payload */
    }
    trackEvent.discoveryHandoffClick({
      niche: register.nicheId,
      highRisk: register.counts.highRisk,
      recipients: register.counts.recipients,
    });
    router.push("/data-mapping");
  }

  return (
    <section className="dpack-seam">
      <div className="dpack-seam-copy">
        <h3>See where your personal data travels</h3>
        <p>
          You now know <strong>what</strong> personal data you hold, <strong>how long</strong> it may need to be kept,
          and <strong>where the risks</strong> are. The next step is to confirm where it moves — across collection
          channels, teams, apps, vendors, storage and backups.
        </p>
      </div>
      <button type="button" className="btn-primary dpack-seam-btn" onClick={go}>
        Build My Data Flow Map →
      </button>
    </section>
  );
}
