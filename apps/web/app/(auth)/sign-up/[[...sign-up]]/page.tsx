import { Suspense } from "react";
import SlidingAuthContainer from "@/components/auth/SlidingAuthContainer";

export default function SignUpPage() {
  return (
    <Suspense fallback={null}>
      <SlidingAuthContainer initialMode="sign-up" />
    </Suspense>
  );
}
