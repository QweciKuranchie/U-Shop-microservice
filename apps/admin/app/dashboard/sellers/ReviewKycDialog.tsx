"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Button,
  Badge,
  Textarea,
  Label,
} from "@repo/ui";
import {
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  Building2,
  GraduationCap,
  UserCheck,
  AlertCircle,
  Store as StoreIcon,
  Phone,
  Mail,
  Calendar,
} from "lucide-react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import type { AdminStoreSeller } from "./types";

interface ReviewKycDialogProps {
  seller: AdminStoreSeller;
}

export function ReviewKycDialog({ seller }: ReviewKycDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const router = useRouter();

  const handleDecision = async (action: "approve" | "reject") => {
    if (action === "reject" && !rejectionReason.trim()) {
      toast.error("Please provide a reason for rejection.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/sellers/${seller._id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          reason: action === "reject" ? rejectionReason : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update seller status");
      }

      toast.success(
        action === "approve"
          ? `Store "${seller.name}" has been approved!`
          : `Store "${seller.name}" KYC rejected.`
      );
      setOpen(false);
      setShowRejectInput(false);
      setRejectionReason("");
      router.refresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Action failed");
    } finally {
      setIsLoading(false);
    }
  };

  const isPending = seller.kycStatus === "pending_review" || seller.status === "pending_review";
  const isApproved = seller.kycStatus === "approved" || seller.status === "active";
  const isRejected = seller.kycStatus === "rejected" || seller.status === "rejected";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant={isPending ? "default" : "outline"}
          size="sm"
          className={
            isPending
              ? "bg-amber-600 hover:bg-amber-700 text-white font-medium"
              : "text-xs"
          }
        >
          {isPending ? "Review KYC" : "View Details"}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <StoreIcon className="h-5 w-5 text-primary" />
            <DialogTitle className="text-xl">{seller.name}</DialogTitle>
          </div>
          <DialogDescription>
            Submitted for onboarding verification &middot; {new Date(seller._createdAt).toLocaleDateString("en-GB", { dateStyle: "medium" })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {/* Status & Type Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-muted/50 rounded-lg border">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Seller Category:</span>
              <Badge variant="secondary" className="capitalize flex items-center gap-1 font-semibold">
                {seller.sellerType === "business" && <Building2 className="h-3 w-3" />}
                {seller.sellerType === "student" && <GraduationCap className="h-3 w-3" />}
                {seller.sellerType === "personal" && <UserCheck className="h-3 w-3" />}
                {seller.sellerType || "personal"}
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">KYC Status:</span>
              {isPending && (
                <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30 flex items-center gap-1">
                  <Clock className="h-3 w-3" /> Pending Review
                </Badge>
              )}
              {isApproved && (
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Approved / Active
                </Badge>
              )}
              {isRejected && (
                <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30 flex items-center gap-1">
                  <XCircle className="h-3 w-3" /> Rejected
                </Badge>
              )}
            </div>
          </div>

          {/* Owner & Contact Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Owner / Contact Person</p>
              <p className="font-medium text-foreground">{seller.ownerName || "Not provided"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Email Address</p>
              <p className="font-medium text-foreground flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                {seller.email || "Not provided"}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Phone Number</p>
              <p className="font-medium text-foreground flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                {seller.phone || "Not provided"}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Store Slug / URL</p>
              <p className="font-medium text-primary font-mono text-xs">
                seller.ushopgh.com/stores/{seller.slug}
              </p>
            </div>
          </div>

          {/* Verification Credentials per Category */}
          <div className="rounded-lg border p-4 bg-card space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-primary" />
              KYC Credentials Verification
            </h4>

            {seller.sellerType === "personal" && (
              <div className="space-y-2">
                <div>
                  <span className="text-xs text-muted-foreground">Ghana Card / National ID Number:</span>
                  <p className="text-sm font-mono font-bold text-foreground">
                    {seller.nationalIdNumber || "Not recorded in Sanity"}
                  </p>
                </div>
              </div>
            )}

            {seller.sellerType === "business" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-muted-foreground">Registered Business Name:</span>
                  <p className="text-sm font-bold text-foreground">
                    {seller.businessName || seller.name}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Business Reg. Number (RGD):</span>
                  <p className="text-sm font-mono font-bold text-foreground">
                    {seller.businessRegistrationNumber || "Not recorded in Sanity"}
                  </p>
                </div>
              </div>
            )}

            {seller.sellerType === "student" && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <span className="text-xs text-muted-foreground">University / Institution:</span>
                  <p className="text-sm font-bold text-foreground">
                    {seller.university || "Not specified"}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Student ID Number:</span>
                  <p className="text-sm font-mono font-bold text-foreground">
                    {seller.studentIdNumber || "Not specified"}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Student Campus Email:</span>
                  <p className="text-sm font-mono text-xs font-bold text-foreground">
                    {seller.studentEmail || "Not specified"}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Rejection Details if applicable */}
          {seller.kycRejectionReason && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-2.5">
              <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <p className="font-semibold text-destructive">Previous Rejection Reason:</p>
                <p className="text-destructive/90">{seller.kycRejectionReason}</p>
              </div>
            </div>
          )}

          {/* Rejection Input Drawer */}
          {showRejectInput && (
            <div className="p-4 bg-muted/60 border rounded-lg space-y-3">
              <Label className="text-xs font-bold text-foreground">
                Reason for KYC Rejection (sent to seller)
              </Label>
              <Textarea
                rows={3}
                placeholder="e.g. Document image is blurry, Ghana Card number does not match name, or invalid business registration number."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="text-xs"
              />
              <div className="flex justify-end gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowRejectInput(false)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDecision("reject")}
                  disabled={isLoading || !rejectionReason.trim()}
                >
                  Confirm Rejection
                </Button>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex flex-col sm:flex-row items-center justify-between gap-2 border-t pt-4">
          <Button
            variant="ghost"
            onClick={() => setOpen(false)}
            disabled={isLoading}
          >
            Close
          </Button>

          {!showRejectInput && (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              {!isRejected && (
                <Button
                  variant="outline"
                  className="text-destructive border-destructive/30 hover:bg-destructive/10 flex-1 sm:flex-none"
                  onClick={() => setShowRejectInput(true)}
                  disabled={isLoading}
                >
                  <XCircle className="h-4 w-4 mr-1.5" />
                  Reject KYC
                </Button>
              )}

              {!isApproved && (
                <Button
                  className="bg-emerald-600 hover:bg-emerald-700 text-white flex-1 sm:flex-none"
                  onClick={() => handleDecision("approve")}
                  disabled={isLoading}
                >
                  <CheckCircle2 className="h-4 w-4 mr-1.5" />
                  Approve & Activate Seller
                </Button>
              )}
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
