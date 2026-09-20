export const dynamic = "force-dynamic";

import { client } from "@repo/sanity";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import type { AdminStoreSeller } from "./types";
import { Store, Clock, CheckCircle2, XCircle } from "lucide-react";

async function getSellers(): Promise<AdminStoreSeller[]> {
  try {
    const stores = await client.fetch(
      `*[_type == "store"] | order(_createdAt desc) {
        _id,
        name,
        "slug": slug.current,
        ownerName,
        phone,
        email,
        sellerType,
        status,
        kycStatus,
        kycRejectionReason,
        kycReviewedAt,
        kycReviewedBy,
        nationalIdNumber,
        businessName,
        businessRegistrationNumber,
        university,
        studentIdNumber,
        studentEmail,
        verifiedSeller,
        verifiedStudent,
        location,
        description,
        _createdAt
      }`
    );

    return stores || [];
  } catch (error) {
    console.error("Error fetching sellers for admin dashboard:", error);
    return [];
  }
}

export default async function SellersPage() {
  const sellers = await getSellers();

  const total = sellers.length;
  const pending = sellers.filter(
    (s) => s.kycStatus === "pending_review" || s.status === "pending_review"
  ).length;
  const active = sellers.filter(
    (s) => s.kycStatus === "approved" || s.status === "active"
  ).length;
  const rejected = sellers.filter(
    (s) => s.kycStatus === "rejected" || s.status === "rejected"
  ).length;

  return (
    <div className="py-4 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-4 py-3 bg-card border rounded-lg shadow-xs">
        <div>
          <h1 className="font-semibold text-lg flex items-center gap-2">
            <Store className="h-5 w-5 text-primary" />
            Seller Accounts & KYC Verification
          </h1>
          <p className="text-xs text-muted-foreground">
            Review onboarding applications, verify Ghana Card / Student / Business credentials, and activate stores.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 bg-card border rounded-lg space-y-1">
          <span className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
            <Store className="h-3.5 w-3.5 text-muted-foreground" />
            Total Sellers
          </span>
          <p className="text-2xl font-bold text-foreground">{total}</p>
        </div>

        <div className="p-3.5 bg-amber-500/5 border border-amber-500/20 rounded-lg space-y-1">
          <span className="text-xs text-amber-700 dark:text-amber-400 font-semibold flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            Pending Review
          </span>
          <p className="text-2xl font-bold text-amber-700 dark:text-amber-400">{pending}</p>
        </div>

        <div className="p-3.5 bg-emerald-500/5 border border-emerald-500/20 rounded-lg space-y-1">
          <span className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Active & Verified
          </span>
          <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">{active}</p>
        </div>

        <div className="p-3.5 bg-destructive/5 border border-destructive/20 rounded-lg space-y-1">
          <span className="text-xs text-destructive font-semibold flex items-center gap-1.5">
            <XCircle className="h-3.5 w-3.5" />
            Rejected
          </span>
          <p className="text-2xl font-bold text-destructive">{rejected}</p>
        </div>
      </div>

      {/* Table */}
      <DataTable columns={columns} data={sellers} />
    </div>
  );
}
