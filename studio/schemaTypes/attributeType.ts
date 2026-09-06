import { defineType, defineField } from "sanity";
import { ControlsIcon } from "@sanity/icons";

export const attributeType = defineType({
  name: "attribute",
  title: "Attribute",
  type: "document",
  icon: ControlsIcon,
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      description: 'e.g. "RAM", "Screen Size", "Condition"',
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
      name: "type",
      title: "Value Type",
      type: "string",
      description: "Determines how this attribute's value is captured on a product.",
      options: {
        list: [
          { title: "Free Text (String)", value: "string" },
          { title: "Number", value: "number" },
          { title: "Yes / No (Boolean)", value: "boolean" },
          { title: "Single Choice (Select)", value: "select" },
          { title: "Multiple Choice (Multi-Select)", value: "multiSelect" },
        ],
        layout: "radio",
      },
      initialValue: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "options",
      title: "Options",
      type: "array",
      of: [{ type: "string" }],
      description:
        'Predefined choices for "Select" and "Multi-Select" types. Leave empty for other types.',
      hidden: ({ parent }) =>
        parent?.type !== "select" && parent?.type !== "multiSelect",
    }),
    defineField({
      name: "unit",
      title: "Unit",
      type: "string",
      description: 'e.g. "GB", "inches", "mAh". Leave empty if not applicable.',
    }),
  ],
  preview: {
    select: {
      title: "title",
      type: "type",
      unit: "unit",
    },
    prepare({ title, type, unit }) {
      const typeLabels: Record<string, string> = {
        string: "Text",
        number: "Number",
        boolean: "Boolean",
        select: "Select",
        multiSelect: "Multi-Select",
      };
      const subtitle = [typeLabels[type] || type, unit].filter(Boolean).join(" · ");
      return { title, subtitle };
    },
  },
  orderings: [
    {
      title: "Title A → Z",
      name: "titleAsc",
      by: [{ field: "title", direction: "asc" }],
    },
  ],
});
