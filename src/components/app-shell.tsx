'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart2,
  BookText,
  Calendar,
  Compass,
  FileCheck2,
  FileText,
  PanelLeft,
  User,
  ChevronDown
} from 'lucide-react';
import { useApp } from '@/components/app-provider';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarInset,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import type { UserRole } from '@/lib/types';

const navItems = [
  { href: '/dashboard', icon: BarChart2, label: 'Dashboard' },
  { href: '/blueprint', icon: Compass, label: 'Blueprint' },
  { href: '/drafts', icon: FileText, label: 'Drafts' },
  { href: '/approvals', icon: FileCheck2, label: 'Approvals', roles: ['Approver', 'Admin'] },
  { href: '/calendar', icon: Calendar, label: 'Calendar' },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { role } = useApp();

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="py-6">
          <Link href="/dashboard" className="block">
            <Icons.Logo />
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navItems.map(item =>
              !item.roles || item.roles.includes(role) ? (
                <SidebarMenuItem key={item.href}>
                  <Link href={item.href}>
                    <SidebarMenuButton
                      isActive={pathname === item.href}
                      tooltip={{ children: item.label }}
                    >
                      <item.icon />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              ) : null
            )}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <RoleSwitcher />
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <main className="min-h-screen">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

function RoleSwitcher() {
  const { role, setRole } = useApp();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="w-full justify-between group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:w-auto group-data-[collapsible=icon]:h-10 group-data-[collapsible=icon]:aspect-square">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="group-data-[collapsible=icon]:hidden">{role}</span>
          </div>
          <ChevronDown className="h-4 w-4 group-data-[collapsible=icon]:hidden" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel>Switch Role</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {(['Contributor', 'Approver', 'Admin'] as UserRole[]).map(r => (
          <DropdownMenuItem key={r} onClick={() => setRole(r)} className={cn(r === role && 'bg-accent')}>
            {r}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
