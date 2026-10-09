"use client";

import {  Card, CardContent, CardHeader  } from "@repo/ui";
import {  Separator  } from "@repo/ui";
import {  Skeleton  } from "@repo/ui";

export function CheckoutSkeleton() {
  return (
    <div className="grid lg:grid-cols-3 gap-8 animate-in fade-in-0 duration-500">
      {/* Left Column - Payment, Address, Items */}
      <div className="lg:col-span-2 space-y-6">
        {/* Payment Method Section */}
        <div className="space-y-3">
          <Skeleton className="h-6 w-36" /> {/* "Payment Method" title */}
          <Card>
            <CardContent className="p-5 sm:p-6 space-y-3">
              {/* Payment Option 1 */}
              <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/40">
                <Skeleton className="w-4 h-4 rounded-full" />
                <Skeleton className="w-6 h-6" />
                <Skeleton className="h-4 w-32" />
              </div>

              {/* Payment Option 2 */}
              <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/40">
                <Skeleton className="w-4 h-4 rounded-full" />
                <Skeleton className="w-6 h-6" />
                <Skeleton className="h-4 w-28" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Address Selection Section */}
        <div className="space-y-3">
          <Skeleton className="h-6 w-40" /> {/* "Shipping Address" title */}
          <Card>
            <CardContent className="p-5 sm:p-6 space-y-3">
              {/* Address Option 1 */}
              <div className="flex items-start gap-3 p-4 rounded-xl bg-muted/40">
                <Skeleton className="w-4 h-4 rounded-full mt-1" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                  <Skeleton className="h-3 w-40" />
                </div>
              </div>

              {/* Address Option 2 */}
              <div className="flex items-start gap-3 p-4 rounded-xl bg-muted/40">
                <Skeleton className="w-4 h-4 rounded-full mt-1" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-3 w-52" />
                  <Skeleton className="h-3 w-36" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Items Section */}
        <div className="space-y-3">
          <Skeleton className="h-6 w-32" /> {/* "Order Items" title */}
          <Card>
            <CardContent className="p-5 sm:p-6 space-y-3">
              {/* Item 1 */}
              <div className="flex gap-4 p-3.5 rounded-xl bg-muted/30">
                <Skeleton className="w-16 h-16 rounded-lg shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-5 w-16" />
                  </div>
                </div>
              </div>

              {/* Item 2 */}
              <div className="flex gap-4 p-3.5 rounded-xl bg-muted/30">
                <Skeleton className="w-16 h-16 rounded-lg shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-3 w-1/3" />
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-5 w-20" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Right Column - Order Summary */}
      <div className="lg:col-span-1 space-y-3">
        <Skeleton className="h-6 w-32" /> {/* "Order Summary" title */}
        <Card className="sticky top-6">
          <CardContent className="p-5 sm:p-6 space-y-4">
            {/* Subtotal */}
            <div className="flex justify-between">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-16" />
            </div>

            {/* Discount */}
            <div className="flex justify-between">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-14" />
            </div>

            {/* Shipping */}
            <div className="flex justify-between">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-12" />
            </div>

            {/* Tax */}
            <div className="flex justify-between">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 w-10" />
            </div>

            <Separator />

            {/* Total */}
            <div className="flex justify-between">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-20" />
            </div>

            <div className="space-y-3 pt-4">
              {/* Pay Now Button */}
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>

            {/* Additional Info */}
            <div className="pt-4 space-y-2">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-3/4" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function CheckoutHeaderSkeleton() {
  return (
    <div className="space-y-6 animate-in fade-in-0 duration-300">
      {/* Breadcrumb Skeleton */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-12" />
        <span className="text-muted-foreground">/</span>
        <Skeleton className="h-4 w-8" />
        <span className="text-muted-foreground">/</span>
        <Skeleton className="h-4 w-16" />
      </div>

      {/* Header Skeleton */}
      <div className="flex items-center gap-2">
        <Skeleton className="w-6 h-6" />
        <Skeleton className="h-8 w-32" />
      </div>
    </div>
  );
}

export function OrderCheckoutSkeleton() {
  return (
    <div className="grid lg:grid-cols-3 gap-8 animate-in fade-in-0 duration-500">
      {/* Left Column - Order Details */}
      <div className="lg:col-span-2 space-y-6">
        {/* Order Info */}
        <div className="space-y-3">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <Skeleton className="h-6 w-40" /> {/* Order number */}
              <Skeleton className="h-4 w-32" /> {/* Date */}
            </div>
            <Skeleton className="h-6 w-20 rounded-full" />{" "}
            {/* Status badge */}
          </div>
          <Card>
            <CardContent className="p-5 sm:p-6">
              <div className="grid md:grid-cols-2 gap-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Shipping Address */}
        <div className="space-y-3">
          <Skeleton className="h-6 w-40" /> {/* "Shipping Address" title */}
          <Card>
            <CardContent className="p-5 sm:p-6 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
              <Skeleton className="h-3 w-40" />
            </CardContent>
          </Card>
        </div>

        {/* Payment Method Selection */}
        <div className="space-y-3">
          <Skeleton className="h-6 w-36" /> {/* Payment method title */}
          <Card>
            <CardContent className="p-5 sm:p-6 space-y-3">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/40">
                <Skeleton className="w-4 h-4 rounded-full" />
                <Skeleton className="w-6 h-6" />
                <Skeleton className="h-4 w-32" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Items */}
        <div className="space-y-3">
          <Skeleton className="h-6 w-32" /> {/* Items title */}
          <Card>
            <CardContent className="p-5 sm:p-6 space-y-3">
              {/* Item 1 */}
              <div className="flex gap-4 p-3.5 rounded-xl bg-muted/30">
                <Skeleton className="w-16 h-16 rounded-lg shrink-0" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <div className="flex justify-between items-center mt-2">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                </div>
              </div>
              {/* Item 2 */}
              <div className="flex gap-4 p-3.5 rounded-xl bg-muted/30">
                <Skeleton className="w-16 h-16 rounded-lg shrink-0" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-3 w-1/3" />
                  <div className="flex justify-between items-center mt-2">
                    <Skeleton className="h-3 w-12" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Right Column - Payment Summary */}
      <div className="lg:col-span-1 space-y-3">
        <Skeleton className="h-6 w-36" /> {/* Payment summary title */}
        <Card className="sticky top-6">
          <CardContent className="p-5 sm:p-6 space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-20" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-14" />
              </div>
            </div>
            <Separator />
            <div className="flex justify-between">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-24" />
            </div>
            <Skeleton className="h-12 w-full rounded-xl mt-6" />{" "}
            {/* Pay button */}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
