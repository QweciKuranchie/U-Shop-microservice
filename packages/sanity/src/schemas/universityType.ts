import { defineType, defineField } from "sanity";
import { EarthAmericasIcon } from "@sanity/icons";

export const universityType = defineType({
  name: "university",
  title: "University",
  type: "document",
  icon: EarthAmericasIcon,
  fields: [
    defineField({
      name: "name",
      title: "University Name",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "name",
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "logo",
      title: "Logo / Badge",
      type: "image",
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: "image",
      title: "Campus Cover Image",
      type: "image",
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: "city",
      title: "City",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "domain",
      title: "Student Email Domain",
      type: "string",
      description: "e.g., student.ug.edu.gh, knust.edu.gh (used for student verification)",
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
    }),
    defineField({
      name: "featured",
      title: "Featured Campus",
      type: "boolean",
      description: "Toggle featured campus showcase on homepage/marketplace",
      initialValue: false,
    }),
  ],
  preview: {
    select: {
      title: "name",
      subtitle: "city",
      media: "logo",
    },
  },
});
