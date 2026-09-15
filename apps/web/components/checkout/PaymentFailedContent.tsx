"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button, Card, CardContent } from "@repo/ui";
import { AlertCircle, ArrowLeft, RefreshCw, ShoppingCart } from "lucide-react";
import Container from "@/components/Container";

const REASON_MESSAGES: Record<string, { title: string; description: string }> = {
  missing_reference: {
    title: "Transaction Reference Missing",
    description:
      "We could not find a transaction reference for this payment. Please return to checkout and try again.",
  },
  failed: {
    title: "Payment Declined",
    description:
      "Your payment was declined by your bank or mobile money provider. Please verify your balance or try another payment method.",
  },
  abandoned: {
    title: "Payment Incomplete",
    description:
      "The payment window was closed or cancelled before the transaction could be finalized.",
  },
  verification_failed: {
    title: "Verification Failed",
    description:
      "We were unable to verify your payment status with Paystack. If you were debited, please contact our support team with your reference code.",
  },
  internal_error: {
    title: "System Error",
    description:
      "An unexpected system error occurred while processing your payment. Please try again in a few moments.",
  },
};

export function PaymentFailedContent() {
  const searchParams = useSearchParams();
  const reason = searchParams.get("reason") || "failed";
  const reference = searchParams.get("reference");

  const messageInfo = REASON_MESSAGES[reason] || {
    title: "Payment Failed",
    description:
      "We were unable to complete your transaction. Please try again or choose an alternative payment option.",
  };

  return (
    <Container className="py-12 flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-lg w-full text-center p-6 sm:p-8 shadow-lg border-red-100">
        <CardContent className="space-y-6 pt-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-red-100 flex items-center justify-center text-red-600">
            <AlertCircle className="w-9 h-9" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              {messageInfo.title}
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {messageInfo.description}
            </p>
          </div>

          {reference && (
            <div className="p-3 bg-gray-50 border rounded-lg text-xs space-y-1">
              <span className="text-gray-500 font-medium block">
                Transaction Reference
              </span>
              <code className="font-mono text-gray-800 select-all font-semibold">
                {reference}
              </code>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              asChild
              className="flex-1 h-11 bg-ushop-purple-dark hover:bg-ushop-purple text-white font-medium"
            >
              <Link href="/checkout">
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="flex-1 h-11 border-gray-300"
            >
              <Link href="/cart">
                <ShoppingCart className="w-4 h-4 mr-2" />
                Return to Cart
              </Link>
            </Button>
          </div>

          <div className="pt-2">
            <Link
              href="/"
              className="inline-flex items-center text-xs text-muted-foreground hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-3 h-3 mr-1" />
              Back to Homepage
            </Link>
          </div>
        </CardContent>
      </Card>
    </Container>
  );
}
