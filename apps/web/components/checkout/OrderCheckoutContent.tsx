"use client";

import React, { useState } from "react";
import {  Button  } from "@repo/ui";
import {  Card, CardContent, CardHeader, CardTitle  } from "@repo/ui";
import {  RadioGroup, RadioGroupItem  } from "@repo/ui";
import {  Label  } from "@repo/ui";
import {  Separator  } from "@repo/ui";
import {
  CreditCard,
  MapPin,
  Package,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import PriceFormatter from "@/components/PriceFormatter";
import Image from "next/image";
import { urlFor } from "@repo/sanity";
import { toast } from "sonner";
import { PAYMENT_METHODS, PaymentMethod } from "@/lib/orderStatus";
import Link from "next/link";
import {  Badge  } from "@repo/ui";
import { SanityOrder } from "@repo/sanity";

interface OrderCheckoutContentProps {
  order: SanityOrder;
}

export function OrderCheckoutContent({ order }: OrderCheckoutContentProps) {
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<PaymentMethod>(PAYMENT_METHODS.STRIPE);
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayNow = async () => {
    setIsProcessing(true);

    try {
      const response = await fetch(`/api/orders/${order._id}/pay`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok && data.success && data.url) {
        // Redirect to Stripe checkout
        window.location.href = data.url;
      } else {
        toast.error(data.error || "Failed to create payment session");
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Failed to initiate payment");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      {/* Order Details */}
      <div className="lg:col-span-2 space-y-6">
        {/* Order Info */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5 text-ushop-pink" />
                Order #{order.orderNumber?.slice(-8)}
              </CardTitle>
              <Badge variant="outline" className="capitalize bg-ushop_light_pink text-ushop-purple-dark border-ushop-pink/20">
                {order.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Customer</p>
                <p className="font-medium">{order.customerName}</p>
                <p className="text-muted-foreground">{order.email}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Order Date</p>
                <p className="font-medium">
                  {order.orderDate
                    ? new Date(order.orderDate).toLocaleDateString()
                    : order._createdAt
                    ? new Date(order._createdAt).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Shipping Address */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-ushop-pink" />
              Shipping Address
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <p className="font-medium">{order.address?.name}</p>
              <p className="text-muted-foreground">{order.address?.address}</p>
              <p className="text-muted-foreground">
                {order.address?.city}, {order.address?.state} {order.address?.zip}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Payment Method */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-ushop-pink" />
              Payment Method
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={selectedPaymentMethod}
              onValueChange={(value) =>
                setSelectedPaymentMethod(value as PaymentMethod)
              }
              className="space-y-3"
            >
              <div className={`flex items-start space-x-3 p-3 border rounded-lg transition-colors ${selectedPaymentMethod === PAYMENT_METHODS.STRIPE ? "border-ushop-pink bg-ushop_light_pink/30" : ""}`}>
                <RadioGroupItem
                  value={PAYMENT_METHODS.STRIPE}
                  id="stripe"
                  className="mt-1 accent-ushop-purple"
                />
                <div className="flex-1">
                  <Label htmlFor="stripe" className="cursor-pointer">
                    <div className="flex items-center gap-2 font-medium">
                      <CreditCard className="w-4 h-4 text-ushop-purple-dark" />
                      Credit/Debit Card
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Pay securely with your credit or debit card via Stripe
                    </p>
                  </Label>
                </div>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Order Items */}
        <Card>
          <CardHeader>
            <CardTitle>Order Items ({order.products?.length ?? 0})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {(order.products ?? []).map((item: any, index: number) => (
              <div key={index} className="flex gap-3 p-3 border rounded-lg">
                <div className="w-16 h-16 flex-shrink-0">
                  <Image
                    src={
                      item.product?.images?.[0]
                        ? urlFor(item.product.images[0]).url()
                        : "/placeholder.jpg"
                    }
                    alt={item.product?.name || "Product"}
                    width={64}
                    height={64}
                    className="w-full h-full object-cover rounded"
                  />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">{item.product?.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    Qty: {item.quantity}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">
                    <PriceFormatter
                      amount={(item.product?.price ?? 0) * (item.quantity ?? 0)}
                    />
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <PriceFormatter amount={item.product?.price} /> each
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Order Summary & Actions */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span>Subtotal ({order.products?.length ?? 0} items)</span>
              <PriceFormatter amount={order.subtotal} />
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              {order.shipping === 0 ? (
                <span className="text-green-600 font-medium">Free</span>
              ) : (
                <PriceFormatter amount={order.shipping} />
              )}
            </div>
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <PriceFormatter amount={order.totalPrice} />
            </div>
          </CardContent>
        </Card>

        <Button
          onClick={handlePayNow}
          disabled={isProcessing}
          className="w-full h-12 text-lg font-semibold bg-ushop-purple-dark hover:bg-ushop-purple text-white shadow-md shadow-purple-900/10 cursor-pointer transition-colors"
          size="lg"
        >
          {isProcessing ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Processing...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-ushop_light_pink" />
              Pay <PriceFormatter amount={order.totalPrice} />
            </div>
          )}
        </Button>

        <Button asChild variant="outline" className="w-full border-ushop-pink/40 text-ushop-purple hover:bg-ushop-pink hover:text-white font-semibold transition-colors">
          <Link href="/user/orders" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Orders
          </Link>
        </Button>

        <div className="text-center text-xs text-muted-foreground">
          <p>🔒 Secure payment</p>
          <p>Your payment information is encrypted and secure</p>
        </div>
      </div>
    </div>
  );
}
export default OrderCheckoutContent;
