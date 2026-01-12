import { getUsers } from "@/app/actions";

export default async function AdminUsersPage() {
    const users = await getUsers();

    return (
        <div className="flex flex-col space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">All Users</h1>
                <div className="text-sm text-muted-foreground">
                    Total: {users.length}
                </div>
            </div>

            <div className="border rounded-md">
                <table className="w-full text-sm text-left">
                    <thead className="text-muted-foreground bg-muted/50 border-b">
                        <tr>
                            <th className="px-4 py-3 font-medium">Email</th>
                            <th className="px-4 py-3 font-medium">Role</th>
                            <th className="px-4 py-3 font-medium">Clerk ID</th>
                            <th className="px-4 py-3 font-medium">Sites</th>
                            <th className="px-4 py-3 font-medium">Joined</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {users.map((user) => (
                            <tr key={user.id} className="hover:bg-muted/50 transition-colors">
                                <td className="px-4 py-3 font-medium">
                                    {user.email}
                                </td>
                                <td className="px-4 py-3">
                                    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${user.role === 'SUPER_ADMIN'
                                            ? 'border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80'
                                            : 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80'
                                        }`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                                    {user.clerkId}
                                </td>
                                <td className="px-4 py-3">
                                    <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
                                        {(user as any)._count?.sites || 0}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-muted-foreground text-xs">
                                    {new Date(user.createdAt).toLocaleDateString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
