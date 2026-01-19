'use client';

import { memo } from 'react';

interface ContentFieldProps {
  label: string;
  description: string;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
  placeholder?: string;
  required?: boolean;
  rows?: number;
}

/**
 * ContentField - A memoized form field component for content editors
 * 
 * IMPORTANT: This component is defined outside of the page components
 * to prevent re-mounting on every render, which causes inputs to lose focus.
 */
const ContentField = memo(function ContentField({
  label,
  description,
  value,
  onChange,
  multiline = false,
  placeholder = '',
  required = false,
  rows = 3,
}: ContentFieldProps) {
  const isEmpty = required && !value.trim();

  return (
    <div className="mb-5">
      <label className="block text-sm font-medium text-[#2C2C2C] mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <p className="text-xs text-[#9CA3AF] mb-2">{description}</p>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#C4A484] text-sm resize-none ${
            isEmpty ? 'border-red-300 bg-red-50' : 'border-[#D4C4B5]'
          }`}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#C4A484] text-sm ${
            isEmpty ? 'border-red-300 bg-red-50' : 'border-[#D4C4B5]'
          }`}
        />
      )}
      {isEmpty && (
        <p className="text-xs text-red-500 mt-1">This field is required</p>
      )}
    </div>
  );
});

export default ContentField;
