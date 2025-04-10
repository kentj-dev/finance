import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { NavGroup, type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { BookOpen, Code, CodeXml, Folder, LayoutGrid, Pi } from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: NavGroup[] = [
    {
        title: 'Platform',
        items: [
            {
                title: 'Dashboard',
                href: '/dashboard',
                icon: LayoutGrid,
                routes: [
                    '/dashboard',
                    '/view-user',
                ]
            },
            {
                title: 'Programs',
                href: '#',
                icon: Pi,
                subItems: [
                    {
                        title: 'Programs 1',
                        href: '/settings/profile',
                        icon: Pi,
                    },
                    {
                        title: 'Programs 2',
                        href: '#',
                        icon: Pi,
                    },
                ]
            },
        ],
    },
    {
        title: 'Example 2',
        items: [
            {
                title: 'Route 1',
                href: '#',
                icon: Code,
            },
            {
                title: 'Route 2',
                href: '#',
                icon: CodeXml,
            },
        ],
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: Folder,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits',
        icon: BookOpen,
    },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
