import { Dispatch, SetStateAction, useMemo } from "react";
import Title from "../Title";
import { Brand, Category } from "@repo/sanity";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Label } from "../ui/label";
import { ExtendedCategory } from "./CategoryList";

interface Props {
  brands: Brand[];
  selectedBrand?: string | null;
  setSelectedBrand: Dispatch<SetStateAction<string | null>>;
  selectedCategory?: string | null;
  categories?: (Category | ExtendedCategory)[];
}

const BrandList = ({
  brands,
  selectedBrand,
  setSelectedBrand,
  selectedCategory,
  categories,
}: Props) => {
  const displayBrands = useMemo(() => {
    if (!selectedCategory) {
      return brands || [];
    }

    const currentCat = (categories as ExtendedCategory[])?.find(
      (c) => c?.slug?.current === selectedCategory || c?._id === selectedCategory
    );

    const allowed = currentCat?.allowedBrands;
    if (!allowed || allowed.length === 0) {
      // Category has no brand restrictions / no allowed brands -> hide brand section
      return [];
    }

    const allowedIdsOrSlugs = new Set(
      allowed.flatMap((b) => [b._id, b.slug?.current].filter(Boolean))
    );

    return (brands || []).filter(
      (brand) =>
        allowedIdsOrSlugs.has(brand._id) ||
        (brand.slug?.current && allowedIdsOrSlugs.has(brand.slug.current))
    );
  }, [brands, selectedCategory, categories]);

  if (!displayBrands || displayBrands.length === 0) {
    return null;
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <Title className="text-base font-semibold text-gray-900">Brands</Title>
        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
          {displayBrands.length}
        </span>
      </div>

      <RadioGroup value={selectedBrand || ""} className="space-y-1">
        {displayBrands.map((brand) => (
          <div
            key={brand?._id}
            onClick={() => {
              const currentSlug = brand?.slug?.current as string;
              if (selectedBrand === currentSlug) {
                setSelectedBrand(null);
              } else {
                setSelectedBrand(currentSlug);
              }
            }}
            className="group flex items-center space-x-3 px-2 py-1 -mx-2 rounded-md hover:bg-ushop-pink/10 cursor-pointer transition-colors duration-150"
          >
            <RadioGroupItem
              value={brand?.slug?.current as string}
              id={brand?.slug?.current}
              className="border-gray-300 text-ushop-pink focus:ring-ushop-pink"
            />
            <Label
              htmlFor={brand?.slug?.current}
              className={`flex-1 cursor-pointer transition-colors duration-150 ${
                selectedBrand === brand?.slug?.current
                  ? "font-semibold text-ushop-pink"
                  : "text-gray-700 group-hover:text-ushop-pink"
              }`}
            >
              {brand?.name}
            </Label>
          </div>
        ))}
      </RadioGroup>

      {selectedBrand && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setSelectedBrand(null);
          }}
          className="mt-4 text-xs font-medium text-ushop-pink hover:underline underline-offset-2 decoration-1 transition-colors duration-150"
        >
          Clear brand filter
        </button>
      )}
    </div>
  );
};

export default BrandList;
