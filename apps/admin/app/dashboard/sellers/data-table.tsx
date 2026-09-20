"use client";

import { useState, useMemo } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Input,
  Button,
  Badge,
} from "@repo/ui";
import { DataTablePagination } from "@/components/TablePagination";
import { Search, Filter, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import type { AdminStoreSeller } from "./types";

interface DataTableProps {
  columns: ColumnDef<AdminStoreSeller, any>[];
  data: AdminStoreSeller[];
}

export function DataTable({ columns, data }: DataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const router = useRouter();

  // Filtered data based on search and filters
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      // Search
      const matchesSearch =
        !searchQuery.trim() ||
        item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.ownerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.phone?.toLowerCase().includes(searchQuery.toLowerCase());

      // Status filter
      let matchesStatus = true;
      if (selectedStatus === "pending_review") {
        matchesStatus =
          item.kycStatus === "pending_review" || item.status === "pending_review";
      } else if (selectedStatus === "approved") {
        matchesStatus =
          item.kycStatus === "approved" || item.status === "active";
      } else if (selectedStatus === "rejected") {
        matchesStatus =
          item.kycStatus === "rejected" || item.status === "rejected";
      }

      // Type filter
      const matchesType =
        selectedType === "all" || item.sellerType === selectedType;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [data, searchQuery, selectedStatus, selectedType]);

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
  });

  const pendingCount = data.filter(
    (s) => s.kycStatus === "pending_review" || s.status === "pending_review"
  ).length;

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search stores, owners, emails..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 text-xs"
          />
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filters */}
          <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-lg border text-xs">
            <button
              onClick={() => setSelectedStatus("all")}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                selectedStatus === "all"
                  ? "bg-background shadow-xs font-semibold text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All ({data.length})
            </button>
            <button
              onClick={() => setSelectedStatus("pending_review")}
              className={`px-2.5 py-1 rounded-md transition-colors flex items-center gap-1.5 ${
                selectedStatus === "pending_review"
                  ? "bg-amber-500 text-white font-semibold"
                  : "text-amber-600 hover:text-amber-700"
              }`}
            >
              Pending
              {pendingCount > 0 && (
                <span className="bg-white/20 text-xs px-1.5 py-0.2 rounded-full">
                  {pendingCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setSelectedStatus("approved")}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                selectedStatus === "approved"
                  ? "bg-emerald-600 text-white font-semibold"
                  : "text-emerald-600 hover:text-emerald-700"
              }`}
            >
              Approved
            </button>
            <button
              onClick={() => setSelectedStatus("rejected")}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                selectedStatus === "rejected"
                  ? "bg-destructive text-white font-semibold"
                  : "text-destructive hover:text-destructive/80"
              }`}
            >
              Rejected
            </button>
          </div>

          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="h-8 text-xs rounded-lg border bg-background px-2.5 text-foreground cursor-pointer"
          >
            <option value="all">All Categories</option>
            <option value="personal">Personal</option>
            <option value="business">Business</option>
            <option value="student">Student</option>
          </select>

          <Button
            variant="outline"
            size="sm"
            onClick={() => router.refresh()}
            className="h-8 px-2 text-xs"
            title="Refresh list"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="text-xs font-semibold">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="hover:bg-muted/40 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-3">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-32 text-center text-sm text-muted-foreground"
                >
                  No seller accounts found matching your filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <DataTablePagination table={table} />
      </div>
    </div>
  );
}
