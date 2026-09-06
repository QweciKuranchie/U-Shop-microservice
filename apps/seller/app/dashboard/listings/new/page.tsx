import { ListingForm } from "@/components/listings/ListingForm";

export default function NewListingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Add New Product</h1>
        <p className="text-sm text-muted-foreground">Fill in product details to publish to UShop Ghana.</p>
      </div>
      <ListingForm />
    </div>
  );
}