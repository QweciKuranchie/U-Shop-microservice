import { createServerClient } from "@repo/supabase/server";
import { client } from "@repo/sanity";
import { Card, CardContent, CardHeader, CardTitle, Input, Label, Textarea, Button } from "@repo/ui";

export default async function StoreSettingsPage() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const store = user
    ? await client.fetch(
        `*[_type == "store" && (supabaseUserId == $userId || clerkUserId == $userId)][0]`,
        { userId: user.id }
      )
    : null;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Store Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your public store profile, contact details, and branding.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Profile Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Store Name</Label>
            <Input id="name" defaultValue={store?.name} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ownerName">Owner Name</Label>
            <Input id="ownerName" defaultValue={store?.ownerName} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Store Bio / Description</Label>
            <Textarea id="description" defaultValue={store?.description} rows={3} />
          </div>
          <Button>Save Changes</Button>
        </CardContent>
      </Card>
    </div>
  );
}