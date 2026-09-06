"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, Label, Textarea, Card, CardContent, CardHeader, CardTitle } from "@repo/ui";

interface ListingFormProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialData?: any;
}

export function ListingForm({ initialData }: ListingFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const body = {
      name: formData.get("name"),
      price: Number(formData.get("price")),
      discount: Number(formData.get("discount") || 0),
      stock: Number(formData.get("stock") || 1),
      description: formData.get("description"),
      condition: formData.get("condition") || "new",
    };

    startTransition(async () => {
      const url = initialData?._id ? `/api/seller/listings/${initialData._id}` : "/api/seller/listings";
      const method = initialData?._id ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        router.push("/dashboard/listings");
        router.refresh();
      }
    });
  };

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>{initialData?._id ? "Edit Listing" : "Create New Listing"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Product Title *</Label>
            <Input id="name" name="name" defaultValue={initialData?.name} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price (GH₵) *</Label>
              <Input id="price" name="price" type="number" step="0.01" defaultValue={initialData?.price} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="discount">Discount (%)</Label>
              <Input id="discount" name="discount" type="number" defaultValue={initialData?.discount || 0} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stock">Stock Quantity *</Label>
              <Input id="stock" name="stock" type="number" defaultValue={initialData?.stock || 1} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="condition">Condition</Label>
              <select id="condition" name="condition" defaultValue={initialData?.condition || "new"} className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm">
                <option value="new">Brand New</option>
                <option value="used">Used / Refurbished</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" defaultValue={initialData?.description} rows={4} />
          </div>
          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? "Saving..." : initialData?._id ? "Update Listing" : "Publish Listing"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}