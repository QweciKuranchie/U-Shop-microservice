export const dynamic = "force-dynamic";

import { BadgeCheck, Candy, Citrus, Shield } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Progress } from "@/components/ui/progress";
import { Sheet, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import EditUser from "@/components/EditUser";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import AppLineChart from "@/components/AppLineChart";
import { auth, clerkClient, User } from "@clerk/nextjs/server";
import Link from "next/link";

const getData = async (id: string): Promise<User | null> => {
  try {
    const { userId } = await auth();
    if (!userId) return null;

    const client = await clerkClient();
    const user = await client.users.getUser(id);
    return JSON.parse(JSON.stringify(user));
  } catch (err) {
    console.error("Error fetching single user from Clerk:", err);
    return null;
  }
};

const SingleUserPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;
  const data = await getData(id);

  if (!data) {
    return (
      <div className="py-12 text-center space-y-4">
        <h2 className="text-xl font-semibold">User Not Found</h2>
        <p className="text-sm text-muted-foreground">
          The requested user could not be found or you do not have permission to view them.
        </p>
        <Button asChild variant="outline">
          <Link href="/admin/users">Back to Users List</Link>
        </Button>
      </div>
    );
  }

  const displayName =
    data.firstName || data.lastName
      ? `${data.firstName || ""} ${data.lastName || ""}`.trim()
      : data.username || "User";

  const email = data.emailAddresses?.[0]?.emailAddress || "No email";
  const phone = data.phoneNumbers?.[0]?.phoneNumber || "No phone";
  const role = (data.publicMetadata as any)?.role || "Customer";

  return (
    <div className="py-4 space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/admin">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/admin/users">Users</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{displayName}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* CONTAINER */}
      <div className="mt-4 flex flex-col xl:flex-row gap-8">
        {/* LEFT */}
        <div className="w-full xl:w-1/3 space-y-6">
          {/* USER BADGES CONTAINER */}
          <div className="bg-card border p-4 rounded-xl shadow-xs">
            <h1 className="text-base font-semibold">User Badges & Status</h1>
            <div className="flex gap-4 mt-4">
              <HoverCard>
                <HoverCardTrigger>
                  <BadgeCheck
                    size={36}
                    className="rounded-full bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/40 p-2 cursor-pointer"
                  />
                </HoverCardTrigger>
                <HoverCardContent>
                  <h1 className="font-bold mb-1 text-sm">Verified Account</h1>
                  <p className="text-xs text-muted-foreground">
                    This user's identity or primary email has been verified.
                  </p>
                </HoverCardContent>
              </HoverCard>

              <HoverCard>
                <HoverCardTrigger>
                  <Shield
                    size={36}
                    className="rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/40 p-2 cursor-pointer"
                  />
                </HoverCardTrigger>
                <HoverCardContent>
                  <h1 className="font-bold mb-1 text-sm">Role: {String(role)}</h1>
                  <p className="text-xs text-muted-foreground">
                    Current system permissions assigned to this user profile.
                  </p>
                </HoverCardContent>
              </HoverCard>

              <HoverCard>
                <HoverCardTrigger>
                  <Candy
                    size={36}
                    className="rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/40 p-2 cursor-pointer"
                  />
                </HoverCardTrigger>
                <HoverCardContent>
                  <h1 className="font-bold mb-1 text-sm">Active Shopper</h1>
                  <p className="text-xs text-muted-foreground">
                    Engaged shopper with purchase activity in UShop.
                  </p>
                </HoverCardContent>
              </HoverCard>

              <HoverCard>
                <HoverCardTrigger>
                  <Citrus
                    size={36}
                    className="rounded-full bg-orange-500/20 text-orange-600 dark:text-orange-400 border border-orange-500/40 p-2 cursor-pointer"
                  />
                </HoverCardTrigger>
                <HoverCardContent>
                  <h1 className="font-bold mb-1 text-sm">Loyalty Member</h1>
                  <p className="text-xs text-muted-foreground">
                    Enrolled in the UShop customer rewards program.
                  </p>
                </HoverCardContent>
              </HoverCard>
            </div>
          </div>

          {/* USER CARD CONTAINER */}
          <div className="bg-card border p-4 rounded-xl shadow-xs space-y-3">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12 border">
                <AvatarImage src={data.imageUrl} />
                <AvatarFallback>
                  {displayName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <h1 className="text-lg font-semibold">{displayName}</h1>
                <span className="text-xs text-muted-foreground font-mono">
                  ID: {data.id}
                </span>
              </div>
            </div>
          </div>

          {/* INFORMATION CONTAINER */}
          <div className="bg-card border p-4 rounded-xl shadow-xs">
            <div className="flex items-center justify-between">
              <h1 className="text-base font-semibold">User Details</h1>
              <Sheet>
                <SheetTrigger asChild>
                  <Button size="sm" variant="outline">Edit User</Button>
                </SheetTrigger>
                <EditUser initialData={{ fullName: displayName, email, phone }} />
              </Sheet>
            </div>
            <div className="space-y-3 mt-4 text-sm">
              <div className="flex flex-col gap-1.5 mb-4">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Profile Completion</span>
                  <span>85%</span>
                </div>
                <Progress value={85} className="h-2" />
              </div>
              <div className="flex items-center justify-between py-1 border-b">
                <span className="text-muted-foreground">Full Name:</span>
                <span className="font-medium">{displayName}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b">
                <span className="text-muted-foreground">Username:</span>
                <span className="font-medium">{data.username || "—"}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b">
                <span className="text-muted-foreground">Email:</span>
                <span className="font-medium">{email}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b">
                <span className="text-muted-foreground">Phone:</span>
                <span className="font-medium">{phone}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b">
                <span className="text-muted-foreground">Role:</span>
                <span className="capitalize font-semibold">{String(role)}</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-muted-foreground">Status:</span>
                <span
                  className={`capitalize font-semibold px-2 py-0.5 rounded text-xs ${
                    data.banned
                      ? "bg-red-500/20 text-red-600"
                      : "bg-green-500/20 text-green-600"
                  }`}
                >
                  {data.banned ? "Banned" : "Active"}
                </span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-4 pt-3 border-t">
              Joined on {new Date(data.createdAt).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>
        </div>

        {/* RIGHT */}
        <div className="w-full xl:w-2/3 space-y-6">
          {/* CHART CONTAINER */}
          <div className="bg-card border p-4 rounded-xl shadow-xs">
            <h1 className="text-base font-semibold">User Activity & Orders</h1>
            <AppLineChart />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SingleUserPage;
