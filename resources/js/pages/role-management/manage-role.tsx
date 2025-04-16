import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { toast } from 'sonner';

type Role  = {
    id: string;
    name: string;
    description: string;
    created_at: string;
    updated_at: string;
    role_modules: {
        id: string;
        module_id: string;
    }[];
};

type Module = {
    id: string;
    name: string;
    description: string;
    created_at: string;
    updated_at: string;
};

interface RolePermissionsProps {
    role: Role;
    modules: Module[];
}

type ManageRoleForm = {
    name: string;
    description: string;
    roleId: string;
    modulesId: string[];
};

export default function RolePermissions({ role, modules }: RolePermissionsProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Roles',
            href: '/roles',
        },
        {
            title: role.name,
            href: `/roles/view/${role.id}`,
        },
    ];

    const handleToggle = (moduleId: string, checked: boolean) => {
        setData((prev) => {
            const modulesId = checked ? [...prev.modulesId, moduleId] : prev.modulesId.filter((id) => id !== moduleId);
            return { ...prev, modulesId };
        });
    };

    const { data, setData, post, processing, errors } = useForm<Required<ManageRoleForm>>({
        name: role.name,
        description: role.description,
        roleId: role.id,
        modulesId: role.role_modules.map((m) => m.module_id),
    });

    const handleSubmit = () => {
        const promise = new Promise<void>((resolve, reject) => {
            post(route('roles.update-permissions'), {
                preserveScroll: true,
                onSuccess: () => {
                    resolve();
                },
                onError: () => {
                    reject();
                },
            });
        });

        toast.promise(promise, {
            loading: 'Updating role permissions...',
            success: 'Role permissions updated successfully!',
            error: 'Failed to update role permissions!',
            duration: 5000,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Roles" />
            <div className="px-4 py-6">
                <div className="mb-8 flex flex-col space-y-0.5">
                    <input
                        type="text"
                        className="text-xl font-semibold tracking-tight focus:outline-none"
                        defaultValue={role.name}
                        onChange={(e) => setData('name', e.target.value)}
                        placeholder="Role Name"
                    />

                    <input
                        type="text"
                        className="text-muted-foreground text-sm focus:outline-none"
                        defaultValue={role.description}
                        onChange={(e) => setData('description', e.target.value)}
                        placeholder="Description"
                    />
                </div>
                <div className="flex flex-col gap-3">
                    {modules.map((module) => (
                        <div key={module.id} className="flex items-center gap-2 text-sm font-medium">
                            <Checkbox
                                id={module.id}
                                checked={data.modulesId.includes(module.id)}
                                onCheckedChange={(checked) => handleToggle(module.id, !!checked)}
                            />
                            <label
                                htmlFor={module.id}
                                className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                {module.name}
                            </label>
                        </div>
                    ))}
                    <div className="mt-4 flex items-center gap-2">
                        <Button
                            type="button"
                            className="rounded bg-black px-4 py-1 text-white hover:bg-gray-800"
                            onClick={handleSubmit}
                            disabled={processing}
                        >
                            Save Changes
                        </Button>
                    </div>
                    {errors.name && <span className="text-sm font-medium text-red-500">{errors.name}</span>}
                </div>
            </div>
        </AppLayout>
    );
}
