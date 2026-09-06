import { defineType, defineField } from "sanity";
import { BasketIcon } from "@sanity/icons";

export const orderType = defineType({
  name: "order",
  title: "Order",
  type: "document",
  icon: BasketIcon,
  fields: [
    defineField({
      name: "orderNumber",
      title: "Order Number",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "invoice",
      type: "object",
      fields: [
        {name: "id", type: "string"},
        {name: "number", type: "string"},
        {name: "hosted_invoice_url", type: "url"},
      ] ,
    }),
    defineField({
      name: "clerkUserId",
      title: "Clerk User ID",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "customerName",
      title: "Customer Name",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "email",
      title: "Customer Email",
      type: "string",
      validation: (Rule) => Rule.required().email(),
    }),
    defineField({
      name: "items",
      title: "Order Items",
      type: "array",
      of: [
        {
          type: "object",
          name: "orderItem",
          title: "Order Item",
          fields: [
            defineField({
              name: "product",
              title: "Product",
              type: "reference",
              to: [{ type: "product" }],
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "quantity",
              title: "Quantity Purchased",
              type: "number",
              validation: (Rule) => Rule.required().min(1),
            }),
            defineField({
              name: "price",
              title: "Price at Purchase (GHS)",
              type: "number",
              validation: (Rule) => Rule.required().min(0),
            }),
          ],
          preview: {
            select: {
              Product: "product.name",
              quantity: "quantity",
              price: "product.price",
              media: "product.image",
            },
            prepare(selection) {
              const { title, quantity, price, media } = selection;
              return {
                title: title || "Product Name",
                subtitle: `${quantity} x ₵${price}`,
                media: media,
              };
            },
          },
        },
      ],
    }),
    defineField({
      name: "totalPrice",
      title: "Total Price (GHS)",
      type: "number",
      validation: (Rule) => Rule.required().min(0),
    }),
    defineField({
      name: "shippingAddress",
      title: "Shipping Address",
      type: "reference",
      to: [{ type: "address" }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "paymentMethod",
      title: "Payment Method",
      type: "string",
      options: {
        list: [
          { title: "Mobile Money (MTN, Telecel, AT)", value: "momo" },
          { title: "Credit/Debit Card (Visa, Mastercard)", value: "card" },
          { title: "Cash on Delivery", value: "cod" },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "paymentStatus",
      title: "Payment Status",
      type: "string",
      options: {
        list: [
          { title: "Pending", value: "pending" },
          { title: "Paid", value: "paid" },
          { title: "Failed", value: "failed" },
          { title: "Refunded", value: "refunded" },
        ],
      },
      initialValue: "pending",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "paymentGateway",
      title: "Payment Gateway",
      type: "string",
      initialValue: "paystack",
      options: {
        list: [
          { title: "Paystack", value: "paystack" },
          { title: "None / Cash on Delivery", value: "none" },
        ],
      },
    }),
    defineField({
      name: "paystackReference",
      title: "Paystack Reference",
      type: "string",
      description: "The unique transaction reference returned by Paystack.",
    }),
    defineField({
      name: "paystackTransactionId",
      title: "Paystack Transaction ID",
      type: "string",
      description: "The official transaction ID from Paystack.",
    }),
    defineField({
      name: "paystackMetadata",
      title: "Paystack Metadata",
      type: "text",
      description: "Raw metadata or JSON response from the Paystack callback/webhook.",
    }),
    defineField({
      name: "orderStatus",
      title: "Order Status",
      type: "string",
      options: {
        list: [
          { title: "Pending", value: "pending" },
          { title: "Processing", value: "processing" },
          { title: "Shipped", value: "shipped" },
          { title: "Delivered", value: "delivered" },
          { title: "Cancelled", value: "cancelled" },
        ],
      },
      initialValue: "pending",
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {
      title: "orderNumber",
      customerName: "customerName",
      totalPrice: "totalPrice",
      status: "orderStatus",
    },
    prepare(selection) {
      const { title, customerName, totalPrice, status } = selection;
      return {
        title: `Order #${title}`,
        subtitle: `${customerName} - ₵${totalPrice} (${status})`,
      };
    },
  },
});
