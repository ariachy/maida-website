export default function UsersPage() {
  return (
    <div>
      <h1 className="text-3xl font-serif text-[#2C2C2C] mb-2">User Management</h1>
      <p className="text-[#6B6B6B] mb-8">Manage admin users</p>
      
      <div className="bg-white rounded-lg shadow-sm border border-[#E5E5E5] p-8 text-center">
        <div className="w-16 h-16 bg-[#C4A484]/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-[#C4A484]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </div>
        <h2 className="text-xl font-medium text-[#2C2C2C] mb-2">Coming in Phase 3</h2>
        <p className="text-[#6B6B6B]">
          User management will be available here soon.
        </p>
      </div>
    </div>
  );
}
