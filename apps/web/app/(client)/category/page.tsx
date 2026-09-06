import Container from "@/components/Container";
import DynamicBreadcrumb from "@/components/DynamicBreadcrumb";
import CategoryClient from "@/components/category/CategoryClient";
import { getCategories, getProductClassifications } from "@repo/sanity/queries";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Top Product Categories | UShop",
  description: "Browse top tech product categories on UShop. Laptops, smartphones, accessories, appliances, and gaming gear.",
};

const CategoryPage = async () => {
  const [categories, classifications] = await Promise.all([
    getCategories(),
    getProductClassifications(),
  ]);

  return (
    <div className="min-h-screen bg-gray-50/50 py-6">
      <Container>
        {/* Breadcrumb Navigation */}
        <DynamicBreadcrumb
          customItems={[{ label: "Categories", href: "/category" }]}
        />

        {/* Categories Client Layout */}
        <CategoryClient
          initialCategories={categories || []}
          classifications={classifications || []}
        />
      </Container>
    </div>
  );
};

export default CategoryPage;
