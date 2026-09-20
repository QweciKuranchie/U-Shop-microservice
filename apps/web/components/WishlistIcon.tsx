"use client";

import React, { useEffect, useState } from "react";
import { HeartIcon } from "lucide-react";
import Link from "next/link";
import useCartStore from "@/store";
import isArray from "js-isarray";

export default function WishlistIcon() {
  const [mounted, setMounted] = useState(false);
  const { favoriteProduct } = useCartStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  const count = (mounted && isArray(favoriteProduct)) ? favoriteProduct.length : 0;
  const displayCount = count > 9 ? "9+" : count;

  return (
    <Link href={"/wishlist"} title="Wishlist" aria-label="Wishlist" className="group relative p-1.5 flex items-center justify-center">
      <HeartIcon className="w-5 h-5 sm:w-6 sm:h-6 group-hover:text-ushop-pink hoverEffect" />
      {count > 0 ? (
        <span
          className={`absolute -top-1 -right-1 bg-ushop-red text-white rounded-full text-xs font-semibold flex items-center justify-center min-w-[14px] h-[14px] ${
            count > 9 ? "px-1" : ""
          }`}
        >
          {displayCount}
        </span>
      ) : (
        <span className="absolute -top-1 -right-1 bg-ushop-red text-white h-3.5 w-3.5 rounded-full text-xs font-semibold flex items-center justify-center">
          0
        </span>
      )}
    </Link>
  );
}
