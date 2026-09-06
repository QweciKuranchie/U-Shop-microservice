import { Suspense } from "react";
import ProductPageSkeleton from "@/components/ProductPageSkeleton";
import { getProductBySlug, getRelatedProducts, getProductsFromSeller, getBrand } from "@repo/sanity/queries";
import { notFound } from "next/navigation";
import ProductContent from "@/components/ProductContent";
import { Product } from "@repo/sanity";
import { Metadata } from "next";
import {
  generateProductMetadata,
  generateProductSchema,
  generateBreadcrumbSchema,
} from "@/lib/seo";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return {
      title: "Product Not Found",
      description: "The product you're looking for could not be found.",
    };
  }

  // Fetch brand data if needed
  const brand = await getBrand(slug);
  const productWithBrand = { ...product, brand };

  return generateProductMetadata(productWithBrand);
}

const ProductPage = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {
  const { slug } = await params;

  return (
    <div>
      <Suspense fallback={<ProductPageSkeleton />}>
        <ProductPageContent slug={slug} />
      </Suspense>
    </div>
  );
};

type ProductWithCalculations = Product & {
  averageRating?: number;
  totalReviews?: number;
};

const ProductPageContent = async ({ slug }: { slug: string }) => {
  const product = (await getProductBySlug(slug)) as ProductWithCalculations | null;

  if (!product) {
    return notFound();
  }

  // Fetch related data on the server side
  const categoryIds =
    product?.categories?.map(
      (cat: { _ref: string; _type: string; _key: string }) => cat._ref
    ) || [];

  const productObj = product as unknown as Record<string, unknown>;
  const storeObj = productObj?.store as Record<string, unknown> | undefined;
  const storeId = (storeObj?._id as string) || (product?.store?._ref as string) || "";

  const [relatedProducts, sellerProducts, brand] = await Promise.all([
    getRelatedProducts(categoryIds, product?.slug?.current || "", 6),
    getProductsFromSeller(storeId, product?.slug?.current || "", 6),
    getBrand(product?.slug?.current as string),
  ]);

  // Convert null values to undefined for TypeScript compatibility
  const productWithReviews = {
    ...product,
    averageRating: product.averageRating ?? undefined,
    totalReviews: product.totalReviews ?? undefined,
  };

  const productWithBrand = { ...productWithReviews, brand };

  // Generate structured data
  const productSchema = generateProductSchema(productWithBrand);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Shop", url: "/shop" },
    { name: productWithReviews.name || "Product", url: `/product/${slug}` },
  ]);

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema),
        }}
      />

      <ProductContent
        product={productWithReviews}
        relatedProducts={(relatedProducts || []) as unknown as Product[]}
        sellerProducts={(sellerProducts || []) as unknown as Product[]}
        brand={brand}
      />
    </>
  );
};

export default ProductPage;
