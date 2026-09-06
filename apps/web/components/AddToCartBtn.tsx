"use client";

import React, { useSyncExternalStore } from "react";
import { Product } from "@repo/sanity";
import { cn } from "@repo/utils";
import {  Button  } from "@repo/ui";
import { ShoppingCart } from "lucide-react";
import useCartStore from "@/store";
import { toast } from "sonner";
import { trackAddToCart } from "@/lib/analytics";
import QuantityButtons from "./QuantityButtons";

const emptySubscribe = () => () => {};

function useIsClient() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

interface Props {
  product: Product;
  className?: string;
  showQuantity?: boolean;
}

const AddToCartBtn = ({ product, className, showQuantity = true }: Props) => {
  const isClient = useIsClient();
  const { addItem, getItemCount } = useCartStore();

  const itemCount = isClient ? getItemCount(product?._id) : 0;
  const isOutOfStock = product?.stock === 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!product?._id) return;

    if ((product.stock ?? 0) > itemCount) {
      addItem(product);
      toast.success(`${product.name ? product.name.substring(0, 18) : "Item"} added to cart!`, {
        description: "Your shopping cart has been updated.",
        duration: 2500,
      });
      trackAddToCart({
        productId: product._id,
        name: product.name || "Unknown",
        price: product.price ?? 0,
        quantity: itemCount + 1,
      });
    } else {
      toast.error("Cannot add more than available stock");
    }
  };

  if (isClient && showQuantity && itemCount > 0) {
    return (
      <div className="w-full flex items-center justify-center">
        <QuantityButtons product={product} className={className} />
      </div>
    );
  }

  return (
    <Button
      onClick={handleAddToCart}
      disabled={isOutOfStock}
      aria-label={isOutOfStock ? "Out of Stock" : "Add to Cart"}
      title={isOutOfStock ? "Out of Stock" : "Add to Cart"}
      className={cn(
        "w-full bg-ushop-purple-dark/90 text-ushop_light_bg shadow-none border border-ushop-purple-dark/80 font-semibold tracking-wide hover:text-white hover:bg-ushop-purple-dark hover:border-ushop-purple-dark hoverEffect flex items-center justify-center gap-2 disabled:bg-zinc-200 disabled:text-zinc-400 disabled:border-zinc-200 disabled:cursor-not-allowed cursor-pointer",
        className
      )}
    >
      {!isOutOfStock && <ShoppingCart className="text-white" size={18} />}
      {isOutOfStock ? "Out of Stock" : "Add to Cart"}
    </Button>
  );
};

export default AddToCartBtn;