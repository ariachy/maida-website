import { validateSession } from '@/lib/auth';
import Link from 'next/link';

export default async function DashboardPage() {
  const session = await validateSession();
  const user = session.user;

  // Quick action cards
  const quickActions = [
    {
      title: 'Edit Homepage',
      description: 'Update hero, story preview, and featured items',
      href: '/admin/content/homepage',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      title: 'Edit Menu',
      description: 'Update menu items, descriptions, and categories',
      href: '/admin/content/menu',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
    },
    {
      title: 'Manage Media',
      description: 'Upload and organize images',
      href: '/admin/media',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      title: 'Manage Users',
      description: 'Add or remove admin users',
      href: '/admin/users',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
    },
  ];

  // Content sections for quick editing
  const contentSections = [
    { name: 'Homepage', href: '/admin/content/homepage', status: 'ready' },
    { name: 'Menu Items', href: '/admin/content/menu', status: 'ready' },
    { name: 'Story Page', href: '/admin/content/story', status: 'ready' },
    { name: 'Contact Page', href: '/admin/content/contact', status: 'ready' },
    { name: 'Maída Live', href: '/admin/content/maida-live', status: 'ready' },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-serif text-[#2C2C2C]">
          Welcome back, {user?.name || user?.email?.split('@')[0]}
        </h1>
        <p className="text-[#6B6B6B] mt-1">
          Manage your restaurant&apos;s website content
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {quickActions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow border border-[#E5E5E5] group"
          >
            <div className="w-12 h-12 bg-[#C4A484]/10 rounded-lg flex items-center justify-center text-[#C4A484] mb-4 group-hover:bg-[#C4A484] group-hover:text-white transition-colors">
              {action.icon}
            </div>
            <h3 className="font-medium text-[#2C2C2C] mb-1">{action.title}</h3>
            <p className="text-sm text-[#6B6B6B]">{action.description}</p>
          </Link>
        ))}
      </div>

      {/* Content Sections */}
      <div className="bg-white rounded-lg shadow-sm border border-[#E5E5E5]">
        <div className="p-6 border-b border-[#E5E5E5]">
          <h2 className="text-lg font-medium text-[#2C2C2C]">Content Sections</h2>
          <p className="text-sm text-[#6B6B6B] mt-1">
            Edit content for each section of your website
          </p>
        </div>
        <div className="divide-y divide-[#E5E5E5]">
          {contentSections.map((section) => (
            <Link
              key={section.href}
              href={section.href}
              className="flex items-center justify-between p-4 hover:bg-[#F9F9F9] transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="font-medium text-[#2C2C2C]">{section.name}</span>
                <span className="px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded-full">
                  {section.status}
                </span>
              </div>
              <svg
                className="w-5 h-5 text-[#9CA3AF]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ))}
        </div>
      </div>

      {/* Languages Info */}
      <div className="mt-8 bg-white rounded-lg shadow-sm border border-[#E5E5E5] p-6">
        <h2 className="text-lg font-medium text-[#2C2C2C] mb-4">Languages</h2>
        <div className="flex gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-[#F5F1EB] rounded-lg">
            <span className="text-lg">🇬🇧</span>
            <span className="font-medium text-[#2C2C2C]">English</span>
            <span className="text-xs text-[#6B6B6B]">(Default)</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-[#F5F1EB] rounded-lg">
            <span className="text-lg">🇵🇹</span>
            <span className="font-medium text-[#2C2C2C]">Portuguese</span>
          </div>
        </div>
        <p className="text-sm text-[#6B6B6B] mt-4">
          Edit content in both languages using the language tabs in each editor.
        </p>
      </div>
    </div>
  );
}
