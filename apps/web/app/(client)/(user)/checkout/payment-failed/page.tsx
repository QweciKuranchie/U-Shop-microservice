import React, { Suspense } from "react";
import { PaymentFailedContent } from "@/components/checkout/PaymentFailedContent";
import { Loader2 } from "lucide-react";
import Container from "@/components/Container";

function PaymentFailedFallback() {
  return (
    <Container className="py-12 flex items-center justify-center min-h-[60vh]">
      <div className="text-center space-y-3">
        <Loader2 className="w-8 h-8 mx-auto animate-spin text-ushop-purple-dark" />
        <p className="text-sm text-muted-foreground">Loading payment details...</p>
      </div>
    </Container>
  );
}

export const metadata = {
  title: "Payment Failed | UShop",
  description: "Payment status and transaction retry details",
};

export default function PaymentFailedPage() {
  return (
    <Suspense fallback={<PaymentFailedFallback />}>
      <PaymentFailedContent />
    </Suspense>
  );
}
