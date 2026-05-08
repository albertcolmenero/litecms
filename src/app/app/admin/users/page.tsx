import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatPill } from "@/components/dashboard/StatPill";
import { getUsers } from "@/app/actions";

export default async function AdminUsersPage() {
  const users = await getUsers();

  return (
    <>
      <PageHeader
        title="All users"
        description={`${users.length} user${users.length === 1 ? "" : "s"} across the platform.`}
      />
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-5 py-2.5 font-medium">Email</th>
              <th className="px-5 py-2.5 font-medium">Role</th>
              <th className="px-5 py-2.5 font-medium">Sites</th>
              <th className="px-5 py-2.5 font-medium">Clerk ID</th>
              <th className="px-5 py-2.5 font-medium">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-5 py-3 font-medium">{user.email}</td>
                <td className="px-5 py-3">
                  <StatPill tone={user.role === "SUPER_ADMIN" ? "info" : "neutral"}>
                    {user.role}
                  </StatPill>
                </td>
                <td className="px-5 py-3">
                  <StatPill tone="neutral">{(user as any)._count?.sites ?? 0}</StatPill>
                </td>
                <td className="px-5 py-3 font-mono text-xs text-muted-foreground">{user.clerkId}</td>
                <td className="px-5 py-3 text-xs text-muted-foreground">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
