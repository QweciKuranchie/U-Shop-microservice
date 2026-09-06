import { defineType, defineField } from "sanity";
import { CaseIcon } from "@sanity/icons";

export const storeType = defineType({
  name: "store",
  title: "Store",
  type: "document",
  icon: CaseIcon,
  fields: [
    defineField({
      name: "name",
      title: "Store Name",
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
      name: "ownerName",
      title: "Owner Name",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "clerkUserId",
      title: "Clerk User ID",
      type: "string",
      description: "Link to the Clerk authentication User ID",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "location",
      title: "Location / Campus",
      type: "reference",
      to: [{ type: "location" }],
      description: "The location or campus where this store/seller operates (critical for buyer meetups)",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "description",
      title: "Store Description",
      type: "text",
    }),
    defineField({
      name: "logo",
      title: "Store Logo",
      type: "image",
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: "banner",
      title: "Store Banner",
      type: "image",
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: "verifiedStudent",
      title: "Verified Student",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "verifiedSeller",
      title: "Verified Seller",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "rating",
      title: "Rating",
      type: "number",
      initialValue: 5,
      validation: (Rule) => Rule.min(0).max(5),
    }),
    defineField({
      name: "status",
      title: "Store Status",
      type: "string",
      options: {
        list: [
          { title: "Active", value: "active" },
          { title: "Suspended", value: "suspended" },
        ],
      },
      initialValue: "active",
    }),
  ],
});
