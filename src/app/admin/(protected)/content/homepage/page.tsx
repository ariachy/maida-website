export default function ContentHomepagePage() {
  return (
    <div>
      <h1 className="text-3xl font-serif text-[#2C2C2C] mb-2">Homepage Content</h1>
      <p className="text-[#6B6B6B] mb-8">Edit homepage sections in English and Portuguese</p>
      
      <div className="bg-white rounded-lg shadow-sm border border-[#E5E5E5] p-8 text-center">
        <div className="w-16 h-16 bg-[#C4A484]/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-[#C4A484]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <h2 className="text-xl font-medium text-[#2C2C2C] mb-2">Coming in Phase 2</h2>
        <p className="text-[#6B6B6B]">
          Content editors will be available here soon.
        </p>
      </div>
    </div>
  );
}
