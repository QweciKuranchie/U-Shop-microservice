import React from "react";
import { cn } from "@repo/utils";

function container({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mx-auto max-w-screen-xl px-4", className)}>
      {children}
    </div>
  );
}

export default container;
