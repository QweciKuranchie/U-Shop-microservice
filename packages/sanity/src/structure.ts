import type { StructureResolver, StructureBuilder } from "sanity/structure";
import { TagIcon, FolderIcon, MasterDetailIcon, ThLargeIcon } from "@sanity/icons";

// Helper function to generate recursive subcategory tree nodes
function buildCategorySubtree(S: StructureBuilder, categoryId: string): ReturnType<StructureBuilder["list"]> {
  return S.list()
    .title("Category Options")
    .items([
      // Option 1: Edit the category document itself
      S.listItem()
        .title("Edit Category Document")
        .icon(TagIcon)
        .child(S.document().schemaType("category").documentId(categoryId)),

      S.divider(),

      // Option 2: Subcategories referencing this category as parent
      S.listItem()
        .title("Subcategories")
        .icon(FolderIcon)
        .child(
          S.documentTypeList("category")
            .title("Subcategories")
            .filter('_type == "category" && (parent._ref == $categoryId || parent._ref == "drafts." + $categoryId)')
            .params({ categoryId: categoryId.replace(/^drafts\./, "") })
            .child((childId) => buildCategorySubtree(S, childId))
        ),
    ]);
}

export const structure: StructureResolver = (S) =>
  S.list()
    .title("Ecommerce Admin")
    .items([
      // ─── CATEGORY NAVIGATION TREE ───────────────────────────────
      S.listItem()
        .title("Categories")
        .icon(TagIcon)
        .child(
          S.list()
            .title("Category Navigation")
            .items([
              // 1. Visual Hierarchy Tree (grouped by Product Classification)
              S.listItem()
                .title("Category Tree (by Classification)")
                .icon(ThLargeIcon)
                .child(
                  S.documentTypeList("productClassification")
                    .title("Product Classifications")
                    .child((classificationId) =>
                      S.documentTypeList("category")
                        .title("Root Categories")
                        .filter(
                          '_type == "category" && !defined(parent) && (productType._ref == $classificationId || productType._ref == "drafts." + $classificationId)'
                        )
                        .params({
                          classificationId: classificationId.replace(/^drafts\./, ""),
                        })
                        .child((categoryId) => buildCategorySubtree(S, categoryId))
                    )
                ),

              // 2. Flat List of All Categories (for quick search & editing)
              S.listItem()
                .title("All Categories (Flat List)")
                .icon(MasterDetailIcon)
                .child(
                  S.documentTypeList("category")
                    .title("All Categories")
                ),
            ])
        ),

      S.divider(),

      // ─── ALL OTHER DOCUMENT TYPES ────────────────────────────────
      ...S.documentTypeListItems().filter(
        (item) => item.getId() && !["category"].includes(item.getId()!)
      ),
    ]);
