import { defineType, defineField } from "sanity";
import { EarthAmericasIcon } from "@sanity/icons";

export const locationType = defineType({
  name: "location",
  title: "Location",
  type: "document",
  icon: EarthAmericasIcon,
  fields: [
    defineField({
      name: "name",
      title: "Location Name",
      type: "string",
      description: "e.g., University of Ghana (Legon), KNUST, East Legon, Accra",
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
      name: "type",
      title: "Location Type",
      type: "string",
      options: {
        list: [
          { title: "University Campus", value: "university" },
          { title: "Residential Area", value: "residential" },
          { title: "Commercial Hub", value: "commercial" },
          { title: "Other", value: "other" },
        ],
      },
      initialValue: "university",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "city",
      title: "City",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "emailDomain",
      title: "Student Email Domain (Optional)",
      type: "string",
      description: "e.g., student.ug.edu.gh (used for student verification on campus locations)",
    }),
    defineField({
      name: "image",
      title: "Campus / Location Image",
      type: "image",
      options: {
        hotspot: true,
      },
    }),
  ],
});
