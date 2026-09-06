"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { cn } from "@repo/utils";
import { LiveSearchPopover, SearchResultProduct } from "./LiveSearchPopover";

interface SearchBarProps {
  onSearch?: (query: string) => void;
  className?: string;
}

function SearchBar({ onSearch, className }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResultProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Debounced API search call
  const fetchResults = useCallback(async (searchQuery: string) => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    setIsOpen(true);

    try {
      const response = await fetch(
        `/api/search?q=${encodeURIComponent(searchQuery.trim())}`
      );
      if (response.ok) {
        const data = await response.json();
        setResults(data.products || []);
      }
    } catch (error) {
      console.error("Live search fetch error:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim().length >= 2) {
        fetchResults(query);
      } else {
        setResults([]);
        setIsOpen(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, fetchResults]);

  // Handle outside click to close popover
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;

    setIsOpen(false);

    if (onSearch) {
      onSearch(trimmed);
    } else {
      router.push(`/shop?query=${encodeURIComponent(trimmed)}`);
    }
  };

  const handleClear = () => {
    setQuery("");
    setResults([]);
    setIsOpen(false);
  };

  return (
    <div
      ref={wrapperRef}
      className={cn("relative flex-1 max-w-md mx-auto z-40", className)}
    >
      <form
        onSubmit={handleSubmit}
        className="flex items-center w-full overflow-hidden rounded-full border border-gray-300 bg-white transition-all focus-within:border-ushop-purple focus-within:ring-2 focus-within:ring-ushop-purple/20 shadow-xs"
      >
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (query.trim().length >= 2) setIsOpen(true);
          }}
          placeholder="Search for products, categories..."
          className="flex-1 px-5 py-2.5 text-sm bg-transparent outline-none placeholder:text-gray-400"
        />

        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors mr-1"
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        <button
          type="submit"
          className="px-5 py-2.5 bg-ushop-pink text-white rounded-full mr-1 hover:bg-ushop-pink/90 transition-all flex items-center justify-center shrink-0 shadow-sm hover:scale-[1.02] active:scale-95"
          aria-label="Submit search"
        >
          <Search className="w-5 h-5" aria-hidden="true" />
        </button>
      </form>

      {/* Live search popover */}
      <LiveSearchPopover
        isOpen={isOpen}
        isLoading={isLoading}
        results={results}
        query={query}
        onSelect={() => setIsOpen(false)}
      />
    </div>
  );
}

export default SearchBar;
