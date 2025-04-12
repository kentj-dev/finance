import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useInitials } from '@/hooks/use-initials';
import { Auth, User } from '@/types';
import { Link, router } from '@inertiajs/react';
import { ExternalLink, Trash2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Checkbox } from '../ui/checkbox';
import { TableCell, TableRow } from '../ui/table';

interface UserListProps {
    user: User;
    auth: Auth;
    selectedUsers: User[];
    setSelectedUsers: (value: React.SetStateAction<User[]>) => void;
}

export function UserList({ user, auth, selectedUsers, setSelectedUsers }: UserListProps) {
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
        <TableRow className="font-[400]">
            <TableCell className="w-10 border-0 !p-0 !px-2 text-center align-middle">
                <Checkbox
                    id="select"
                    checked={selectedUsers.some((selectedUser) => selectedUser.id === user.id)}
                    onCheckedChange={(checked) => {
                        if (checked) {
                            setSelectedUsers((prev) => [...prev, user]);
                        } else {
                            setSelectedUsers((prev) => prev.filter((selectedUser) => selectedUser.id !== user.id));
                        }
                    }}
                />
            </TableCell>

            <TableCell className="align-middle">{user.id}</TableCell>

            <TableCell className="align-middle">
                <div className="flex items-center gap-2">
                    <Dialog>
                        <DialogTrigger asChild>
                            <Avatar className="cursor-pointer rounded-md">
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
                    <div>{user.name}</div>
                </div>
            </TableCell>

            <TableCell className="align-middle">{user.email}</TableCell>

            <TableCell className="align-middle">
                <div className="flex items-center gap-2">
                    <Link
                        href={route('dashboard.view-user', user.id)}
                        className="flex cursor-default items-center gap-2 rounded-lg bg-[#3b5998] px-3 py-1 text-white shadow-xs hover:bg-[#3b5998]/90"
                        prefetch
                    >
                        <ExternalLink size={14} />
                        View
                    </Link>
                    {auth.user.id !== user.id && (
                        <button
                            className="flex cursor-default items-center gap-2 rounded-lg bg-[#983b3b] px-3 py-1 text-white shadow-xs hover:bg-[#983b3b]/90"
                            onClick={() => deleteUser(user.id)}
                        >
                            <Trash2 size={14} />
                            Delete
                        </button>
                    )}
                </div>
            </TableCell>
        </TableRow>
    );
}
