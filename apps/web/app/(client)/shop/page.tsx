import Shop from "@/components/shopPage/Shop";
import { getAllBrands, getCategories, getProductClassifications } from "@repo/sanity/queries";
import { Suspense } from "react";

const ShopPage = async () => {
  const categories = await getCategories();
  const brands = await getAllBrands();
  const classifications = await getProductClassifications();
  return (
    <div className="bg-white min-h-screen">
      <Suspense
        fallback={
          <div className="min-h-96 bg-gray-50 animate-pulse rounded-lg" />
        }
      >
        <Shop categories={categories} brands={brands} classifications={classifications} />
      </Suspense>
    </div>
  );
};

export default ShopPage;
