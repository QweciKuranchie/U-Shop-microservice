import { client } from "@repo/sanity";
import { ListingForm } from "@/components/listings/ListingForm";

export default async function EditListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await client.fetch(`*[_type == "product" && _id == $id][0]`, { id });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Edit Product</h1>
        <p className="text-sm text-muted-foreground">Update listing details and inventory.</p>
      </div>
      <ListingForm initialData={product} />
    </div>
  );
}