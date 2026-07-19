'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface MenuItem {
  id: string;
  categoryId: string;
  sortOrder: number;
  subCategory?: string;
  active?: boolean; // undefined or true = visible; false = hidden from the public menu
}

interface TranslationItem {
  name: string;
  description: string;
}

interface SortableItemProps {
  item: MenuItem;
  enTranslation: TranslationItem;
  ptTranslation: TranslationItem;
  subCategoryName?: string;
  onEdit: () => void;
  onDelete: () => void;
  onToggleActive?: () => void;
}

export default function SortableItem({
  item,
  enTranslation,
  ptTranslation,
  subCategoryName,
  onEdit,
  onDelete,
  onToggleActive,
}: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const isActive = item.active !== false;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`p-4 flex items-center gap-4 hover:bg-[#F9F9F9] transition-colors ${
        isDragging ? 'bg-[#F5F1EB] shadow-lg rounded-lg z-10' : ''
      } ${!isActive ? 'opacity-60' : ''}`}
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="p-2 text-[#9CA3AF] hover:text-[#6B6B6B] cursor-grab active:cursor-grabbing touch-none"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
        </svg>
      </button>

      {/* Item info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={`font-medium ${isActive ? 'text-[#2C2C2C]' : 'text-[#9CA3AF] line-through'}`}>
            {enTranslation.name || <span className="text-[#9CA3AF] italic">Unnamed</span>}
          </span>
          {subCategoryName && (
            <span className="px-2 py-0.5 text-xs bg-[#F5F1EB] text-[#6B6B6B] rounded">
              {subCategoryName}
            </span>
          )}
          {!isActive && (
            <span className="px-2 py-0.5 text-xs bg-[#FEE2E2] text-[#B91C1C] rounded">
              Hidden
            </span>
          )}
        </div>
        <p className="text-sm text-[#9CA3AF] truncate">
          {enTranslation.description || <span className="italic">No description</span>}
        </p>
        {(!ptTranslation.name || !ptTranslation.description) && (
          <span className="inline-flex items-center gap-1 mt-1 text-xs text-orange-500">
            <span>🇵🇹</span> Missing translation
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Active / Hidden toggle */}
        {onToggleActive && (
          <button
            onClick={onToggleActive}
            title={isActive ? 'Visible on the menu — click to hide' : 'Hidden from the menu — click to show'}
            aria-pressed={isActive}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors ${
              isActive ? 'bg-[#7A9B6E]' : 'bg-[#D4C4B5]'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                isActive ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        )}

        <button
          onClick={onEdit}
          className="p-2 text-[#6B6B6B] hover:text-[#C4A484] hover:bg-[#F5F1EB] rounded-md transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </button>
        <button
          onClick={onDelete}
          className="p-2 text-[#6B6B6B] hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
}
