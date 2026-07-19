'use client';

import { useState } from 'react';
import Modal from '@/components/admin/Modal';
import LanguageTabs from '@/components/admin/LanguageTabs';

interface SubCategoryEditorProps {
  mode: 'add' | 'edit';
  categoryName: string;
  initialEnName: string;
  initialPtName: string;
  onSave: (data: { enName: string; ptName: string }) => void;
  onClose: () => void;
}

export default function SubCategoryEditor({
  mode,
  categoryName,
  initialEnName,
  initialPtName,
  onSave,
  onClose,
}: SubCategoryEditorProps) {
  const [activeLanguage, setActiveLanguage] = useState('en');
  const [enName, setEnName] = useState(initialEnName);
  const [ptName, setPtName] = useState(initialPtName);

  const hasEnChanges = enName !== initialEnName;
  const hasPtChanges = ptName !== initialPtName;

  const handleSave = () => {
    if (!enName.trim()) {
      alert('Please enter an English name for the sub-category.');
      return;
    }
    onSave({ enName: enName.trim(), ptName: ptName.trim() });
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={
        mode === 'add'
          ? `Add Sub-category to ${categoryName}`
          : `Edit Sub-category in ${categoryName}`
      }
      size="md"
    >
      <div className="space-y-6">
        <LanguageTabs
          activeLanguage={activeLanguage}
          onLanguageChange={setActiveLanguage}
          unsavedChanges={{ en: hasEnChanges, pt: hasPtChanges }}
        />

        {activeLanguage === 'en' && (
          <div>
            <label className="block text-sm font-medium text-[#2C2C2C] mb-1">
              Name (English) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={enName}
              onChange={(e) => setEnName(e.target.value)}
              placeholder="e.g., White"
              className="w-full px-4 py-2 border border-[#D4C4B5] rounded-md focus:outline-none focus:ring-2 focus:ring-[#C4A484]"
            />
            <p className="mt-1 text-xs text-[#9CA3AF]">
              This becomes the heading shown above the items on the menu.
            </p>
          </div>
        )}

        {activeLanguage === 'pt' && (
          <div>
            <label className="block text-sm font-medium text-[#2C2C2C] mb-1">
              Name (Portuguese)
            </label>
            <input
              type="text"
              value={ptName}
              onChange={(e) => setPtName(e.target.value)}
              placeholder="e.g., Branco"
              className="w-full px-4 py-2 border border-[#D4C4B5] rounded-md focus:outline-none focus:ring-2 focus:ring-[#C4A484]"
            />
            {enName && !ptName && (
              <p className="mt-1 text-xs text-orange-500">
                ⚠️ Portuguese name missing — the English name will be used as a fallback.
              </p>
            )}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t border-[#E5E5E5]">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-[#6B6B6B] hover:text-[#2C2C2C] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!enName.trim()}
            className="px-4 py-2 text-sm font-medium text-white bg-[#C4A484] hover:bg-[#B8956F] rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {mode === 'add' ? 'Add Sub-category' : 'Save Changes'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
