import Container from "@/components/Container";
import Title from "@/components/Title";
import DynamicBreadcrumb from "@/components/DynamicBreadcrumb";
import PaginatedProductGrid from "@/components/PaginatedProductGrid";
import NoProductAvailable from "@/components/product/NoProductsAvailable";
import { getSingleBrandBySlug, getProductsByBrandSlug } from "@repo/sanity/queries";
import Image from "next/image";
import { urlFor } from "@repo/sanity";
import { notFound } from "next/navigation";
import { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const brand = await getSingleBrandBySlug(slug);

  if (!brand) {
    return {
      title: "Brand Not Found",
    };
  }

  return {
    title: `${brand.name} Products | UShop`,
    description: brand.description || `Browse official ${brand.name} products on UShop.`,
  };
}

const SingleBrandPage = async ({ params }: Props) => {
  const { slug } = await params;

  const [brand, products] = await Promise.all([
    getSingleBrandBySlug(slug),
    getProductsByBrandSlug(slug),
  ]);

  if (!brand) {
    return notFound();
  }

  const logoUrl = brand.image ? urlFor(brand.image).url() : null;

  return (
    <div className="min-h-screen bg-gray-50/50 py-6">
      <Container>
        {/* Breadcrumb */}
        <DynamicBreadcrumb
          customItems={[
            { label: "Brands", href: "/brands" },
            { label: brand.name || "Brand" },
          ]}
        />

        {/* Brand Banner Card */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-100 shadow-xs mb-8 flex flex-col md:flex-row items-center gap-6">
          {logoUrl ? (
            <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-2xl bg-ushop-light/40 border border-gray-100 flex-shrink-0 flex items-center justify-center p-3">
              <Image
                src={logoUrl}
                alt={brand.name || "Brand Logo"}
                fill
                className="object-contain p-2"
                priority
                sizes="144px"
              />
            </div>
          ) : (
            <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl bg-ushop-pink/10 text-ushop-pink flex-shrink-0 flex items-center justify-center text-4xl font-bold border border-ushop-pink/20">
              {brand.name?.charAt(0) || "B"}
            </div>
          )}

          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-2">
              <Title className="text-2xl sm:text-3xl font-bold text-gray-900">
                {brand.name}
              </Title>
              <span className="inline-self-center md:self-auto text-xs font-semibold bg-ushop-pink/10 text-ushop-pink border border-ushop-pink/20 px-3 py-1 rounded-full w-fit mx-auto md:mx-0">
                {products.length} {products.length === 1 ? "Product" : "Products"} Available
              </span>
            </div>

            {brand.description && (
              <p className="text-sm text-gray-600 leading-relaxed max-w-3xl">
                {brand.description}
              </p>
            )}
          </div>
        </div>

        {/* Products Section */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900">
              Products by {brand.name}
            </h2>
            <span className="text-xs text-gray-500">
              Showing {products.length} items
            </span>
          </div>

          {products && products.length > 0 ? (
            <PaginatedProductGrid products={products} initialLimit={12} incrementBy={12} />
          ) : (
            <div className="py-12">
              <NoProductAvailable className="bg-transparent" />
            </div>
          )}
        </div>
      </Container>
    </div>
  );
};

export default SingleBrandPage;
