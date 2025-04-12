import { useInitials } from '@/hooks/use-initials';
import { Auth, User } from '@/types';
import { Link, router } from '@inertiajs/react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

export function UserList({ user, auth }: { user: User; auth: Auth }) {
    const getInitials = useInitials();

    const deleteUser = (userId: number) => {
        if (confirm('Are you sure you want to delete this user?')) {
            router.delete(route('dashboard.delete-user', userId), {
                preserveScroll: true,
                onSuccess: () => {
                    alert('User deleted successfully!');
                },
                onError: (errors) => {
                    alert('Failed to delete user.' + errors.message);
                },
            });
        }
    };

    return (
        <div key={user.id} className="rounded-md border p-4">
            <div className="flex items-center gap-2">
                <Avatar>
                    <AvatarImage src={`/storage/${user.avatar}`} alt={user.name} />
                    <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                </Avatar>
                <h2 className="text-lg font-semibold">{user.name}</h2>
            </div>
            <p className="text-gray-7500 text-xs">{user.email}</p>
            <p className="text-xs text-gray-500">{user.id}</p>
            <p className="flex items-center gap-2 text-xs">
                <Link href={route('dashboard.view-user', user.id)} className="text-blue-600 hover:underline">
                    View
                </Link>
                {auth.user.id !== user.id && (
                    <button className="text-red-600 hover:underline" onClick={() => deleteUser(user.id)}>
                        Delete
                    </button>
                )}
            </p>
        </div>
    );
}
