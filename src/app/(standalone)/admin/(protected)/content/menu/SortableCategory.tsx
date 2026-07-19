'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortableCategoryProps {
  id: string;
  name: string;
  itemCount: number;
  isSelected: boolean;
  onSelect: () => void;
  onEdit: () => void;
}

export default function SortableCategory({
  id,
  name,
  itemCount,
  isSelected,
  onSelect,
  onEdit,
}: SortableCategoryProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onSelect}
      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
        isSelected
          ? 'border-[#C4A484] bg-[#C4A484]/5'
          : 'border-[#E5E5E5] hover:border-[#D4C4B5]'
      } ${isDragging ? 'shadow-lg z-10' : ''}`}
    >
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1 min-w-0">
          {/* Drag handle (only this initiates a drag; clicking the card still selects) */}
          <button
            {...attributes}
            {...listeners}
            onClick={(e) => e.stopPropagation()}
            className="p-0.5 text-[#9CA3AF] hover:text-[#6B6B6B] cursor-grab active:cursor-grabbing touch-none flex-shrink-0"
            title="Drag to reorder"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
            </svg>
          </button>
          <span className="text-sm font-medium text-[#2C2C2C] truncate">{name}</span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          className="p-1 text-[#9CA3AF] hover:text-[#C4A484] transition-colors flex-shrink-0"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </button>
      </div>
      <span className="text-xs text-[#9CA3AF]">{itemCount} items</span>
    </div>
  );
}
