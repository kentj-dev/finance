import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { SharedData, User, type BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler, useEffect, useState } from 'react';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

interface DashboardProps {
    users: User[];
    filters: {
        search: string;
    };
}

type RegisterForm = {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
};

export default function Dashboard({ users, filters }: DashboardProps) {
    const { auth } = usePage<SharedData>().props;

    const [open, setOpen] = useState(false);
    const [searchParam, setSearchParam] = useState(filters.search || '');

    const { data, setData, post, processing, errors, reset } = useForm<Required<RegisterForm>>({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        const promise = new Promise<void>((resolve, reject) => {
            post(route('dashboard.register-user'), {
                preserveScroll: true,
                onSuccess: () => {
                    reset();
                    setOpen(false);
                    resolve();
                },
                onError: () => {
                    reject();
                },
            });
        });

        toast.promise(promise, {
            loading: 'Creating user...',
            success: 'User created!',
            error: 'Failed to create user.',
            duration: 5000,
        });
    };

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

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            const query = searchParam.trim() ? { search: searchParam } : {};

            router.get('dashboard', query, {
                preserveState: true,
                replace: true,
            });
        }, 300);

        return () => clearTimeout(delayDebounce);
    }, [searchParam]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="p-4">
                <input
                    type="text"
                    placeholder="Search user"
                    className="mb-2 rounded-lg border px-2 py-2 text-sm focus:outline-none"
                    value={searchParam}
                    onChange={(e) => setSearchParam(e.target.value)}
                />
                {users.length > 0 ? (
                    <div className="grid gap-2">
                        {users.map((user) => (
                            <div key={user.id} className="rounded-md border p-4">
                                <h2 className="text-lg font-semibold">{user.name}</h2>
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
                        ))}
                    </div>
                ) : (
                    <p>No users found.</p>
                )}
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline" className="mt-2">
                            Add User
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Add User</DialogTitle>
                            <DialogDescription>Fill out the form below to create a new user account.</DialogDescription>
                        </DialogHeader>
                        <form className="flex flex-col gap-6" onSubmit={submit}>
                            <div className="grid gap-6">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Name</Label>
                                    <Input
                                        id="name"
                                        type="text"
                                        required
                                        autoFocus
                                        tabIndex={1}
                                        autoComplete="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        disabled={processing}
                                        placeholder="Full name"
                                    />
                                    <InputError message={errors.name} className="mt-2" />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email address</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        required
                                        tabIndex={2}
                                        autoComplete="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        disabled={processing}
                                        placeholder="email@example.com"
                                    />
                                    <InputError message={errors.email} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="password">Password</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        required
                                        tabIndex={3}
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        disabled={processing}
                                        placeholder="Password"
                                    />
                                    <InputError message={errors.password} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="password_confirmation">Confirm password</Label>
                                    <Input
                                        id="password_confirmation"
                                        type="password"
                                        required
                                        tabIndex={4}
                                        value={data.password_confirmation}
                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                        disabled={processing}
                                        placeholder="Confirm password"
                                    />
                                    <InputError message={errors.password_confirmation} />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit" className="mt-2 w-full" tabIndex={5} disabled={processing}>
                                    {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                                    Create account
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
