'use client';

import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {Megaphone, LifeBuoy, Mail, Shield, Handshake, Users, Crown, FileText, LayoutDashboard} from 'lucide-react';

import {cn} from '@/lib/utils';
import {SidebarMenu, SidebarMenuItem, SidebarMenuButton} from '@/components/ui/sidebar';
import {useEffect, useState} from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase/client-app';

const memberNavItems = [
  {href: '/', label: 'Dashboard', icon: LayoutDashboard},
  {href: '/services', label: 'Apply for Services', icon: Handshake},
  {href: '/support', label: 'AI Support', icon: LifeBuoy},
  {href: '/contact', label: 'Contact', icon: Mail},
];

const adminNavItems = [
  {href: '/admin', label: 'Dashboard', icon: LayoutDashboard},
  {href: '/admin/applications', label: 'Membership Applications', icon: Users},
  {href: '/admin/lifetime', label: 'Lifetime Requests', icon: Crown},
  {href: '/admin/services', label: 'Service Requests', icon: FileText},
  {href: '/support', label: 'AI Support', icon: LifeBuoy},
  {href: '/contact', label: 'Contact', icon: Mail},
];

export function MainNav() {
  const pathname = usePathname();
  const [navItems, setNavItems] = useState<(typeof memberNavItems | typeof adminNavItems)>([]);
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async user => {
      if (user) {
        try {
          const idTokenResult = await user.getIdTokenResult(true); // Force refresh
          const role = idTokenResult.claims.role;
          if (role === 'admin' || role === 'sub-admin') {
            setNavItems(adminNavItems);
          } else {
            setNavItems(memberNavItems);
          }
        } catch (error) {
          console.error("Error getting user token:", error);
          setNavItems([]);
        }
      } else {
        setNavItems([]);
      }
    });

    return () => unsubscribe();
  }, []);
  
  if (navItems.length === 0) {
    return null;
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <SidebarMenu className="p-2">
        {navItems.map(item => (
          <SidebarMenuItem key={item.href}>
            <SidebarMenuButton asChild isActive={pathname === item.href} tooltip={{children: item.label}}>
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
