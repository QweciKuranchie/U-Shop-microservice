"use client";

import React, { Dispatch, SetStateAction } from "react";
import Title from "../Title";
import { Badge } from "../ui/badge";
import { Award, ShieldCheck } from "lucide-react";

export interface SanityAttributeRef {
  _id?: string;
  title?: string;
  slug?: { current?: string };
  type?: string;
  options?: string[];
  unit?: string;
}

export interface SanityCategoryAttributeItem {
  required?: boolean;
  attribute?: SanityAttributeRef;
}

export interface CategoryWithAttributes {
  _id: string;
  title?: string;
  slug?: { current?: string };
  attributes?: SanityCategoryAttributeItem[];
}

export interface DynamicAttributeDef {
  key: string;
  title: string;
  options: string[];
}

export interface DynamicCategorySpecs {
  categoryTitle: string;
  attributes: DynamicAttributeDef[];
}

interface Props {
  selectedCategory?: string | null;
  categories?: CategoryWithAttributes[];
  dynamicAttrFilters?: Record<string, string>;
  onDynamicAttrChange?: (attrKey: string, val: string | null) => void;
  selectedCondition: string | null;
  setSelectedCondition: Dispatch<SetStateAction<string | null>>;
  selectedWarranty: string | null;
  setSelectedWarranty: Dispatch<SetStateAction<string | null>>;
}

export const CONDITIONS = [
  { label: "New", value: "new" },
  { label: "Refurbished", value: "refurbished" },
  { label: "Used - Like New", value: "like_new" },
  { label: "Used - Excellent", value: "excellent" },
  { label: "Used - Good", value: "good" },
  { label: "Used - Fair", value: "fair" },
  { label: "Used - For Parts", value: "for_parts" },
];

export const WARRANTIES = [
  { label: "Manufacturer Warranty", value: "manufacturer_warranty" },
  { label: "Seller Warranty", value: "seller_warranty" },
  { label: "No Warranty", value: "no_warranty" },
];

export function getDynamicSpecsForCategory(
  categorySlug: string | null,
  categories: CategoryWithAttributes[] = []
): DynamicCategorySpecs | null {
  if (!categorySlug) return null;

  const foundCat = categories.find(
    (c) => c.slug?.current === categorySlug || c._id === categorySlug
  );
  const catTitle = foundCat?.title || categorySlug;
  const slugLower = (foundCat?.slug?.current || categorySlug).toLowerCase();

  // 1. Check if category document has custom attributes array in Sanity
  if (foundCat?.attributes && Array.isArray(foundCat.attributes) && foundCat.attributes.length > 0) {
    const customAttrs: DynamicAttributeDef[] = foundCat.attributes
      .filter((item: SanityCategoryAttributeItem) => item?.attribute?.title)
      .map((item: SanityCategoryAttributeItem) => {
        const attr = item.attribute!;
        const attrTitle = attr.title || "";
        const attrKey = attr.slug?.current || attrTitle.toLowerCase().replace(/[^a-z0-9]/g, "-");
        let opts: string[] = attr.options || [];

        if (!opts || opts.length === 0) {
          if (attrTitle.toLowerCase().includes("ram")) opts = ["4", "6", "8", "12", "16", "32", "36"];
          else if (attrTitle.toLowerCase().includes("storage")) opts = ["64", "128", "256", "512", "1024 (1TB)"];
          else if (attrTitle.toLowerCase().includes("resolution")) opts = ["Full HD", "4K UHD", "8K"];
          else if (attrTitle.toLowerCase().includes("smart")) opts = ["Yes", "No"];
        }

        return {
          key: attrKey,
          title: attrTitle,
          options: opts,
        };
      });

    if (customAttrs.length > 0) {
      return { categoryTitle: catTitle, attributes: customAttrs };
    }
  }

  // 2. Preset category attribute mappings for leaf categories
  if (slugLower.includes("smartphone") || slugLower.includes("phone")) {
    return {
      categoryTitle: catTitle,
      attributes: [
        { key: "ram", title: "RAM (GB)", options: ["4", "6", "8", "12", "16"] },
        { key: "storage", title: "Storage", options: ["64", "128", "256", "512", "1024 (1TB)"] },
        { key: "battery-capacity", title: "Battery", options: ["3095 mAh", "4000 mAh", "5000 mAh"] },
      ],
    };
  }

  if (slugLower.includes("tv") || slugLower.includes("television")) {
    return {
      categoryTitle: catTitle,
      attributes: [
        { key: "screen-size", title: "Screen Size", options: ["32 inches", "43 inches", "55 inches", "65 inches"] },
        { key: "resolution", title: "Resolution", options: ["Full HD", "4K UHD", "8K"] },
        { key: "smart-tv", title: "Smart TV", options: ["Yes", "No"] },
      ],
    };
  }

  if (
    slugLower.includes("laptop") ||
    slugLower.includes("macbook") ||
    slugLower.includes("computer") ||
    slugLower.includes("pc")
  ) {
    return {
      categoryTitle: catTitle,
      attributes: [
        { key: "cpu-family", title: "CPU Family", options: ["Intel Core i5", "Intel Core i7", "AMD Ryzen 7", "Apple Silicon (M1/M2/M3)"] },
        { key: "ram", title: "RAM (GB)", options: ["8", "16", "32", "36"] },
        { key: "storage", title: "Storage", options: ["256", "512", "1024 (1TB)"] },
        { key: "gpu-model", title: "GPU", options: ["Integrated", "NVIDIA GeForce RTX 4050 6GB", "NVIDIA GeForce RTX 4060 8GB"] },
      ],
    };
  }

  if (slugLower.includes("camera")) {
    return {
      categoryTitle: catTitle,
      attributes: [
        { key: "camera-type", title: "Camera Type", options: ["DSLR", "Mirrorless", "Point & Shoot"] },
        { key: "sensor-resolution", title: "Sensor Resolution", options: ["24.2 MP", "32.5 MP", "45 MP"] },
        { key: "video-resolution", title: "Video Resolution", options: ["Full HD", "4K UHD", "8K"] },
      ],
    };
  }

  if (slugLower.includes("audio") || slugLower.includes("headset") || slugLower.includes("speaker") || slugLower.includes("earphone")) {
    return {
      categoryTitle: catTitle,
      attributes: [
        { key: "speaker-type", title: "Speaker Type", options: ["Portable Bluetooth", "Soundbar", "Over-Ear Headphones", "True Wireless Earbuds"] },
        { key: "connectivity", title: "Connectivity", options: ["Bluetooth", "USB-C", "3.5mm AUX"] },
      ],
    };
  }

  return null;
}

