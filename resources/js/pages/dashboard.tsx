import { InertiaPaginate } from '@/components//helpers/InertiaPaginate';
import { UserList } from '@/components/dashboard/user';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { SharedData, User, type BreadcrumbItem } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { LoaderCircle, Plus } from 'lucide-react';
import { FormEventHandler, useEffect, useState } from 'react';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

interface DashboardProps {
    users: {
        data: User[];
        current_page: number;
        last_page: number;
        links: {
            url: string | null;
            label: string;
            active: boolean;
        }[];
    };
    filters: {
        search: string;
        filters: string[];
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
    const [selectedFilters, setSelectedFilters] = useState<string[]>(filters.filters || []);

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

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            const url = new URL(window.location.href);
            const currentSearch = url.searchParams.get('search') || '';
            const currentFilters = url.searchParams.get('filters') || '';

            const filtersStr = selectedFilters.join(',');

            if (searchParam.trim() !== currentSearch || filtersStr !== currentFilters) {
                const query: Record<string, string | number | undefined> = {
                    page: 1,
                };

                if (searchParam.trim()) {
                    query.search = searchParam.trim();
                }

                if (filtersStr) {
                    query.filters = filtersStr;
                }

                router.get(route('dashboard'), query, {
                    preserveState: true,
                    replace: true,
                });
            }
        }, 250);

        return () => clearTimeout(delayDebounce);
    }, [searchParam, selectedFilters]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex flex-col gap-2 p-4">
                <div className="flex items-center gap-2">
                    <input
                        autoComplete="off"
                        type="text"
                        name="search"
                        placeholder="Search user"
                        className="rounded-md border px-2 py-2 text-sm focus:outline-none"
                        value={searchParam}
                        onChange={(e) => setSearchParam(e.target.value)}
                    />
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button variant="success">
                                <Plus />
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

                    <div className="flex items-center gap-2">
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="verified"
                                value="verified"
                                checked={selectedFilters.includes('verified')}
                                onCheckedChange={(e) => {
                                    setSelectedFilters((prev) => (e ? [...prev, 'verified'] : prev.filter((v) => v !== 'verified')));
                                }}
                            />
                            <label
                                htmlFor="verified"
                                className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                Verified
                            </label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="active"
                                value="active"
                                checked={selectedFilters.includes('active')}
                                onCheckedChange={(e) => {
                                    setSelectedFilters((prev) => (e ? [...prev, 'active'] : prev.filter((v) => v !== 'active')));
                                }}
                            />
                            <label
                                htmlFor="active"
                                className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                Active
                            </label>
                        </div>
                    </div>
                </div>
                {users.data.length > 0 ? (
                    <div className="grid gap-2">
                        {users.data.map((user) => (
                            <UserList user={user} auth={auth} key={user.id} />
                        ))}

                        <div className="mt-4 flex gap-2">
                            <InertiaPaginate
                                currentPage={users.current_page}
                                lastPage={users.last_page}
                                baseRoute="dashboard"
                                query={{
                                    search: searchParam,
                                    filters: selectedFilters.length ? selectedFilters.join(',') : undefined,
                                }}
                            />
                        </div>
                    </div>
                ) : (
                    <p className='text-gray-500 text-sm'>No users found.</p>
                )}
            </div>
        </AppLayout>
    );
}
