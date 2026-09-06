import React from "react";
import Container from "@/components/Container";
import HomeBanner from "@/components/HomeBanner";
import ProductGrid from "@/components/ProductGrid";
import HomeCategories from "@/components/HomeCategories";
import FlashSaleSection from "@/components/FlashSaleSection";
import PopularProductSection from "@/components/PopularProductSection";
import PromoBannerSection from "@/components/PromoBannerSection";
import NewArrivalsSection from "@/components/NewArrivalsSection";
import ActionMiniBanners from "@/components/ActionMiniBanners";
import { getCategories, getDealProducts, getPopularProducts, getNewArrivalProducts } from "@repo/sanity/queries";
import ShopByBrand from "@/components/ShopByBrand";
import ScrollToTop from "@/components/ScrollToTop";
import { generateOrganizationSchema, generateWebsiteSchema } from "@/lib/seo";

const Home = async () => {
  const [categories, dealProducts, popularProducts, newArrivals] =
    await Promise.all([
      getCategories(6),
      getDealProducts(),
      getPopularProducts(8),
      getNewArrivalProducts(10),
    ]);

  const orgSchema = generateOrganizationSchema();
  const websiteSchema = generateWebsiteSchema();

  return (
    <>
      {/* Structured Data (JSON-LD) for Homepage */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(orgSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteSchema),
        }}
      />

      <div className="bg-white min-h-screen">
        <Container className="pt-4 sm:pt-6">
          <HomeBanner />
          <ActionMiniBanners />
          {dealProducts && dealProducts.length > 0 && (
            <FlashSaleSection products={dealProducts} />
          )}
        </Container>

        <HomeCategories categories={categories} />
        <ShopByBrand />
        {popularProducts && popularProducts.length > 0 && (
          <PopularProductSection products={popularProducts} />
        )}
        <PromoBannerSection />
        {newArrivals && newArrivals.length > 0 && (
          <NewArrivalsSection products={newArrivals} />
        )}
        <div className="pb-16 pt-4">
          <ProductGrid />
        </div>
        <ScrollToTop />
      </div>
    </>
  );
};

export default Home;
