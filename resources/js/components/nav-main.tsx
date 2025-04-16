import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { isRouteActive } from '@/lib/utils';
import { SharedData, type NavGroup } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';

export function NavMain({ items = [] }: { items: NavGroup[] }) {
    const { auth } = usePage<SharedData>().props;

    const accessibleModules = auth.modules ?? [];

    const isModuleAccessible = (moduleName: string) => {
        return accessibleModules.includes(moduleName);
    };

    const page = usePage();

    return items
        .filter(
            (group) => group.items.some((item) => isModuleAccessible(item.title)),
        )
        .map((items) => (
            <SidebarGroup key={items.title}>
                <SidebarGroupLabel>{items.title}</SidebarGroupLabel>
                <SidebarMenu>
                    {items.items
                    .filter((item) => isModuleAccessible(item.title))
                    .map((item) =>
                        item.subItems && item.subItems.length > 0 ? (
                            <Collapsible
                                key={item.title}
                                asChild
                                defaultOpen={item.href === page.url || item.subItems?.some((sub) => sub.href === page.url)}
                                className="group/collapsible"
                            >
                                <SidebarMenuItem>
                                    <CollapsibleTrigger asChild>
                                        <SidebarMenuButton tooltip={item.title} isActive={isRouteActive(page.url, item.href, item.routes)}>
                                            {item.icon && <item.icon />}
                                            <span>{item.title}</span>
                                            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                        </SidebarMenuButton>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent>
                                        <SidebarMenuSub>
                                            {item.subItems.map((subItem) => (
                                                <SidebarMenuSubItem key={subItem.title}>
                                                    <SidebarMenuSubButton asChild isActive={isRouteActive(page.url, subItem.href)}>
                                                        <Link href={subItem.href} prefetch>
                                                            <span>{subItem.title}</span>
                                                        </Link>
                                                    </SidebarMenuSubButton>
                                                </SidebarMenuSubItem>
                                            ))}
                                        </SidebarMenuSub>
                                    </CollapsibleContent>
                                </SidebarMenuItem>
                            </Collapsible>
                        ) : (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton tooltip={item.title} isActive={isRouteActive(page.url, item.href, item.routes)} asChild>
                                    <Link href={item.href} prefetch>
                                        {item.icon && <item.icon />}
                                        <span>{item.title}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ),
                    )}
                </SidebarMenu>
            </SidebarGroup>
        ));
}
