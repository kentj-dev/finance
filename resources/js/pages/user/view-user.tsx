import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { User, type BreadcrumbItem } from '@/types';
import { Transition } from '@headlessui/react';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

interface ViewUserProps {
    user: User;
    test: string;
    all_users: User[];
    filters: {
        search: string;
    };
}

const ViewUser: React.FC<ViewUserProps> = ({ user }) => {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: '/dashboard',
        },
        {
            title: `User #${user.name}`,
            href: `/view-user/${user.id}`,
        },
    ];

    const { data, setData, errors, put, processing, recentlySuccessful } = useForm({
        name: user.name,
        email: user.email,
    });

    const updateUser: FormEventHandler = (e) => {
        e.preventDefault();

        put(route('dashboard.update-user', user.id), {
            preserveScroll: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="View User" />
            <div className="px-4 py-6">
                <Heading title="View User" description={`User #${user.name}`} />
                <div className="flex h-full flex-1 flex-col gap-4 rounded-xl">
                    <form onSubmit={updateUser}>
                        <Input
                            type="text"
                            name="name"
                            value={data.name}
                            placeholder="Name"
                            className="mb-4"
                            required
                            onChange={(e) => setData('name', e.target.value)}
                        />
                        <InputError message={errors.name} />
                        <Input
                            type="email"
                            name="email"
                            value={data.email}
                            placeholder="Email"
                            className="mb-4"
                            required
                            onChange={(e) => setData('email', e.target.value)}
                        />
                        <InputError message={errors.email} />
                        <div className="flex items-center gap-2">
                            <button
                                type="submit"
                                className="rounded-lg bg-blue-500 px-4 py-2 font-medium text-white inset-shadow-sm inset-shadow-blue-400 disabled:bg-blue-600"
                                disabled={processing}
                            >
                                Update User
                            </button>
                            <Transition
                                show={recentlySuccessful}
                                enter="transition ease-in-out"
                                enterFrom="opacity-0"
                                leave="transition ease-in-out"
                                leaveTo="opacity-0"
                            >
                                <p className="text-sm text-neutral-600">Saved</p>
                            </Transition>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
};

export default ViewUser;
