"use client";

import { Product } from "@repo/sanity";

interface AttributeMapItem {
  key?: string;
  slug?: string;
  type?: string;
  unit?: string;
  value?: string | number | boolean;
}

interface ProductsDetailsProps {
  product?: (Product & {
    attributeMap?: AttributeMapItem[];
    brand?: { name?: string; title?: string };
    productClassification?: { title?: string };
    category?: { title?: string };
    store?: { name?: string; location?: { name?: string; city?: string } };
  }) | null;
}

const ProductsDetails = ({ product }: ProductsDetailsProps) => {
  const attributes = product?.attributeMap || [];

  // Build rows array from dynamic attributeMap or product properties
  const rows: { label: string; value: string }[] = [];

  if (product?.brand?.name || product?.brand?.title) {
    rows.push({
      label: "Brand",
      value: (product.brand.name || product.brand.title)!,
    });
  }

  if (product?.productClassification?.title) {
    rows.push({
      label: "Classification",
      value: product.productClassification.title,
    });
  }

  if (product?.category?.title) {
    rows.push({
      label: "Category",
      value: product.category.title,
    });
  }

  if (product?.variant) {
    rows.push({
      label: "Condition / Variant",
      value: product.variant,
    });
  }

  if (product?.stock !== undefined) {
    rows.push({
      label: "Stock Quantity",
      value: product.stock > 0 ? `${product.stock} units available` : "Out of Stock",
    });
  }

  // Add custom dynamic attributes from attributeMap
  attributes.forEach((attr) => {
    if (attr.key && attr.value !== undefined && attr.value !== null) {
      const valStr =
        typeof attr.value === "boolean"
          ? attr.value
            ? "Yes"
            : "No"
          : String(attr.value);
      const displayVal = attr.unit ? `${valStr} ${attr.unit}` : valStr;

      if (!rows.some((r) => r.label.toLowerCase() === attr.key?.toLowerCase())) {
        rows.push({
          label: attr.key,
          value: displayVal,
        });
      }
    }
  });

  return (
    <div className="w-full space-y-8 mb-10">
      {/* Description Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h2 className="text-xl font-bold text-zinc-900 mb-4 flex items-center gap-2">
          <span className="w-1 h-5 bg-ushop-pink rounded-full"></span>
          Product Description
        </h2>
        <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed whitespace-pre-line">
          {product?.description || "No description provided for this product."}
        </div>
      </div>

      {/* Additional Information Section */}
      {rows.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-xl font-bold text-zinc-900 mb-4 flex items-center gap-2">
            <span className="w-1 h-5 bg-ushop-pink rounded-full"></span>
            Specifications & Details
          </h2>
          <div className="overflow-hidden rounded-lg border border-gray-100">
            <table className="min-w-full divide-y divide-gray-200">
              <tbody className="bg-white divide-y divide-gray-100">
                {rows.map((row, idx) => (
                  <tr
                    key={idx}
                    className="hover:bg-gray-50/80 transition-colors odd:bg-gray-50/40"
                  >
                    <td className="px-3 py-2.5 sm:px-6 sm:py-3.5 text-xs sm:text-sm font-semibold text-gray-900 w-1/3">
                      {row.label}
                    </td>
                    <td className="px-3 py-2.5 sm:px-6 sm:py-3.5 text-xs sm:text-sm text-gray-700 font-medium">
                      {row.value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsDetails;
