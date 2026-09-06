import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { client } from "@repo/sanity";
import { SELLER_STORE_QUERY } from "@repo/sanity/queries";
import { createStoreAction } from "./actions";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Label, Textarea } from "@repo/ui";

export default async function CreateStorePage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("https://ushopgh.com/sign-in?redirect_url=https://seller.ushopgh.com/create-store");
  }

  const existingStore = await client.fetch(SELLER_STORE_QUERY, { userId });

  if (existingStore) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-muted/40 flex items-center justify-center p-4">
      <Card className="max-w-lg w-full">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Create Your Seller Store</CardTitle>
          <CardDescription>
            Set up your storefront to start selling products on UShop Ghana.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createStoreAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Store Name *</Label>
              <Input id="name" name="name" placeholder="e.g. Accra Tech Hub" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ownerName">Owner / Business Name *</Label>
              <Input id="ownerName" name="ownerName" placeholder="e.g. John Doe" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sellerType">Seller Type</Label>
              <select
                id="sellerType"
                name="sellerType"
                defaultValue="personal"
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
              >
                <option value="personal">Personal Seller</option>
                <option value="business">Verified Business</option>
                <option value="student">Campus Student Seller</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Store Description</Label>
              <Textarea id="description" name="description" placeholder="Briefly describe what you sell..." rows={3} />
            </div>
            <Button type="submit" className="w-full bg-primary text-primary-foreground font-semibold">
              Create Store & Launch Dashboard
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}