export const dynamic = "force-dynamic";

import { ProductsType } from "@/types/admin";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { client } from "@/sanity/lib/client";

const getData = async (): Promise<ProductsType> => {
  try {
    const products = await client.fetch(
      `*[_type == "product"] | order(_createdAt desc) {
        _id,
        name,
        "slug": slug.current,
        price,
        discount,
        stock,
        condition,
        status,
        sellerType,
        shortDescription,
        description,
        "imageUrl": image.asset->url,
        "images": images[].asset->url,
        "category": category->{ _id, title, "slug": slug.current },
        "categorySlug": category->slug.current,
        "brand": brand->{ _id, name, "slug": slug.current },
        "productClassification": productClassification->{ _id, title, "slug": slug.current },
        colors,
        sizes
      }`
    );

    return products.map((p: any) => {
      const fallbackImage =
        p.imageUrl || (Array.isArray(p.images) && p.images[0]) || "";
      const imageMap: Record<string, string> = {};
      if (Array.isArray(p.colors) && p.colors.length > 0) {
        p.colors.forEach((c: string, i: number) => {
          imageMap[c] =
            (Array.isArray(p.images) && p.images[i]) || fallbackImage;
        });
      } else {
        imageMap["default"] = fallbackImage;
      }

      return {
        id: p._id,
        _id: p._id,
        name: p.name || "Untitled Product",
        price: p.price || 0,
        discount: p.discount || 0,
        stock: p.stock ?? 1,
        condition: p.condition || "new",
        status: p.status || "new",
        sellerType: p.sellerType || "personal",
        shortDescription: p.shortDescription || p.description || "",
        description: p.description || "",
        sizes: Array.isArray(p.sizes) ? p.sizes : [],
        colors: Array.isArray(p.colors) ? p.colors : ["default"],
        images: imageMap,
        category: p.category,
        categorySlug: p.categorySlug || p.category?.slug || "",
        brand: p.brand,
        productClassification: p.productClassification,
        slug: p.slug || "",
      };
    });
  } catch (error) {
    console.error("Error fetching products for admin products page:", error);
    return [];
  }
};

const ProductPage = async () => {
  const data = await getData();
  return (
    <div className="py-4 space-y-6">
      <div className="flex items-center justify-between px-4 py-3 bg-card border rounded-lg shadow-xs">
        <div>
          <h1 className="font-semibold text-lg">Product Catalog</h1>
          <p className="text-xs text-muted-foreground">
            Manage your store inventory, pricing, and variants
          </p>
        </div>
        <div className="text-sm font-medium text-muted-foreground">
          Total: <span className="text-foreground font-bold">{data.length}</span>
        </div>
      </div>
      <DataTable columns={columns} data={data} />
    </div>
  );
};

export default ProductPage;
