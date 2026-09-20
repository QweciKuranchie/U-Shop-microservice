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
      description: "Link to the legacy Clerk authentication User ID",
    }),
    defineField({
      name: "supabaseUserId",
      title: "Supabase User ID",
      type: "string",
      description: "Link to the Supabase auth user UUID",
    }),
    defineField({
      name: "sellerType",
      title: "Seller Type",
      type: "string",
      options: {
        list: [
          { title: "Personal Seller", value: "personal" },
          { title: "Verified Business", value: "business" },
          { title: "Campus Student Seller", value: "student" },
        ],
      },
      initialValue: "personal",
    }),
    defineField({
      name: "phone",
      title: "Phone Number",
      type: "string",
    }),
    defineField({
      name: "email",
      title: "Seller Email",
      type: "string",
    }),
    defineField({
      name: "location",
      title: "Location / Campus",
      type: "reference",
      to: [{ type: "location" }],
      description: "The location or campus where this store/seller operates (critical for buyer meetups)",
    }),
    defineField({
      name: "locationText",
      title: "Location Details / Address",
      type: "string",
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
    // KYC Verification Fields
    defineField({
      name: "nationalIdNumber",
      title: "National ID / Ghana Card Number",
      type: "string",
      description: "For Personal and General KYC verification",
    }),
    defineField({
      name: "businessName",
      title: "Registered Business Name",
      type: "string",
      description: "For Verified Business sellers",
    }),
    defineField({
      name: "businessRegistrationNumber",
      title: "Business Registration Number",
      type: "string",
      description: "For Verified Business sellers (RGD/Registrar General)",
    }),
    defineField({
      name: "university",
      title: "University / Institution",
      type: "string",
      description: "For Student sellers",
    }),
    defineField({
      name: "studentIdNumber",
      title: "Student ID Number",
      type: "string",
      description: "For Student sellers",
    }),
    defineField({
      name: "studentEmail",
      title: "Student Email",
      type: "string",
      description: "Institutional email (.edu or .ac.gh)",
    }),
    defineField({
      name: "kycStatus",
      title: "KYC Verification Status",
      type: "string",
      options: {
        list: [
          { title: "Pending Review", value: "pending_review" },
          { title: "Approved", value: "approved" },
          { title: "Rejected", value: "rejected" },
          { title: "Not Submitted", value: "not_submitted" },
        ],
      },
      initialValue: "pending_review",
    }),
    defineField({
      name: "kycRejectionReason",
      title: "KYC Rejection Reason",
      type: "text",
    }),
    defineField({
      name: "kycReviewedAt",
      title: "KYC Reviewed At",
      type: "datetime",
    }),
    defineField({
      name: "kycReviewedBy",
      title: "KYC Reviewed By",
      type: "string",
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
          { title: "Pending Review", value: "pending_review" },
          { title: "Suspended", value: "suspended" },
          { title: "Rejected", value: "rejected" },
        ],
      },
      initialValue: "pending_review",
    }),
  ],
});
