import { useInitials } from '@/hooks/use-initials';
import { Auth, User } from '@/types';
import { Link, router } from '@inertiajs/react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';

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
            <div className="flex items-start gap-2">
                <Dialog>
                    <DialogTrigger asChild>
                        <Avatar className="size-12 cursor-pointer rounded-md">
                            {user.avatar && <AvatarImage src={`/storage/${user.avatar}`} alt={user.name} className="object-cover" />}
                            <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                        </Avatar>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>{user.name}</DialogTitle>
                            <DialogDescription>{user.email}</DialogDescription>
                        </DialogHeader>
                        <Avatar className="size-full rounded-md">
                            {user.avatar && <AvatarImage src={`/storage/${user.avatar}`} alt={user.name} className="object-cover" />}
                            <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                        </Avatar>
                    </DialogContent>
                </Dialog>
                <div>
                    <h2 className="text-lg font-semibold">{user.name}</h2>
                    <p className="text-gray-7500 text-xs">{user.email}</p>
                </div>
            </div>

            <p className="text-xs text-gray-500">{user.id}</p>
            <p className="flex items-center gap-2 text-sm">
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
