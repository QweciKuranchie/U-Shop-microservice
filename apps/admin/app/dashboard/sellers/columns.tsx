"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge, Button } from "@repo/ui";
import {
  ArrowUpDown,
  Building2,
  GraduationCap,
  UserCheck,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import type { AdminStoreSeller } from "./types";
import { ReviewKycDialog } from "./ReviewKycDialog";

export const columns: ColumnDef<AdminStoreSeller>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="text-xs font-semibold"
        >
          Store & Owner
          <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const s = row.original;
      return (
        <div className="flex flex-col">
          <span className="font-semibold text-sm text-foreground">{s.name}</span>
          <span className="text-xs text-muted-foreground">{s.ownerName || "No owner name"}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "sellerType",
    header: "Category",
    cell: ({ row }) => {
      const type = row.getValue("sellerType") as string;
      return (
        <Badge variant="secondary" className="capitalize text-xs flex items-center gap-1 w-fit">
          {type === "business" && <Building2 className="h-3 w-3 text-blue-500" />}
          {type === "student" && <GraduationCap className="h-3 w-3 text-purple-500" />}
          {type === "personal" && <UserCheck className="h-3 w-3 text-emerald-500" />}
          {type || "personal"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "contact",
    header: "Contact",
    cell: ({ row }) => {
      const s = row.original;
      return (
        <div className="flex flex-col text-xs text-muted-foreground">
          <span className="text-foreground font-medium">{s.email || "—"}</span>
          <span>{s.phone || "—"}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "kycStatus",
    header: "KYC Status",
    cell: ({ row }) => {
      const status = row.getValue("kycStatus") as string;
      if (status === "approved") {
        return (
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-xs flex items-center gap-1 w-fit">
            <CheckCircle2 className="h-3 w-3" /> Approved
          </Badge>
        );
      }
      if (status === "rejected") {
        return (
          <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30 text-xs flex items-center gap-1 w-fit">
            <XCircle className="h-3 w-3" /> Rejected
          </Badge>
        );
      }
      return (
        <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30 text-xs flex items-center gap-1 w-fit animate-pulse">
          <Clock className="h-3 w-3" /> Pending Review
        </Badge>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Store Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      if (status === "active") {
        return (
          <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-emerald-500" /> Active
          </span>
        );
      }
      if (status === "rejected") {
        return (
          <span className="text-xs font-semibold text-destructive flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-destructive" /> Rejected
          </span>
        );
      }
      if (status === "suspended") {
        return (
          <span className="text-xs font-semibold text-rose-500 flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" /> Suspended
          </span>
        );
      }
      return (
        <span className="text-xs font-semibold text-amber-600 flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-amber-500" /> Under Review
        </span>
      );
    },
  },
  {
    accessorKey: "_createdAt",
    header: "Submitted",
    cell: ({ row }) => {
      const date = row.getValue("_createdAt") as string;
      if (!date) return <span className="text-xs text-muted-foreground">—</span>;
      return (
        <span className="text-xs text-muted-foreground">
          {new Date(date).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </span>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      return <ReviewKycDialog seller={row.original} />;
    },
  },
];
