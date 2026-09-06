export const dynamic = "force-dynamic";

import { auth, clerkClient, type User } from "@clerk/nextjs/server";
import { columns } from "./columns";
import { DataTable } from "./data-table";

const getData = async (): Promise<{ data: User[]; totalCount: number }> => {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { data: [], totalCount: 0 };
    }

    const client = await clerkClient();
    const response = await client.users.getUserList({
      limit: 100,
    });

    const totalCount = response.totalCount ?? response.data.length;

    return {
      data: JSON.parse(JSON.stringify(response.data)),
      totalCount,
    };
  } catch (err) {
    console.error("Error fetching Clerk users for users page:", err);
    return { data: [], totalCount: 0 };
  }
};

const UsersPage = async () => {
  const res = await getData();
  return (
    <div className="py-4 space-y-6">
      <div className="flex items-center justify-between px-4 py-3 bg-card border rounded-lg shadow-xs">
        <div>
          <h1 className="font-semibold text-lg">User Accounts</h1>
          <p className="text-xs text-muted-foreground">
            Manage registered users, administrators, and customer permissions
          </p>
        </div>
        <div className="text-sm font-medium text-muted-foreground">
          Total Users:{" "}
          <span className="text-foreground font-bold">{res.totalCount}</span>
        </div>
      </div>
      <DataTable columns={columns} data={res.data} />
    </div>
  );
};

export default UsersPage;
