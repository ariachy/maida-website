'use client';

import { useState } from 'react';
import Modal from '@/components/admin/Modal';
import LanguageTabs from '@/components/admin/LanguageTabs';

interface Category {
  id: string;
  slug: string;
  sortOrder: number;
}

interface CategoryTranslation {
  name: string;
  description: string;
}

interface CategoryEditorProps {
  category: Category;
  enTranslation: CategoryTranslation;
  ptTranslation: CategoryTranslation;
  canDelete: boolean;
  onSave: (updates: {
    en?: Partial<CategoryTranslation>;
    pt?: Partial<CategoryTranslation>;
  }) => void;
  onDelete: () => void;
  onClose: () => void;
}

export default function CategoryEditor({
  category,
  enTranslation,
  ptTranslation,
  canDelete,
  onSave,
  onDelete,
  onClose,
}: CategoryEditorProps) {
  const [activeLanguage, setActiveLanguage] = useState('en');
  
  const [enName, setEnName] = useState(enTranslation.name);
  const [enDescription, setEnDescription] = useState(enTranslation.description);
  const [ptName, setPtName] = useState(ptTranslation.name);
  const [ptDescription, setPtDescription] = useState(ptTranslation.description);

  const hasEnChanges = enName !== enTranslation.name || enDescription !== enTranslation.description;
  const hasPtChanges = ptName !== ptTranslation.name || ptDescription !== ptTranslation.description;

  const handleSave = () => {
    const updates: Parameters<typeof onSave>[0] = {};

    if (hasEnChanges) {
      updates.en = { name: enName, description: enDescription };
    }
    if (hasPtChanges) {
      updates.pt = { name: ptName, description: ptDescription };
    }

    onSave(updates);
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={`Edit Category: ${enTranslation.name || category.id}`}
      size="md"
    >
      <div className="space-y-6">
        {/* Language Tabs */}
        <LanguageTabs
          activeLanguage={activeLanguage}
          onLanguageChange={setActiveLanguage}
          unsavedChanges={{ en: hasEnChanges, pt: hasPtChanges }}
        />

        {/* Category ID (read-only) */}
        <div>
          <label className="block text-sm font-medium text-[#2C2C2C] mb-1">
            Category ID
          </label>
          <input
            type="text"
            value={category.id}
            disabled
            className="w-full px-4 py-2 border border-[#E5E5E5] rounded-md bg-[#F9F9F9] text-[#9CA3AF] text-sm font-mono"
          />
        </div>

        {/* English fields */}
        {activeLanguage === 'en' && (
          <>
            <div>
              <label className="block text-sm font-medium text-[#2C2C2C] mb-1">
                Name (English)
              </label>
              <input
                type="text"
                value={enName}
                onChange={(e) => setEnName(e.target.value)}
                placeholder="e.g., To Start"
                className="w-full px-4 py-2 border border-[#D4C4B5] rounded-md focus:outline-none focus:ring-2 focus:ring-[#C4A484]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#2C2C2C] mb-1">
                Description (English)
              </label>
              <textarea
                value={enDescription}
                onChange={(e) => setEnDescription(e.target.value)}
                placeholder="e.g., Starters, dips, salads & couvert"
                rows={2}
                className="w-full px-4 py-2 border border-[#D4C4B5] rounded-md focus:outline-none focus:ring-2 focus:ring-[#C4A484] resize-none"
              />
            </div>
          </>
        )}

        {/* Portuguese fields */}
        {activeLanguage === 'pt' && (
          <>
            <div>
              <label className="block text-sm font-medium text-[#2C2C2C] mb-1">
                Name (Portuguese)
              </label>
              <input
                type="text"
                value={ptName}
                onChange={(e) => setPtName(e.target.value)}
                placeholder="e.g., Para Começar"
                className="w-full px-4 py-2 border border-[#D4C4B5] rounded-md focus:outline-none focus:ring-2 focus:ring-[#C4A484]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#2C2C2C] mb-1">
                Description (Portuguese)
              </label>
              <textarea
                value={ptDescription}
                onChange={(e) => setPtDescription(e.target.value)}
                placeholder="e.g., Entradas, dips, saladas e couvert"
                rows={2}
                className="w-full px-4 py-2 border border-[#D4C4B5] rounded-md focus:outline-none focus:ring-2 focus:ring-[#C4A484] resize-none"
              />
            </div>
          </>
        )}

        {/* Actions */}
        <div className="flex justify-between pt-4 border-t border-[#E5E5E5]">
          <div>
            {canDelete ? (
              <button
                onClick={onDelete}
                className="px-4 py-2 text-sm font-medium text-red-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
              >
                Delete Category
              </button>
            ) : (
              <span className="text-xs text-[#9CA3AF]">
                Cannot delete: category has items
              </span>
            )}
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-[#6B6B6B] hover:text-[#2C2C2C] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!hasEnChanges && !hasPtChanges}
              className="px-4 py-2 text-sm font-medium text-white bg-[#C4A484] hover:bg-[#B8956F] rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
