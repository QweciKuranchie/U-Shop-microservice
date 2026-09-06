"use client";

import useCartStore from "@/store";
import Link from "next/link";
import React from "react";
import { ShoppingCartIcon } from "lucide-react";

const CartIcon = () => {
  const { items } = useCartStore();
  const itemCount = items?.reduce((total, item) => total + item.quantity, 0) || 0;
  const displayCount = itemCount > 9 ? "9+" : itemCount;
  return (
    <Link href={"/cart"} title="Shopping Cart" aria-label="Shopping Cart" className="group relative p-1.5 flex items-center justify-center">
      <ShoppingCartIcon className="w-5 h-5 sm:w-6 sm:h-6 group-hover:text-ushop-pink hoverEffect" />
      {itemCount > 0 ? (
        <span
          className={`absolute -top-1 -right-1 bg-ushop-red text-white rounded-full text-xs font-semibold flex items-center justify-center min-w-[14px] h-[14px] ${
            itemCount > 9 ? "px-1" : ""
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
};

export default CartIcon;