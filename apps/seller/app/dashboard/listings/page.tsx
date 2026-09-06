/* eslint-disable @typescript-eslint/no-explicit-any */
import { auth } from "@clerk/nextjs/server";
import { client } from "@repo/sanity";
import Link from "next/link";
import { Button, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Badge } from "@repo/ui";
import { Plus } from "lucide-react";

export default async function ListingsPage() {
  const { userId } = await auth();
  const store = await client.fetch(`*[_type == "store" && clerkUserId == $userId][0]{ _id }`, { userId });

  const products = await client.fetch(
    `*[_type == "product" && store._ref == $storeId] | order(_createdAt desc){ _id, name, price, discount, stock, condition }`,
    { storeId: store?._id }
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Product Listings</h1>
          <p className="text-sm text-muted-foreground">Manage your store products and inventory.</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/listings/new">
            <Plus className="w-4 h-4 mr-2" /> Add Listing
          </Link>
        </Button>
      </div>

      <div className="border rounded-lg bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Condition</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products && products.length > 0 ? (
              products.map((item: any) => (
                <TableRow key={item._id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>GH₵ {item.price}</TableCell>
                  <TableCell>{item.stock ?? 0}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{item.condition || "new"}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/dashboard/listings/${item._id}`}>Edit</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No listings found. Click &quot;Add Listing&quot; to publish your first product.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}