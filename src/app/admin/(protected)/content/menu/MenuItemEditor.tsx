'use client';

import { useState } from 'react';
import Modal from '@/components/admin/Modal';
import LanguageTabs from '@/components/admin/LanguageTabs';

interface Category {
  id: string;
  slug: string;
  sortOrder: number;
}

interface MenuItem {
  id: string;
  categoryId: string;
  sortOrder: number;
  subCategory?: string;
}

interface TranslationItem {
  name: string;
  description: string;
}

interface CategoryTranslation {
  name: string;
  description: string;
}

interface MenuItemEditorProps {
  item: MenuItem | null; // null for new item
  categories: Category[];
  enTranslation: TranslationItem;
  ptTranslation: TranslationItem;
  categoryTranslations: Record<string, CategoryTranslation>;
  subCategories: Record<string, string>;
  defaultCategoryId?: string;
  onSave: (updates: {
    categoryId?: string;
    subCategory?: string;
    en?: Partial<TranslationItem>;
    pt?: Partial<TranslationItem>;
    newItemId?: string;
  }) => void;
  onClose: () => void;
}

export default function MenuItemEditor({
  item,
  categories,
  enTranslation,
  ptTranslation,
  categoryTranslations,
  subCategories,
  defaultCategoryId,
  onSave,
  onClose,
}: MenuItemEditorProps) {
  const isNew = item === null;
  
  const [activeLanguage, setActiveLanguage] = useState('en');
  const [itemId, setItemId] = useState(item?.id || '');
  const [categoryId, setCategoryId] = useState(item?.categoryId || defaultCategoryId || '');
  const [subCategory, setSubCategory] = useState(item?.subCategory || '');
  
  const [enName, setEnName] = useState(enTranslation.name);
  const [enDescription, setEnDescription] = useState(enTranslation.description);
  const [ptName, setPtName] = useState(ptTranslation.name);
  const [ptDescription, setPtDescription] = useState(ptTranslation.description);

  // Track unsaved changes per language
  const hasEnChanges = enName !== enTranslation.name || enDescription !== enTranslation.description;
  const hasPtChanges = ptName !== ptTranslation.name || ptDescription !== ptTranslation.description;

  // Generate ID from name
  const generateId = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  };

  // Auto-generate ID when name changes (for new items)
  const handleEnNameChange = (name: string) => {
    setEnName(name);
    if (isNew && !itemId) {
      setItemId(generateId(name));
    }
  };

  const handleSave = () => {
    if (isNew && !itemId) {
      alert('Please enter a name to generate an ID');
      return;
    }

    const updates: Parameters<typeof onSave>[0] = {};

    if (isNew) {
      updates.newItemId = itemId;
      updates.categoryId = categoryId;
      updates.subCategory = subCategory || undefined;
    } else {
      if (categoryId !== item?.categoryId) {
        updates.categoryId = categoryId;
      }
      if (subCategory !== item?.subCategory) {
        updates.subCategory = subCategory || undefined;
      }
    }

    if (hasEnChanges || isNew) {
      updates.en = { name: enName, description: enDescription };
    }
    if (hasPtChanges || isNew) {
      updates.pt = { name: ptName, description: ptDescription };
    }

    onSave(updates);
  };

  // Get available subcategories for selected category
  const availableSubCategories = Object.entries(subCategories);

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={isNew ? 'Add Menu Item' : `Edit: ${enTranslation.name || item?.id}`}
      size="lg"
    >
      <div className="space-y-6">
        {/* Language Tabs */}
        <LanguageTabs
          activeLanguage={activeLanguage}
          onLanguageChange={setActiveLanguage}
          unsavedChanges={{ en: hasEnChanges, pt: hasPtChanges }}
        />

        {/* ID field (for new items) */}
        {isNew && (
          <div>
            <label className="block text-sm font-medium text-[#2C2C2C] mb-1">
              Item ID <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={itemId}
              onChange={(e) => setItemId(generateId(e.target.value))}
              placeholder="auto-generated-from-name"
              className="w-full px-4 py-2 border border-[#D4C4B5] rounded-md focus:outline-none focus:ring-2 focus:ring-[#C4A484] text-sm font-mono"
            />
            <p className="mt-1 text-xs text-[#9CA3AF]">
              Unique identifier (auto-generated from English name)
            </p>
          </div>
        )}

        {/* English fields */}
        {activeLanguage === 'en' && (
          <>
            <div>
              <label className="block text-sm font-medium text-[#2C2C2C] mb-1">
                Name (English) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={enName}
                onChange={(e) => handleEnNameChange(e.target.value)}
                placeholder="e.g., Honey Roasted Halloumi"
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
                placeholder="e.g., With roasted cherry tomatoes and fresh thyme"
                rows={3}
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
                Name (Portuguese) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={ptName}
                onChange={(e) => setPtName(e.target.value)}
                placeholder="e.g., Halloumi Assado com Mel"
                className="w-full px-4 py-2 border border-[#D4C4B5] rounded-md focus:outline-none focus:ring-2 focus:ring-[#C4A484]"
              />
              {enName && !ptName && (
                <p className="mt-1 text-xs text-orange-500">
                  ⚠️ Portuguese translation missing
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-[#2C2C2C] mb-1">
                Description (Portuguese)
              </label>
              <textarea
                value={ptDescription}
                onChange={(e) => setPtDescription(e.target.value)}
                placeholder="e.g., Com tomate cereja assado e tomilho fresco"
                rows={3}
                className="w-full px-4 py-2 border border-[#D4C4B5] rounded-md focus:outline-none focus:ring-2 focus:ring-[#C4A484] resize-none"
              />
              {enDescription && !ptDescription && (
                <p className="mt-1 text-xs text-orange-500">
                  ⚠️ Portuguese translation missing
                </p>
              )}
            </div>
          </>
        )}

        {/* Category & Sub-category */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#2C2C2C] mb-1">
              Category
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-4 py-2 border border-[#D4C4B5] rounded-md focus:outline-none focus:ring-2 focus:ring-[#C4A484]"
            >
              {categories.sort((a, b) => a.sortOrder - b.sortOrder).map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {categoryTranslations[cat.id]?.name || cat.id}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2C2C2C] mb-1">
              Sub-category
            </label>
            <select
              value={subCategory}
              onChange={(e) => setSubCategory(e.target.value)}
              className="w-full px-4 py-2 border border-[#D4C4B5] rounded-md focus:outline-none focus:ring-2 focus:ring-[#C4A484]"
            >
              <option value="">None</option>
              {availableSubCategories.map(([id, name]) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-[#E5E5E5]">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-[#6B6B6B] hover:text-[#2C2C2C] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isNew && !itemId}
            className="px-4 py-2 text-sm font-medium text-white bg-[#C4A484] hover:bg-[#B8956F] rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isNew ? 'Add Item' : 'Save Changes'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
