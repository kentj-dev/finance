import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { NavGroup, type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { CircleUserRound, Code, CodeXml, LayoutGrid, Pi, SquareDashedMousePointer, UserRoundCog, UsersRound } from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: NavGroup[] = [
    {
        title: 'Platform',
        items: [
            {
                title: 'Dashboard',
                href: '/dashboard',
                icon: LayoutGrid,
            },
            {
                title: 'Programs',
                href: '#',
                icon: Pi,
                subItems: [
                    {
                        title: 'Programs 1',
                        href: '#',
                        icon: Pi,
                    },
                    {
                        title: 'Programs 2',
                        href: '#',
                        icon: Pi,
                    },
                ],
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
    {
        title: 'Role Management',
        items: [
            {
                title: 'Users',
                href: '/users',
                icon: UsersRound,
                routes: ['/users', '/view'],
            },
            {
                title: 'Roles',
                href: '/roles',
                icon: UserRoundCog,
            },
            {
                title: 'Modules',
                href: '/modules',
                icon: SquareDashedMousePointer,
            },
        ],
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Client Dashboard',
        href: '/',
        icon: CircleUserRound,
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
