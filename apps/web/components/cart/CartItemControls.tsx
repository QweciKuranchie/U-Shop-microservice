"use client";

import {  Button  } from "@repo/ui";
import QuantityButtons from "@/components/QuantityButtons";
import { Trash2 } from "lucide-react";
import useCartStore from "@/store";
import { Product } from "@repo/sanity";
import { toast } from "sonner";

interface CartItemControlsProps {
  product: Product;
}

export function CartItemControls({ product }: CartItemControlsProps) {
  const { deleteCartProduct } = useCartStore();

  const handleRemove = () => {
    deleteCartProduct(product._id);
    toast.success("Item removed from cart");
  };

  return (
    <div className="flex items-center gap-3">
      <QuantityButtons
        product={product}
        className="bg-gray-100/80 rounded-lg px-1.5 py-0.5 pb-0.5 gap-2"
      />
      <Button
        variant="ghost"
        size="icon"
        onClick={handleRemove}
        className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
        title="Remove item"
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );
}
