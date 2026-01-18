'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

interface SidebarProps {
  userName?: string | null;
}

const menuItems = [
  {
    label: 'Dashboard',
    href: '/admin/dashboard',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    label: 'Content',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    ),
    children: [
      { label: 'Homepage', href: '/admin/content/homepage' },
      { label: 'Menu', href: '/admin/content/menu' },
      { label: 'Story', href: '/admin/content/story' },
      { label: 'Contact', href: '/admin/content/contact' },
      { label: 'Maída Live', href: '/admin/content/maida-live' },
    ],
  },
  {
    label: 'Media',
    href: '/admin/media',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    label: 'Users',
    href: '/admin/users',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
  },
  {
    label: 'Settings',
    href: '/admin/settings',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

export default function AdminSidebar({ userName }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [expandedItems, setExpandedItems] = useState<string[]>(['Content']);
  const [loggingOut, setLoggingOut] = useState(false);

  const toggleExpanded = (label: string) => {
    setExpandedItems((prev) =>
      prev.includes(label)
        ? prev.filter((item) => item !== label)
        : [...prev, label]
    );
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch('/api/admin/auth/logout', { method: 'POST' });
      router.push('/admin');
    } catch (error) {
      console.error('Logout error:', error);
      setLoggingOut(false);
    }
  };

  const isActive = (href: string) => pathname === href;
  const isChildActive = (children: { href: string }[]) =>
    children.some((child) => pathname === child.href);

  return (
    <aside className="w-64 bg-[#2C2C2C] text-white min-h-screen flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-[#3C3C3C]">
        <Link href="/admin/dashboard" className="block">
          <h1 className="text-2xl font-serif">Maída</h1>
          <p className="text-xs text-[#9CA3AF] mt-1">Admin Panel</p>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.label}>
              {item.children ? (
                // Parent with children
                <div>
                  <button
                    onClick={() => toggleExpanded(item.label)}
                    className={`w-full flex items-center justify-between px-4 py-2.5 rounded-md transition-colors ${
                      isChildActive(item.children)
                        ? 'bg-[#C4A484] text-white'
                        : 'text-[#9CA3AF] hover:bg-[#3C3C3C] hover:text-white'
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      {item.icon}
                      {item.label}
                    </span>
                    <svg
                      className={`w-4 h-4 transition-transform ${
                        expandedItems.includes(item.label) ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {expandedItems.includes(item.label) && (
                    <ul className="mt-1 ml-4 pl-4 border-l border-[#3C3C3C] space-y-1">
                      {item.children.map((child) => (
                        <li key={child.href}>
                          <Link
                            href={child.href}
                            className={`block px-4 py-2 rounded-md transition-colors ${
                              isActive(child.href)
                                ? 'bg-[#C4A484]/20 text-[#C4A484]'
                                : 'text-[#9CA3AF] hover:bg-[#3C3C3C] hover:text-white'
                            }`}
                          >
                            {child.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : (
                // Single item
                <Link
                  href={item.href!}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-md transition-colors ${
                    isActive(item.href!)
                      ? 'bg-[#C4A484] text-white'
                      : 'text-[#9CA3AF] hover:bg-[#3C3C3C] hover:text-white'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* User & Logout */}
      <div className="p-4 border-t border-[#3C3C3C]">
        <div className="flex items-center gap-3 px-4 py-2 mb-2">
          <div className="w-8 h-8 bg-[#C4A484] rounded-full flex items-center justify-center text-sm font-medium">
            {userName?.charAt(0).toUpperCase() || 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{userName || 'Admin'}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-[#9CA3AF] hover:bg-[#3C3C3C] hover:text-white rounded-md transition-colors disabled:opacity-50"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          {loggingOut ? 'Signing out...' : 'Sign Out'}
        </button>
      </div>
    </aside>
  );
}