const AttributeList = ({
  selectedCategory,
  categories = [],
  dynamicAttrFilters = {},
  onDynamicAttrChange,
  selectedCondition,
  setSelectedCondition,
  selectedWarranty,
  setSelectedWarranty,
}: Props) => {
  const dynamicSpecs = getDynamicSpecsForCategory(selectedCategory || null, categories);

  return (
    <div className="p-6 space-y-6">
      {/* Dynamic Specs Section for Selected Leaf Category */}
      {dynamicSpecs && (
        <div className="p-4 bg-ushop-pink/5 rounded-xl border border-ushop-pink/20 space-y-4">
          <div className="flex items-center justify-between">
            <Title className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
              Dynamic Specs ({dynamicSpecs.categoryTitle})
            </Title>
            {Object.keys(dynamicAttrFilters || {}).length > 0 && (
              <button
                onClick={() => {
                  Object.keys(dynamicAttrFilters || {}).forEach((key) =>
                    onDynamicAttrChange?.(key, null)
                  );
                }}
                className="text-xs font-semibold text-ushop-pink hover:underline"
              >
                Reset Specs
              </button>
            )}
          </div>

          {dynamicSpecs.attributes.map((attr) => {
            const selectedVal = dynamicAttrFilters?.[attr.key];
            return (
              <div key={attr.key} className="space-y-1.5">
                <div className="text-xs font-semibold text-gray-700">{attr.title}</div>
                <div className="flex flex-wrap gap-1.5">
                  {attr.options.map((opt) => {
                    const isSelected = selectedVal === opt;
                    return (
                      <Badge
                        key={opt}
                        variant={isSelected ? "default" : "outline"}
                        onClick={() =>
                          onDynamicAttrChange?.(attr.key, isSelected ? null : opt)
                        }
                        className={`cursor-pointer text-xs py-1 px-2.5 rounded-full transition-all ${
                          isSelected
                            ? "bg-ushop-pink hover:bg-ushop-pink text-white border-ushop-pink shadow-sm"
                            : "border-gray-200 text-gray-700 hover:border-ushop-pink hover:text-ushop-pink bg-white"
                        }`}
                      >
                        {opt}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Condition Filter */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <Title className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-ushop-pink" />
            Condition
          </Title>
          {selectedCondition && (
            <button
              onClick={() => setSelectedCondition(null)}
              className="text-xs text-ushop-pink hover:underline"
            >
              Reset
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {CONDITIONS.map((cond) => {
            const isSelected = selectedCondition === cond.value;
            return (
              <Badge
                key={cond.value}
                variant={isSelected ? "default" : "outline"}
                onClick={() =>
                  setSelectedCondition(isSelected ? null : cond.value)
                }
                className={`cursor-pointer text-xs py-1 px-2.5 rounded-full transition-all ${
                  isSelected
                    ? "bg-ushop-pink hover:bg-ushop-pink text-white border-ushop-pink shadow-sm"
                    : "border-gray-200 text-gray-700 hover:border-ushop-pink hover:text-ushop-pink hover:bg-ushop-pink/10 bg-white"
                }`}
              >
                {cond.label}
              </Badge>
            );
          })}
        </div>
      </div>

      {/* Warranty Filter */}
      <div className="pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <Title className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-ushop-pink" />
            Warranty Type
          </Title>
          {selectedWarranty && (
            <button
              onClick={() => setSelectedWarranty(null)}
              className="text-xs text-ushop-pink hover:underline"
            >
              Reset
            </button>
          )}
        </div>
        <div className="space-y-1.5">
          {WARRANTIES.map((war) => {
            const isSelected = selectedWarranty === war.value;
            return (
              <div
                key={war.value}
                onClick={() => setSelectedWarranty(isSelected ? null : war.value)}
                className={`flex items-center justify-between p-2 rounded-lg cursor-pointer text-xs transition-colors ${
                  isSelected
                    ? "bg-ushop-pink/10 text-ushop-pink font-semibold"
                    : "hover:bg-ushop-pink/10 hover:text-ushop-pink text-gray-700"
                }`}
              >
                <span>{war.label}</span>
                {isSelected && <span className="w-2 h-2 rounded-full bg-ushop-pink" />}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AttributeList;
