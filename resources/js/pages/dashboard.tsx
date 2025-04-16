import Heading from '@/components/heading';
import AppLayout from '@/layouts/app-layout';
import { Module, type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

interface DashboardProps {
    module: Module;
}

export default function Dashboard({ module }: DashboardProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={module.name} />
            <div className="px-4 py-6">
                <Heading title={module.name} description={module.description} />
            </div>
        </AppLayout>
    );
}
