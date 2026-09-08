import { Suspense } from "react";
import SlidingAuthContainer from "@/components/auth/SlidingAuthContainer";

export default function SignInPage() {
  return (
    <Suspense fallback={null}>
      <SlidingAuthContainer initialMode="sign-in" />
    </Suspense>
  );
}
