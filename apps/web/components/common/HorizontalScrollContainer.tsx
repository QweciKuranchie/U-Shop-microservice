"use client";

import React, { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface HorizontalScrollContainerProps {
  children: React.ReactNode;
  className?: string;
}

export default function HorizontalScrollContainer({
  children,
  className = "",
}: HorizontalScrollContainerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = direction === "left" ? -340 : 340;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <div className="relative group/scroll w-full">
      {/* Scroll Left Arrow Button */}
      <button
        type="button"
        onClick={() => scroll("left")}
        className="absolute -left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/95 text-gray-800 shadow-md border border-gray-200/90 flex items-center justify-center hover:bg-ushop-purple hover:text-white hover:border-ushop-purple opacity-0 group-hover/scroll:opacity-100 transition-all duration-200 cursor-pointer hidden sm:flex"
        aria-label="Scroll left"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      {/* Scrollable Container */}
      <div
        ref={scrollRef}
        className={`flex gap-4 sm:gap-6 overflow-x-auto pb-4 pt-1 snap-x scroll-smooth no-scrollbar ${className}`}
      >
        {children}
      </div>

      {/* Scroll Right Arrow Button */}
      <button
        type="button"
        onClick={() => scroll("right")}
        className="absolute -right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/95 text-gray-800 shadow-md border border-gray-200/90 flex items-center justify-center hover:bg-ushop-purple hover:text-white hover:border-ushop-purple opacity-0 group-hover/scroll:opacity-100 transition-all duration-200 cursor-pointer hidden sm:flex"
        aria-label="Scroll right"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}
