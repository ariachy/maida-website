export default function ContentMaidaLivePage() {
  return (
    <div>
      <h1 className="text-3xl font-serif text-[#2C2C2C] mb-2">Maída Live Content</h1>
      <p className="text-[#6B6B6B] mb-8">Edit events and music schedule in English and Portuguese</p>
      
      <div className="bg-white rounded-lg shadow-sm border border-[#E5E5E5] p-8 text-center">
        <div className="w-16 h-16 bg-[#C4A484]/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-[#C4A484]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
          </svg>
        </div>
        <h2 className="text-xl font-medium text-[#2C2C2C] mb-2">Coming in Phase 2</h2>
        <p className="text-[#6B6B6B]">
          Maída Live editors will be available here soon.
        </p>
      </div>
    </div>
  );
}
