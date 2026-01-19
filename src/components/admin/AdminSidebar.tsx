'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

interface MenuItem {
  href?: string;
  label: string;
  icon: React.ReactNode;
  children?: { href: string; label: string }[];
}

export default function AdminSidebar() {
  const pathname = usePathname();
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['Content']);

  const toggleMenu = (label: string) => {
    setExpandedMenus((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    );
  };

  const menuItems: MenuItem[] = [
    {
      href: '/admin/dashboard',
      label: 'Dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      label: 'Content',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      children: [
        { href: '/admin/content/menu', label: 'Menu' },
        { href: '/admin/content/homepage', label: 'Homepage' },
        { href: '/admin/content/story', label: 'Story' },
        { href: '/admin/content/contact', label: 'Contact' },
        { href: '/admin/content/maida-live', label: 'Maída Live' },
      ],
    },
    {
      href: '/admin/media',
      label: 'Media Library',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      href: '/admin/users',
      label: 'Users',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
    },
    {
      href: '/admin/settings',
      label: 'Settings',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
  ];

  const isActive = (href: string) => pathname === href;
  const isChildActive = (children?: { href: string }[]) =>
    children?.some((child) => pathname === child.href);

  return (
    <aside className="w-64 bg-white border-r border-[#E5E5E5] min-h-screen flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-[#E5E5E5]">
        <Link href="/admin/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#C4A484] rounded-lg flex items-center justify-center">
            <span className="text-white font-serif text-xl">M</span>
          </div>
          <div>
            <span className="font-serif text-lg text-[#2C2C2C]">Maída</span>
            <span className="text-xs text-[#9CA3AF] block">Admin Panel</span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.label}>
              {item.href ? (
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                    isActive(item.href)
                      ? 'bg-[#C4A484]/10 text-[#C4A484]'
                      : 'text-[#6B6B6B] hover:bg-[#F5F1EB] hover:text-[#2C2C2C]'
                  }`}
                >
                  {item.icon}
                  <span className="font-medium">{item.label}</span>
                </Link>
              ) : (
                <>
                  <button
                    onClick={() => toggleMenu(item.label)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                      isChildActive(item.children)
                        ? 'bg-[#C4A484]/10 text-[#C4A484]'
                        : 'text-[#6B6B6B] hover:bg-[#F5F1EB] hover:text-[#2C2C2C]'
                    }`}
                  >
                    {item.icon}
                    <span className="font-medium flex-1 text-left">{item.label}</span>
                    <svg
                      className={`w-4 h-4 transition-transform ${
                        expandedMenus.includes(item.label) ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {expandedMenus.includes(item.label) && item.children && (
                    <ul className="mt-1 ml-4 pl-4 border-l border-[#E5E5E5] space-y-1">
                      {item.children.map((child) => (
                        <li key={child.href}>
                          <Link
                            href={child.href}
                            className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                              isActive(child.href)
                                ? 'bg-[#C4A484]/10 text-[#C4A484] font-medium'
                                : 'text-[#6B6B6B] hover:bg-[#F5F1EB] hover:text-[#2C2C2C]'
                            }`}
                          >
                            {child.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-[#E5E5E5]">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-2 px-3 py-2 text-sm text-[#6B6B6B] hover:text-[#C4A484] transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          View Site
        </Link>
      </div>
    </aside>
  );
}
