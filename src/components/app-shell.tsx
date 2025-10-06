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
  ChevronDown,
  LogOut,
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
import { useFirebase } from '@/firebase';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { signOut } from 'firebase/auth';

const navItems = [
  { href: '/dashboard', icon: BarChart2, label: 'Dashboard' },
  { href: '/blueprint', icon: Compass, label: 'Blueprint' },
  { href: '/drafts', icon: FileText, label: 'Drafts' },
  { href: '/approvals', icon: FileCheck2, label: 'Approvals', roles: ['Approver', 'Admin'] },
  { href: '/calendar', icon: Calendar, label: 'Calendar' },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { userData } = useApp();

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <Link href="/dashboard" className="block">
            <Icons.Logo />
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navItems.map(item =>
              !item.roles || (userData?.role && item.roles.includes(userData.role)) ? (
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
          <UserMenu />
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

function UserMenu() {
  const { auth, user } = useFirebase();
  const { userData, setUserData } = useApp();

  const handleSignOut = async () => {
    if (auth) {
      await signOut(auth);
    }
  };

  const handleSetRole = (role: UserRole) => {
    if (userData) {
      setUserData({ ...userData, role });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="w-full justify-between group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:w-auto group-data-[collapsible=icon]:h-10 group-data-[collapsible=icon]:aspect-square">
           <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
                <AvatarImage src={user?.photoURL || ''} alt={user?.displayName || ''} />
                <AvatarFallback>{user?.displayName?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-start group-data-[collapsible=icon]:hidden">
                <span className="text-xs font-medium">{user?.displayName}</span>
                <span className="text-xs text-muted-foreground">{userData?.role}</span>
            </div>
          </div>
          <ChevronDown className="h-4 w-4 group-data-[collapsible=icon]:hidden" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="font-normal">Switch Role</DropdownMenuLabel>
        {(['Contributor', 'Approver', 'Admin'] as UserRole[]).map(r => (
          <DropdownMenuItem key={r} onClick={() => handleSetRole(r)} className={cn(r === userData?.role && 'bg-accent')}>
            {r}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
