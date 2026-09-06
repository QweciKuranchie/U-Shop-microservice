import { defineType, defineField } from "sanity";
import { TagIcon } from "@sanity/icons";

export const categoryType = defineType({
  name: "category",
  title: "Category",
  type: "document",
  icon: TagIcon,
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "title",
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "productType",
      title: "Product Type",
      type: "reference",
      to: [{ type: "productClassification" }],
      description: "Root product classification (e.g. Electronics, Computing, Others)",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "parent",
      title: "Parent Category",
      type: "reference",
      to: [{ type: "category" }],
      description: "Parent category in the hierarchy (leave empty for top-level categories)",
      validation: (Rule) =>
        Rule.custom(async (parentRef, context) => {
          if (!parentRef?._ref) return true;

          const { document, getClient } = context;
          const client = getClient({ apiVersion: "2026-07-07" });
          const docId = document?._id?.replace(/^drafts\./, "");

          // 1. Prevent self-reference
          if (parentRef._ref === docId || parentRef._ref === `drafts.${docId}`) {
            return "A category cannot be its own parent.";
          }

          // 2. Check productType consistency
          const childTypeRef = (document?.productType as { _ref?: string })?._ref;
          if (childTypeRef) {
            const parentDoc = await client.fetch(
              `*[_id == $id || _id == "drafts." + $id][0]{ "typeRef": productType._ref }`,
              { id: parentRef._ref.replace(/^drafts\./, "") }
            );
            if (parentDoc?.typeRef && parentDoc.typeRef !== childTypeRef) {
              return "Parent category must belong to the same Product Classification as this category.";
            }
          }

          // 3. Cycle detection – walk up the ancestor chain
          const MAX_DEPTH = 10;
          let currentRef = parentRef._ref;
          for (let i = 0; i < MAX_DEPTH; i++) {
            const ancestor = await client.fetch(
              `*[_id == $id || _id == "drafts." + $id][0]{ "parentRef": parent._ref }`,
              { id: currentRef.replace(/^drafts\./, "") }
            );
            if (!ancestor?.parentRef) break;
            const ancestorId = ancestor.parentRef.replace(/^drafts\./, "");
            if (ancestorId === docId) {
              return "Circular reference detected – this category is already an ancestor of the selected parent.";
            }
            currentRef = ancestor.parentRef;
          }

          return true;
        }),
    }),
    defineField({
      name: "level",
      title: "Hierarchy Level",
      type: "string",
      description: "Auto-inferred: Top Category if no parent, otherwise Subcategory or Leaf.",
      options: {
        list: [
          { title: "Top Category", value: "category" },
          { title: "Subcategory", value: "subcategory" },
          { title: "Leaf Category", value: "leaf" },
        ],
      },
      initialValue: "leaf",
      validation: (Rule) =>
        Rule.custom(async (level, context) => {
          const { document, getClient } = context;
          const client = getClient({ apiVersion: "2026-07-07" });
          const hasParent = !!(document?.parent as { _ref?: string })?._ref;
          const docId = document?._id?.replace(/^drafts\./, "");

          if (!hasParent && level !== "category") {
            return 'Categories without a parent should be set to "Top Category".';
          }

          if (hasParent) {
            // Check if this category has children
            const childCount = await client.fetch(
              `count(*[_type == "category" && (parent._ref == $id || parent._ref == "drafts." + $id)])`,
              { id: docId }
            );
            if (childCount > 0 && level === "leaf") {
              return 'This category has children — it should be "Subcategory", not "Leaf".';
            }
            if (childCount === 0 && level === "category") {
              return 'Categories with a parent cannot be "Top Category".';
            }
          }

          return true;
        }),
    }),
    defineField({
      name: "attributes",
      title: "Attributes",
      type: "array",
      description:
        "Structured attribute definitions for products in this category. Mark attributes as required to enforce them on products.",
      of: [
        {
          type: "object",
          name: "categoryAttribute",
          fields: [
            defineField({
              name: "attribute",
              title: "Attribute",
              type: "reference",
              to: [{ type: "attribute" }],
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "required",
              title: "Required?",
              type: "boolean",
              description: "If checked, products in this category must provide a value for this attribute.",
              initialValue: false,
            }),
          ],
          preview: {
            select: {
              title: "attribute.title",
              type: "attribute.type",
              unit: "attribute.unit",
              required: "required",
            },
            prepare({ title, type, unit, required }) {
              const badge = required ? "✱ Required" : "Optional";
              const subtitle = [type, unit, badge].filter(Boolean).join(" · ");
              return { title: title || "(select attribute)", subtitle };
            },
          },
        },
      ],
    }),
    defineField({
      name: "allowedBrands",
      title: "Allowed Brands",
      type: "array",
      description: "Brands allowed for products in this category.",
      of: [{ type: "reference", to: [{ type: "brand" }] }],
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
    }),
    defineField({
      name: "featured",
      title: "Featured Category",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "image",
      title: "Category Image",
      type: "image",
      options: {
        hotspot: true,
      },
    }),
  ],
  preview: {
    select: {
      title: "title",
      classificationTitle: "productType.title",
      parentTitle: "parent.title",
      level: "level",
      media: "image",
    },
    prepare(selection) {
      const { title, classificationTitle, parentTitle, level, media } = selection;
      const details = [
        classificationTitle ? classificationTitle.toUpperCase() : null,
        level ? `[${level}]` : null,
        parentTitle ? `Sub of: ${parentTitle}` : null,
      ]
        .filter(Boolean)
        .join(" • ");
      return {
        title,
        subtitle: details,
        media,
      };
    },
  },
});