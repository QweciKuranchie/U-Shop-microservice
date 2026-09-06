"use client"

import * as React from "react"
import { Slider as SliderPrimitive } from "@base-ui/react/slider"
import { cn } from "@repo/utils"

function Slider({
  className,
  value,
  ...props
}: SliderPrimitive.Root.Props) {
  // Support both single and ranged values dynamically
  const values = Array.isArray(value) ? value : [value ?? 0];

  return (
    <SliderPrimitive.Root
      value={value}
      className={cn(
        "relative flex w-full touch-none select-none items-center",
        className
      )}
      {...props}
    >
      <SliderPrimitive.Control className="relative flex w-full items-center py-4">
        <SliderPrimitive.Track className="relative h-1.5 w-full grow rounded-full bg-primary/20">
          <SliderPrimitive.Indicator className="absolute h-full bg-primary rounded-full" />
        </SliderPrimitive.Track>
        {values.map((_, i) => (
          <SliderPrimitive.Thumb
            key={i}
            className="block h-4 w-4 rounded-full border border-primary/50 bg-background shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
          />
        ))}
      </SliderPrimitive.Control>
    </SliderPrimitive.Root>
  )
}

export { Slider }
