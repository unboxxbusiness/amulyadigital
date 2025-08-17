
'use client';

import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {LifeBuoy, Mail, Users, Crown, FileText, LayoutDashboard, UserPlus, Handshake, Settings, Inbox, Trash2, Tags} from 'lucide-react';

import {SidebarMenu, SidebarMenuItem, SidebarMenuButton} from '@/components/ui/sidebar';
import {useEffect, useState} from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase/client-app';
import { signOut } from '@/app/(auth)/actions';

const memberNavItems = [
  {href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard},
  {href: '/offers', label: 'Offers', icon: Tags},
  {href: '/services', label: 'Apply for Services', icon: Handshake},
  {href: '/support', label: 'AI Chat', icon: LifeBuoy},
  {href: '/contact', label: 'Contact', icon: Mail},
  {href: '/settings', label: 'Settings', icon: Settings},
];

const adminNavItems = [
  {href: '/admin', label: 'Dashboard', icon: LayoutDashboard},
  {href: '/admin/inbox', label: 'Inbox', icon: Inbox},
  {href: '/admin/management', label: 'Admin Management', icon: UserPlus, adminOnly: true },
  {href: '/admin/applications', label: 'Membership Applications', icon: Users},
  {href: '/admin/lifetime', label: 'Lifetime Requests', icon: Crown},
  {href: '/admin/offers', label: 'Manage Offers', icon: Tags},
  {href: '/admin/services', label: 'Service Requests', icon: FileText},
  {href: '/admin/cleanup', label: 'Data Cleanup', icon: Trash2, adminOnly: true },
  {href: '/admin/settings', label: 'Settings', icon: Settings},
];

type NavItem = {
  href: string;
  label: string;
  icon: React.ElementType;
  adminOnly?: boolean;
}

export function MainNav() {
  const pathname = usePathname();
  const [navItems, setNavItems] = useState<NavItem[]>([]);
  const [userRole, setUserRole] = useState<string | null>(null);
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async user => {
      if (user) {
        try {
          const idTokenResult = await user.getIdTokenResult(true); // Force refresh
          const role = idTokenResult.claims.role as string;
          setUserRole(role);
          if (role === 'admin' || role === 'sub-admin') {
            setNavItems(adminNavItems);
          } else {
            setNavItems(memberNavItems);
          }
        } catch (error: any) {
          if (error.code === 'auth/user-token-expired') {
            await signOut();
          }
          setNavItems([]);
          setUserRole(null);
        }
      } else {
        setNavItems([]);
        setUserRole(null);
      }
    });

    return () => unsubscribe();
  }, []);
  
  if (navItems.length === 0) {
    return null;
  }

  const isNavItemVisible = (item: NavItem) => {
    if (item.adminOnly) {
      return userRole === 'admin';
    }
    return true;
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <SidebarMenu className="p-2">
        {navItems.filter(isNavItemVisible).map(item => (
          <SidebarMenuItem key={item.href}>
            <SidebarMenuButton asChild isActive={pathname.startsWith(item.href) && (item.href !== '/' || pathname === '/')} tooltip={{children: item.label}}>
              <Link href={item.href}>
                <item.icon />
                <span>{item.label}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </div>
  );
}
