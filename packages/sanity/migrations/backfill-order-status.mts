/**
 * One-off migration: collapse the legacy `status` field into `orderStatus`.
 *
 *   DRY RUN (default, writes nothing):
 *     pnpm --filter @repo/sanity backfill:order-status
 *   APPLY:
 *     pnpm --filter @repo/sanity backfill:order-status -- --apply
 *
 * Environment (same values the web app uses):
 *   NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET, SANITY_API_WRITE_TOKEN
 *   (load them with:  node --env-file=../../apps/web/.env.local ... or export them)
 *
 * Properties:
 *  - Idempotent: migrated documents are skipped, so re-running is safe.
 *  - Race-safe: each patch is guarded by the revision it was read at; a document
 *    changed in the meantime is skipped and reported (re-run to pick it up).
 *  - Reviewable: every order whose two fields disagreed is written to a CSV.
 *  - Reconciliation rules live in @repo/utils/order-status (unit-tested).
 *
 * Zero-downtime rollout (recommended). The code release reads ONLY `orderStatus`,
 * but existing orders may carry a stale `orderStatus` (older code wrote `status`),
 * so run it in three phases:
 *   A. BEFORE deploying:  --apply --keep-legacy
 *        Brings orderStatus up to date and leaves `status` in place, so the code
 *        that is still running keeps working.
 *   B. Deploy the release.
 *   C. AFTER deploying:   --apply
 *        Re-reconciles anything the old code changed in the gap and removes `status`.
 * Always do a dry run (no flags) first and read the CSV.
 */
import { writeFileSync } from "node:fs";
import { createClient } from "@sanity/client";
import { planOrderStatusBackfill, type BackfillDoc } from "@repo/utils/order-status";

const APPLY = process.argv.includes("--apply");
const KEEP_LEGACY = process.argv.includes("--keep-legacy");
const PAGE_SIZE = 200;
const BATCH_SIZE = 50;

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;

if (!projectId || !dataset || !token) {
  console.error("Missing NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET or SANITY_API_WRITE_TOKEN.");
  process.exit(1);
}

const client = createClient({ projectId, dataset, token, apiVersion: "2025-02-19", useCdn: false });

type Planned = { doc: BackfillDoc; plan: Extract<ReturnType<typeof planOrderStatusBackfill>, { action: "update" }> };

async function main() {
  console.log(`Dataset: ${projectId}/${dataset}`);
  console.log(KEEP_LEGACY ? "PHASE: keep-legacy (orderStatus is synced; `status` is left in place)" : "PHASE: full (orderStatus is synced and `status` is removed)");
  console.log(APPLY ? "MODE: APPLY (writing changes)\n" : "MODE: DRY RUN (no writes). Pass --apply to write.\n");

  const planned: Planned[] = [];
  let scanned = 0;
  let lastId = "";

  // Page by _id so we never load the whole collection at once.
  for (;;) {
    const page: BackfillDoc[] = await client.fetch(
      `*[_type == "order" && !(_id in path("drafts.**")) && _id > $lastId && (defined(status) || !defined(orderStatus))]
         | order(_id)[0...$size]{ _id, _rev, orderStatus, status }`,
      { lastId, size: PAGE_SIZE }
    );
    if (page.length === 0) break;
    for (const doc of page) {
      scanned++;
      const plan = planOrderStatusBackfill(doc, { keepLegacy: KEEP_LEGACY });
      if (plan.action === "update") planned.push({ doc, plan });
    }
    lastId = page[page.length - 1]._id;
  }

  const conflicts = planned.filter((p) => p.plan.conflict);
  const byReason = new Map<string, number>();
  for (const p of planned) byReason.set(p.plan.reason, (byReason.get(p.plan.reason) ?? 0) + 1);

  console.log(`Orders needing migration: ${planned.length}  (scanned ${scanned})`);
  for (const [reason, n] of byReason) console.log(`  ${reason}: ${n}`);
  console.log(`Orders where the two fields DISAGREED: ${conflicts.length}`);

  const csv = [
    "id,orderStatus_before,status_before,orderStatus_after,reason,conflict",
    ...planned.map(({ doc, plan }) =>
      [doc._id, doc.orderStatus ?? "", doc.status ?? "", plan.orderStatus, plan.reason, plan.conflict].join(",")
    ),
  ].join("\n");
  const reportPath = `order-status-backfill-${APPLY ? "applied" : "dryrun"}-${Date.now()}.csv`;
  writeFileSync(reportPath, csv);
  console.log(`Report written: ${reportPath}`);

  if (!APPLY) {
    console.log("\nDry run complete. Review the CSV, then re-run with --apply.");
    return;
  }

  let updated = 0;
  const skipped: string[] = [];
  for (let i = 0; i < planned.length; i += BATCH_SIZE) {
    const batch = planned.slice(i, i + BATCH_SIZE);
    try {
      let tx = client.transaction();
      for (const { doc, plan } of batch) {
        tx = tx.patch(doc._id, (p) => {
          const patch = p.ifRevisionId(doc._rev).set({ orderStatus: plan.orderStatus });
          return plan.unsetStatus ? patch.unset(["status"]) : patch;
        });
      }
      await tx.commit();
      updated += batch.length;
    } catch (error) {
      // A revision conflict fails the whole batch; retry each doc on its own.
      for (const { doc, plan } of batch) {
        try {
          const single = client.patch(doc._id).ifRevisionId(doc._rev).set({ orderStatus: plan.orderStatus });
          await (plan.unsetStatus ? single.unset(["status"]) : single).commit();
          updated++;
        } catch {
          skipped.push(doc._id);
        }
      }
    }
    console.log(`  progress: ${Math.min(i + BATCH_SIZE, planned.length)}/${planned.length}`);
  }

  console.log(`\nUpdated: ${updated}`);
  if (skipped.length) {
    console.log(`Skipped (changed during the run; re-run to pick up): ${skipped.length}`);
    console.log(skipped.join("\n"));
  }
}

main().catch((error) => {
  console.error("Backfill failed:", error);
  process.exit(1);
});
