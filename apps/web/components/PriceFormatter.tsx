import { cn } from "@repo/utils";
import React from 'react'

interface Props {
    amount: number | undefined;
    className?: string;
}

const PriceFormatter = ({amount, className}: Props) => {
    const formattedAmount = new Number(amount).toLocaleString("en-US", {
        style: "currency",
        currency: "GHS",
        maximumFractionDigits: 2,
    });

    
  return (
    <span className={cn('text-sm text-darkColor font-semibold', className)}>
      {formattedAmount}
    </span> 
  )
}

export default PriceFormatter