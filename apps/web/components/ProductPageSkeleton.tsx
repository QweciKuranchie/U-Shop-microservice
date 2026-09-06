import {  Skeleton  } from "@repo/ui";
import Container from "@/components/Container";

const ProductPageSkeleton = () => {
  return (
    <div className="min-h-screen bg-white">
      <Container className="py-8 sm:py-12">
        {/* Breadcrumb Skeleton */}
        <div className="flex items-center gap-2 mb-8">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-24" />
        </div>

        <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
          {/* Left: Image Gallery Skeleton */}
          <div className="w-full md:w-1/2 space-y-4">
            <Skeleton className="w-full aspect-square rounded-2xl animate-pulse" />
            <div className="flex gap-4">
              <Skeleton className="w-20 h-20 rounded-xl animate-pulse" />
              <Skeleton className="w-20 h-20 rounded-xl animate-pulse" />
              <Skeleton className="w-20 h-20 rounded-xl animate-pulse" />
              <Skeleton className="w-20 h-20 rounded-xl animate-pulse" />
            </div>
          </div>

          {/* Right: Product Info Skeleton */}
          <div className="w-full md:w-1/2 space-y-6">
            <div className="space-y-3">
              <Skeleton className="h-4 w-24 rounded-full animate-pulse" />
              <Skeleton className="h-10 w-3/4 rounded-xl animate-pulse" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-24 animate-pulse" />
                <Skeleton className="h-4 w-12 animate-pulse" />
              </div>
            </div>

            <div className="space-y-2">
              <Skeleton className="h-8 w-32 rounded-lg animate-pulse" />
              <Skeleton className="h-4 w-24 animate-pulse" />
            </div>

            <Skeleton className="h-px w-full" />

            <div className="space-y-2">
              <Skeleton className="h-4 w-full animate-pulse" />
              <Skeleton className="h-4 w-full animate-pulse" />
              <Skeleton className="h-4 w-2/3 animate-pulse" />
            </div>

            <Skeleton className="h-px w-full" />

            <div className="space-y-4">
              <div className="flex gap-4">
                <Skeleton className="h-12 flex-1 rounded-xl animate-pulse" />
                <Skeleton className="h-12 w-12 rounded-xl animate-pulse" />
              </div>
              <Skeleton className="h-12 w-full rounded-xl animate-pulse" />
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default ProductPageSkeleton;
