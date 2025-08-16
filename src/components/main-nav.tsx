'use client'

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Megaphone, User, FileText, LifeBuoy, Mail, Shield } from 'lucide-react';

import { cn } from '@/lib/utils';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';

const navItems = [
  { href: '/', label: 'Dashboard', icon: Megaphone },
  { href: '/profile', label: 'Profile', icon: User },
  { href: '/application', label: 'Application', icon: FileText },
  { href: '/support', label: 'AI Support', icon: LifeBuoy },
  { href: '/contact', label: 'Contact', icon: Mail },
  { href: '/admin', label: 'Admin', icon: Shield },
];

export function MainNav() {
  const pathname = usePathname();

  return (
    <div className="flex-1 overflow-y-auto">
      <SidebarMenu className="p-2">
        {navItems.map((item) => (
          <SidebarMenuItem key={item.href}>
            <Link href={item.href} passHref legacyBehavior>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
                tooltip={{ children: item.label }}
              >
                <a>
                  <item.icon />
                  <span>{item.label}</span>
                </a>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </div>
  );
}
