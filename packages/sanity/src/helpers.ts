import { writeClient, client } from "./client";
import { SanityOrder } from "./queries/userQueries";

export interface PaginatedOrdersResult {
  orders: SanityOrder[];
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export async function getMyOrders(
  clerkUserId: string,
  page: number = 1,
  limit: number = 20
): Promise<PaginatedOrdersResult> {
  try {
    const start = (page - 1) * limit;
    const end = start + limit;

    const countQuery = `count(*[_type == "order" && clerkUserId == $clerkUserId])`;
    const ordersQuery = `*[_type == "order" && clerkUserId == $clerkUserId] | order(_createdAt desc) [${start}...${end}] {
      _id,
      orderNumber,
      orderDate,
      status,
      totalPrice,
      currency,
      amountDiscount,
      paymentMethod,
      paymentStatus,
      invoice,
      products[] {
        product -> {
          _id,
          name,
          image {
            asset -> {
              _id,
              url
            }
          },
          price,
          currency
        },
        quantity
      }
    }`;

    const [totalCount, orders] = await Promise.all([
      client.fetch<number>(countQuery, { clerkUserId }),
      client.fetch<SanityOrder[]>(ordersQuery, { clerkUserId }),
    ]);

    const totalPages = Math.ceil((totalCount || 0) / limit);

    return {
      orders: orders || [],
      totalCount: totalCount || 0,
      totalPages: totalPages || 1,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };
  } catch (error) {
    console.error("Error fetching user orders:", error);
    return {
      orders: [],
      totalCount: 0,
      totalPages: 1,
      hasNextPage: false,
      hasPrevPage: false,
    };
  }
}

export interface ContactMessageData {
  name: string;
  email: string;
  subject: string;
  message: string;
  phone?: string;
  ipAddress?: string;
  userAgent?: string;
  [key: string]: unknown;
}

export async function saveContactMessage(data: ContactMessageData) {
  try {
    const doc = {
      _type: "contact",
      name: data.name,
      email: data.email,
      subject: data.subject,
      message: data.message,
      phone: data.phone || "",
      ipAddress: data.ipAddress || "",
      createdAt: new Date().toISOString(),
      status: "unread",
    };

    const result = await writeClient.create(doc);
    return { success: true, data: result, id: result._id };
  } catch (error) {
    console.error("Error saving contact message:", error);
    return { success: false, error };
  }
}
