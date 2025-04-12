import { InertiaPaginate } from '@/components//helpers/InertiaPaginate';
import { UserList } from '@/components/dashboard/user';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import AppLayout from '@/layouts/app-layout';
import { SharedData, User, type BreadcrumbItem } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { CheckedState } from '@radix-ui/react-checkbox';
import { ArrowDownZA, ArrowUpAZ, LoaderCircle, Plus } from 'lucide-react';
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
        sort: string | null;
        direction: 'asc' | 'desc';
    };
    allUsersCount: number;
}

type RegisterForm = {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
};

const tableHeaders = [
    { key: 'id', label: '#' },
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
];

export default function Dashboard({ users, filters, allUsersCount }: DashboardProps) {
    const { auth } = usePage<SharedData>().props;

    const [open, setOpen] = useState(false);
    const [searchParam, setSearchParam] = useState(filters.search || '');
    const [selectedFilters, setSelectedFilters] = useState<string[]>(filters.filters || []);
    const [selectedSort, setSelectedSort] = useState<string | null>(filters.sort || null);
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(filters.direction || 'asc');
    const [selectedUsers, setSelectedUsers] = useState<User[]>([]);

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
            const currentSort = url.searchParams.get('sort') || '';
            const currentDirection = url.searchParams.get('direction') || 'asc';

            const filtersStr = selectedFilters.join(',');

            if (
                searchParam.trim() !== currentSearch ||
                filtersStr !== currentFilters ||
                selectedSort !== currentSort ||
                sortDirection !== currentDirection
            ) {
                const query: Record<string, string | number | undefined> = {
                    page: 1,
                };

                if (searchParam.trim()) {
                    query.search = searchParam.trim();
                }

                if (filtersStr) {
                    query.filters = filtersStr;
                }

                if (selectedSort && sortDirection) {
                    query.sortBy = selectedSort;
                }

                if (selectedSort && sortDirection) {
                    query.sortDirection = sortDirection;
                }

                router.get(route('dashboard'), query, {
                    preserveState: true,
                    replace: true,
                });
            }
        }, 250);

        return () => clearTimeout(delayDebounce);
    }, [searchParam, selectedFilters, selectedSort, sortDirection]);

    const allSelected = allUsersCount > 0 && selectedUsers.length === allUsersCount;
    const partiallySelected = selectedUsers.length > 0 && selectedUsers.length < allUsersCount;

    const handleSelectAll = (checked: boolean | string) => {
        if (checked) {
            setSelectedUsers(users.data);
        } else {
            setSelectedUsers([]);
        }
    };

    const getCheckedState = (): CheckedState => {
        if (allSelected) return true;
        if (partiallySelected) return 'indeterminate';
        return false;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex flex-col gap-2 p-4">
                <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
                    <Input
                        autoComplete="off"
                        type="text"
                        name="search"
                        placeholder="Search user (start with ! to exclude e.g. !john)"
                        className="w-full rounded-md border px-2 py-2 text-sm focus:outline-none sm:w-86"
                        value={searchParam}
                        onChange={(e) => setSearchParam(e.target.value)}
                    />
                    <div className="flex w-full items-center justify-between gap-3 sm:w-max">
                        <Dialog open={open} onOpenChange={setOpen}>
                            <DialogTrigger asChild>
                                <Button variant="success" className="w-max rounded-lg bg-[#050708]">
                                    <Plus />
                                    Add User
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
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

                        <div className="flex flex-1 flex-row items-start gap-2 sm:items-center">
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
                </div>

                <div className="overflow-hidden rounded-lg border">
                    <Table className="table-auto border-separate border-spacing-0">
                        <TableHeader className="bg-gray-100">
                            <TableRow>
                                <TableHead className="w-10 !p-0 !px-2 text-center">
                                    <Checkbox id="select-all" checked={getCheckedState()} onCheckedChange={handleSelectAll} />
                                </TableHead>
                                {tableHeaders.map(({ key, label }) => (
                                    <TableHead
                                        key={key}
                                        className="cursor-pointer select-none"
                                        onClick={() => {
                                            setSelectedSort(key);
                                            setSortDirection((prev) => (selectedSort === key ? (prev === 'asc' ? 'desc' : 'asc') : 'asc'));
                                        }}
                                    >
                                        <div className="flex items-center gap-1">
                                            <TooltipProvider delayDuration={720}>
                                                <Tooltip delayDuration={720}>
                                                    <TooltipTrigger className="cursor-pointer" >{label}</TooltipTrigger>
                                                    <TooltipContent showArrow={false}>
                                                        <p>Click to Sort</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>

                                            {selectedSort === key &&
                                                (sortDirection === 'asc' ? (
                                                    <ArrowUpAZ className="ml-2 h-4 w-4 text-gray-400" />
                                                ) : (
                                                    <ArrowDownZA className="ml-2 h-4 w-4 text-gray-400" />
                                                ))}
                                        </div>
                                    </TableHead>
                                ))}
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.data.length > 0 ? (
                                users.data.map((user) => (
                                    <UserList
                                        user={user}
                                        auth={auth}
                                        selectedUsers={selectedUsers}
                                        setSelectedUsers={setSelectedUsers}
                                        key={user.id}
                                    />
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-start">
                                        No users found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
                <div className="mt-4 flex justify-center gap-2 sm:justify-start">
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

                <pre>{JSON.stringify(selectedUsers, null, 2)}</pre>
            </div>
        </AppLayout>
    );
}
