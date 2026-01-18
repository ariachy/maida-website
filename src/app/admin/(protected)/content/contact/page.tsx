export default function ContentContactPage() {
  return (
    <div>
      <h1 className="text-3xl font-serif text-[#2C2C2C] mb-2">Contact Page Content</h1>
      <p className="text-[#6B6B6B] mb-8">Edit contact information and form labels in English and Portuguese</p>
      
      <div className="bg-white rounded-lg shadow-sm border border-[#E5E5E5] p-8 text-center">
        <div className="w-16 h-16 bg-[#C4A484]/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-[#C4A484]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h2 className="text-xl font-medium text-[#2C2C2C] mb-2">Coming in Phase 2</h2>
        <p className="text-[#6B6B6B]">
          Contact page editors will be available here soon.
        </p>
      </div>
    </div>
  );
}
