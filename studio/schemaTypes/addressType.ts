import { defineType, defineField } from "sanity";
import { HomeIcon, CaseIcon, BookIcon } from "@sanity/icons";

export const addressType = defineType({
  name: "address",
  title: "Address",
  type: "document",
  icon: HomeIcon,
  fields: [
    defineField({
      name: "name",
      title: "Full Name",
      type: "string",
      description: "Full name for this address",
      validation: (Rule) => Rule.required().max(100),
    }),
    defineField({
      name: "email",
      title: "User Email",
      type: "email",
      description: "Email of the user this address belongs to",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "user",
      title: "User",
      type: "reference",
      to: [{ type: "user" }],
      description: "Reference to the user this address belongs to",
    }),
    defineField({
      name: "phone",
      title: "Phone Number",
      type: "string",
      description: "Phone number for this address (optional)",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "streetAddress",
      title: "Street Address",
      type: "string",
      description: "The street address including apartment/unit/House number",
      validation: (Rule) => Rule.required().min(5).max(200),
    }),
    defineField({
      name: "city",
      title: "City",
      type: "string",
      validation: (Rule) => Rule.required().max(50),
    }),
    defineField({
      name: "state",
      title: "State / Region",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "country",
      title: "Country",
      type: "string",
      initialValue: "Ghana",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "addressType",
      title: "Address Type",
      type: "string",
      options: {
        list: [
          { title: "Home", value: "home" },
          { title: "Work", value: "work" },
          { title: "School", value: "school" },
          { title: "Other", value: "other" },
        ],
        layout: "radio",
      },
      initialValue: "home",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "default",
      title: "Default Address",
      type: "boolean",
      description: "Is this the default shipping address?",
      initialValue: false,
    }),
    defineField({
      name: "createdAt",
      title: "Created At",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
    }),
  ],
  
  preview: {
    select: {
      title: "name",
      subtitle: "address",
      city: "city",
      state: "state",
      isDefault: "default",
      type: "type",
    },
    prepare(selection) {
      const { title, subtitle, city, state, isDefault, type } = selection;
      let mediaIcon = HomeIcon;
      if (type === "work") mediaIcon = CaseIcon;
      if (type === "school") mediaIcon = BookIcon;

      return {
        title: `${title} ${isDefault ? "(Default)" : ""}`,
        subtitle: `${type}: ${subtitle}, ${city}, ${state}`,
        media: mediaIcon,
      };
    },
  },
});
