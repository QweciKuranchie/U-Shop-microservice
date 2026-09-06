import React from "react";
import {  Skeleton  } from "@repo/ui";

export default function LoadingAddressSelector() {
  return (
    <div className="space-y-3 p-4 border rounded-xl bg-gray-50/50">
      <Skeleton className="h-5 w-32" />
      <Skeleton className="h-10 w-full rounded-lg" />
      <div className="flex gap-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-24" />
      </div>
    </div>
  );
}
