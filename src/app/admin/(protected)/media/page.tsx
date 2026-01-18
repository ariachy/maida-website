export default function MediaPage() {
  return (
    <div>
      <h1 className="text-3xl font-serif text-[#2C2C2C] mb-2">Media Library</h1>
      <p className="text-[#6B6B6B] mb-8">Upload and manage images</p>
      
      <div className="bg-white rounded-lg shadow-sm border border-[#E5E5E5] p-8 text-center">
        <div className="w-16 h-16 bg-[#C4A484]/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-[#C4A484]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h2 className="text-xl font-medium text-[#2C2C2C] mb-2">Coming in Phase 2</h2>
        <p className="text-[#6B6B6B]">
          Media upload and management will be available here soon.
        </p>
      </div>
    </div>
  );
}
