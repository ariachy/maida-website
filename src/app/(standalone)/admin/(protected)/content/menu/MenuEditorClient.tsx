'use client';

import { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';

import LanguageTabs from '@/components/admin/LanguageTabs';
import Modal, { ConfirmModal } from '@/components/admin/Modal';
import { ToastContainer, useToast } from '@/components/admin/Toast';
import RebuildModal from '@/components/admin/RebuildModal';
import MenuItemEditor from './MenuItemEditor';
import CategoryEditor from './CategoryEditor';
import SortableItem from './SortableItem';
import SubCategoryEditor from './SubCategoryEditor';
import SortableSubCategory from './SortableSubCategory';
import SortableCategory from './SortableCategory';

// Types
interface Category {
  id: string;
  slug: string;
  image: string;
  sortOrder: number;
}

interface MenuItem {
  id: string;
  categoryId: string;
  sortOrder: number;
  subCategory?: string;
  active?: boolean;
}

interface SubCategoryRecord {
  id: string;
  categoryId: string;
  sortOrder: number;
}

interface MenuData {
  categories: Category[];
  subCategories?: SubCategoryRecord[];
  items: MenuItem[];
}

interface TranslationItem {
  name: string;
  description: string;
}

interface CategoryTranslation {
  name: string;
  description: string;
}

interface LocaleData {
  menu: {
    categories: Record<string, CategoryTranslation>;
    subCategories: Record<string, string>;
    items: Record<string, TranslationItem>;
  };
  [key: string]: unknown;
}

export default function MenuEditorClient() {
  const toast = useToast();
  
  // Data state
  const [menuData, setMenuData] = useState<MenuData | null>(null);
  const [enData, setEnData] = useState<LocaleData | null>(null);
  const [ptData, setPtData] = useState<LocaleData | null>(null);
  
  // UI state
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('all');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal state
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [showAddItem, setShowAddItem] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showAddSubCategory, setShowAddSubCategory] = useState(false);
  const [editingSubCategory, setEditingSubCategory] = useState<{ id: string; categoryId: string } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'item' | 'category'; id: string } | null>(null);
  const [showRebuildModal, setShowRebuildModal] = useState(false);

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Load data on mount
  useEffect(() => {
    loadAllData();
  }, []);

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [menuRes, enRes, ptRes] = await Promise.all([
        fetch('/api/admin/content/menu.json'),
        fetch('/api/admin/content/locales/en.json'),
        fetch('/api/admin/content/locales/pt.json'),
      ]);

      if (!menuRes.ok || !enRes.ok || !ptRes.ok) {
        throw new Error('Failed to load data');
      }

      const [menuJson, enJson, ptJson] = await Promise.all([
        menuRes.json(),
        enRes.json(),
        ptRes.json(),
      ]);

      setMenuData(menuJson.data);
      setEnData(enJson.data);
      setPtData(ptJson.data);
      
      if (menuJson.data.categories.length > 0) {
        setSelectedCategory(menuJson.data.categories[0].id);
      }
    } catch (error) {
      console.error('Load error:', error);
      toast.error('Failed to load menu data');
    } finally {
      setLoading(false);
    }
  };

  const saveAllData = async (): Promise<boolean> => {
    if (!menuData || !enData || !ptData) return false;

    setSaving(true);
    try {
      const results = await Promise.all([
        fetch('/api/admin/content/menu.json', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: menuData }),
        }),
        fetch('/api/admin/content/locales/en.json', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: enData }),
        }),
        fetch('/api/admin/content/locales/pt.json', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: ptData }),
        }),
      ]);

      const allOk = results.every((r) => r.ok);
      if (!allOk) {
        throw new Error('Failed to save some files');
      }

      setHasUnsavedChanges(false);
      return true;
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save menu');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const saveAndPublish = async () => {
    const saved = await saveAllData();
    if (saved) {
      setShowRebuildModal(true);
    }
  };

  // Get filtered items
  const getFilteredItems = () => {
    if (!menuData || !enData) return [];
    
    let items = [...menuData.items];
    
    if (selectedCategory !== 'all') {
      items = items.filter((item) => item.categoryId === selectedCategory);
    }
    
    if (selectedSubCategory !== 'all') {
      items = items.filter((item) => item.subCategory === selectedSubCategory);
    }
    
    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      items = items.filter((item) => {
        const enTrans = enData.menu.items[item.id];
        const ptTrans = ptData?.menu.items[item.id];
        return (
          item.id.toLowerCase().includes(query) ||
          enTrans?.name?.toLowerCase().includes(query) ||
          enTrans?.description?.toLowerCase().includes(query) ||
          ptTrans?.name?.toLowerCase().includes(query) ||
          ptTrans?.description?.toLowerCase().includes(query)
        );
      });
    }
    
    return items.sort((a, b) => a.sortOrder - b.sortOrder);
  };

  // Get unique sub-categories for selected category
  const getSubCategories = () => {
    if (!menuData || !enData || selectedCategory === 'all') return [];
    
    const items = menuData.items.filter((item) => item.categoryId === selectedCategory);
    const subCats = new Set(items.map((item) => item.subCategory).filter(Boolean));
    
    return Array.from(subCats).map((id) => ({
      id: id as string,
      name: enData.menu.subCategories[id as string] || id,
    }));
  };

  // Get translation for an item
  const getItemTranslation = (itemId: string, lang: string): TranslationItem => {
    const data = lang === 'en' ? enData : ptData;
    return data?.menu.items[itemId] || { name: itemId, description: '' };
  };

  // Update item translation
  const updateItemTranslation = (itemId: string, lang: string, updates: Partial<TranslationItem>) => {
    const setData = lang === 'en' ? setEnData : setPtData;
    
    setData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        menu: {
          ...prev.menu,
          items: {
            ...prev.menu.items,
            [itemId]: {
              ...prev.menu.items[itemId],
              ...updates,
            },
          },
        },
      };
    });
    
    setHasUnsavedChanges(true);
  };

  // Update category translation
  const updateCategoryTranslation = (catId: string, lang: string, updates: Partial<CategoryTranslation>) => {
    const setData = lang === 'en' ? setEnData : setPtData;
    
    setData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        menu: {
          ...prev.menu,
          categories: {
            ...prev.menu.categories,
            [catId]: {
              ...prev.menu.categories[catId],
              ...updates,
            },
          },
        },
      };
    });
    
    setHasUnsavedChanges(true);
  };

  // ---- Sub-category management (Phase 2) ----

  const slugify = (name: string) =>
    name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  // Ordered sub-categories for a category as {id, name}. Prefers the subCategories
  // records (so empty ones still show); falls back to deriving from items.
  const getCategorySubCategories = (categoryId: string): Array<{ id: string; name: string }> => {
    if (!menuData || !enData) return [];
    const records = menuData.subCategories
      ? menuData.subCategories.filter((s) => s.categoryId === categoryId)
      : [];
    let ids: string[];
    if (records.length) {
      ids = [...records].sort((a, b) => a.sortOrder - b.sortOrder).map((s) => s.id);
    } else {
      ids = Array.from(
        new Set(
          menuData.items
            .filter((i) => i.categoryId === categoryId)
            .map((i) => i.subCategory)
            .filter(Boolean) as string[]
        )
      );
    }
    return ids.map((id) => ({ id, name: enData.menu.subCategories[id] || id }));
  };

  // Map categoryId -> { subId: enName }, for the item editor's filtered dropdown.
  const subCatsByCategory: Record<string, Record<string, string>> = (() => {
    const map: Record<string, Record<string, string>> = {};
    if (!menuData) return map;
    for (const cat of menuData.categories) {
      map[cat.id] = {};
      for (const sub of getCategorySubCategories(cat.id)) {
        map[cat.id][sub.id] = sub.name;
      }
    }
    return map;
  })();

  const addSubCategory = (categoryId: string, enName: string, ptName: string) => {
    if (!menuData || !enData) return;
    const base = slugify(enName) || 'subcategory';
    const existing = new Set([
      ...Object.keys(enData.menu.subCategories || {}),
      ...((menuData.subCategories || []).map((sc) => sc.id)),
    ]);
    let id = base;
    let n = 2;
    while (existing.has(id)) {
      id = `${base}-${n}`;
      n++;
    }

    const recs = (menuData.subCategories || []).filter((sc) => sc.categoryId === categoryId);
    const maxOrder = Math.max(0, ...recs.map((sc) => sc.sortOrder));

    setMenuData((prev) => {
      if (!prev) return prev;
      const subCategories = prev.subCategories ? [...prev.subCategories] : [];
      subCategories.push({ id, categoryId, sortOrder: maxOrder + 1 });
      return { ...prev, subCategories };
    });
    setEnData((prev) =>
      prev ? { ...prev, menu: { ...prev.menu, subCategories: { ...prev.menu.subCategories, [id]: enName } } } : prev
    );
    setPtData((prev) =>
      prev ? { ...prev, menu: { ...prev.menu, subCategories: { ...prev.menu.subCategories, [id]: ptName || enName } } } : prev
    );
    setHasUnsavedChanges(true);
    toast.success('Sub-category added');
  };

  const updateSubCategoryName = (subId: string, enName: string, ptName: string) => {
    setEnData((prev) =>
      prev ? { ...prev, menu: { ...prev.menu, subCategories: { ...prev.menu.subCategories, [subId]: enName } } } : prev
    );
    setPtData((prev) =>
      prev ? { ...prev, menu: { ...prev.menu, subCategories: { ...prev.menu.subCategories, [subId]: ptName || enName } } } : prev
    );
    setHasUnsavedChanges(true);
    toast.success('Sub-category updated');
  };

  const deleteSubCategory = (subId: string) => {
    setMenuData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        subCategories: (prev.subCategories || []).filter((sc) => sc.id !== subId),
        items: prev.items.map((i) => (i.subCategory === subId ? { ...i, subCategory: undefined } : i)),
      };
    });
    setEnData((prev) => {
      if (!prev) return prev;
      const next = { ...prev.menu.subCategories };
      delete next[subId];
      return { ...prev, menu: { ...prev.menu, subCategories: next } };
    });
    setPtData((prev) => {
      if (!prev) return prev;
      const next = { ...prev.menu.subCategories };
      delete next[subId];
      return { ...prev, menu: { ...prev.menu, subCategories: next } };
    });
    setHasUnsavedChanges(true);
    toast.success('Sub-category removed; its items moved to no sub-category');
  };

  // Renumber a category's items so sortOrder runs: ungrouped first, then each
  // sub-category in record order, items kept in their existing order (or an
  // override for the group just dragged). Keeps admin list and public site in sync.
  const renumberCategoryItems = (
    data: MenuData,
    categoryId: string,
    override?: { subId: string | undefined; orderIds: string[] }
  ): MenuData => {
    const subRecs = (data.subCategories || [])
      .filter((s) => s.categoryId === categoryId)
      .sort((a, b) => a.sortOrder - b.sortOrder);
    const orderedSubIds = subRecs.map((s) => s.id);
    const catItems = data.items.filter((i) => i.categoryId === categoryId);

    const bucketFor = (subId: string | undefined): MenuItem[] => {
      const arr = catItems.filter((i) => i.subCategory === subId);
      if (override && override.subId === subId) {
        const byId = new Map(arr.map((i) => [i.id, i]));
        const ordered = override.orderIds
          .map((id) => byId.get(id))
          .filter((x): x is MenuItem => Boolean(x));
        const rest = arr.filter((i) => !override.orderIds.includes(i.id));
        return [...ordered, ...rest];
      }
      return [...arr].sort((a, b) => a.sortOrder - b.sortOrder);
    };

    const buckets: MenuItem[][] = [];
    buckets.push(bucketFor(undefined)); // ungrouped first
    for (const sid of orderedSubIds) buckets.push(bucketFor(sid));
    const known = new Set(orderedSubIds);
    const orphanIds = Array.from(
      new Set(catItems.map((i) => i.subCategory).filter((sc) => sc && !known.has(sc)) as string[])
    );
    for (const sid of orphanIds) buckets.push(bucketFor(sid));

    const newOrder: Record<string, number> = {};
    let counter = 1;
    for (const b of buckets) for (const it of b) newOrder[it.id] = counter++;

    return {
      ...data,
      items: data.items.map((i) =>
        i.categoryId === categoryId && newOrder[i.id] !== undefined
          ? { ...i, sortOrder: newOrder[i.id] }
          : i
      ),
    };
  };

  // Handle item drag — reorder ONLY within the same category + sub-category.
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || !menuData) return;

    const activeItem = menuData.items.find((i) => i.id === active.id);
    const overItem = menuData.items.find((i) => i.id === over.id);
    if (!activeItem || !overItem) return;

    // Ignore drops that cross a category or sub-category boundary.
    if (
      activeItem.categoryId !== overItem.categoryId ||
      activeItem.subCategory !== overItem.subCategory
    ) {
      return;
    }

    const group = menuData.items
      .filter(
        (i) => i.categoryId === activeItem.categoryId && i.subCategory === activeItem.subCategory
      )
      .sort((a, b) => a.sortOrder - b.sortOrder);
    const oldIndex = group.findIndex((i) => i.id === active.id);
    const newIndex = group.findIndex((i) => i.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const orderIds = arrayMove(group, oldIndex, newIndex).map((i) => i.id);

    setMenuData((prev) =>
      prev
        ? renumberCategoryItems(prev, activeItem.categoryId, {
            subId: activeItem.subCategory,
            orderIds,
          })
        : prev
    );
    setHasUnsavedChanges(true);
  };

  // Handle sub-category (group) drag — reorder the groups within a category.
  const handleSubCategoryDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || !menuData || selectedCategory === 'all') return;

    const recs = (menuData.subCategories || [])
      .filter((s) => s.categoryId === selectedCategory)
      .sort((a, b) => a.sortOrder - b.sortOrder);
    const oldIndex = recs.findIndex((s) => s.id === active.id);
    const newIndex = recs.findIndex((s) => s.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const newRecs = arrayMove(recs, oldIndex, newIndex).map((r, idx) => ({
      ...r,
      sortOrder: idx + 1,
    }));

    setMenuData((prev) => {
      if (!prev) return prev;
      const others = (prev.subCategories || []).filter((s) => s.categoryId !== selectedCategory);
      const withRecs: MenuData = { ...prev, subCategories: [...others, ...newRecs] };
      return renumberCategoryItems(withRecs, selectedCategory);
    });
    setHasUnsavedChanges(true);
  };

  // Handle category (tab) drag — reorder the top-level categories.
  const handleCategoryDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || !menuData) return;

    const sorted = [...menuData.categories].sort((a, b) => a.sortOrder - b.sortOrder);
    const oldIndex = sorted.findIndex((c) => c.id === active.id);
    const newIndex = sorted.findIndex((c) => c.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(sorted, oldIndex, newIndex).map((c, idx) => ({
      ...c,
      sortOrder: idx + 1,
    }));

    setMenuData((prev) => (prev ? { ...prev, categories: reordered } : prev));
    setHasUnsavedChanges(true);
  };

  // Add new item
  const addItem = (categoryId: string, itemData: { id: string; subCategory?: string }) => {
    if (!menuData) return;

    const categoryItems = menuData.items.filter((i) => i.categoryId === categoryId);
    const maxSortOrder = Math.max(0, ...categoryItems.map((i) => i.sortOrder));

    const newItem: MenuItem = {
      id: itemData.id,
      categoryId,
      sortOrder: maxSortOrder + 1,
      subCategory: itemData.subCategory,
    };

    setMenuData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        items: [...prev.items, newItem],
      };
    });

    setEnData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        menu: {
          ...prev.menu,
          items: {
            ...prev.menu.items,
            [itemData.id]: { name: '', description: '' },
          },
        },
      };
    });

    setPtData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        menu: {
          ...prev.menu,
          items: {
            ...prev.menu.items,
            [itemData.id]: { name: '', description: '' },
          },
        },
      };
    });

    setHasUnsavedChanges(true);
    toast.success('Item added');
  };

  // Delete item
  const deleteItem = (itemId: string) => {
    setMenuData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        items: prev.items.filter((i) => i.id !== itemId),
      };
    });

    setEnData((prev) => {
      if (!prev) return prev;
      const { [itemId]: _, ...restItems } = prev.menu.items;
      return {
        ...prev,
        menu: {
          ...prev.menu,
          items: restItems,
        },
      };
    });

    setPtData((prev) => {
      if (!prev) return prev;
      const { [itemId]: _, ...restItems } = prev.menu.items;
      return {
        ...prev,
        menu: {
          ...prev.menu,
          items: restItems,
        },
      };
    });

    setHasUnsavedChanges(true);
    toast.success('Item deleted');
  };

  // Check if category can be deleted (no items)
  const canDeleteCategory = (categoryId: string) => {
    if (!menuData) return false;
    return !menuData.items.some((item) => item.categoryId === categoryId);
  };

  // Toggle an item's active (visible-on-menu) state
  const toggleItemActive = (itemId: string) => {
    setMenuData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        items: prev.items.map((i) =>
          i.id === itemId ? { ...i, active: i.active === false ? true : false } : i
        ),
      };
    });
    setHasUnsavedChanges(true);
  };

  // Add new category
  const addCategory = (categoryData: { id: string; slug: string }) => {
    if (!menuData) return;

    const maxSortOrder = Math.max(0, ...menuData.categories.map((c) => c.sortOrder));

    const newCategory: Category = {
      id: categoryData.id,
      slug: categoryData.slug,
      image: '',
      sortOrder: maxSortOrder + 1,
    };

    setMenuData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        categories: [...prev.categories, newCategory],
      };
    });

    setEnData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        menu: {
          ...prev.menu,
          categories: {
            ...prev.menu.categories,
            [categoryData.id]: { name: '', description: '' },
          },
        },
      };
    });

    setPtData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        menu: {
          ...prev.menu,
          categories: {
            ...prev.menu.categories,
            [categoryData.id]: { name: '', description: '' },
          },
        },
      };
    });

    setHasUnsavedChanges(true);
    toast.success('Category added');
  };

  // Delete category
  const deleteCategory = (categoryId: string) => {
    if (!canDeleteCategory(categoryId)) {
      toast.error('Cannot delete category with items');
      return;
    }

    setMenuData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        categories: prev.categories.filter((c) => c.id !== categoryId),
      };
    });

    setEnData((prev) => {
      if (!prev) return prev;
      const { [categoryId]: _, ...restCategories } = prev.menu.categories;
      return {
        ...prev,
        menu: {
          ...prev.menu,
          categories: restCategories,
        },
      };
    });

    setPtData((prev) => {
      if (!prev) return prev;
      const { [categoryId]: _, ...restCategories } = prev.menu.categories;
      return {
        ...prev,
        menu: {
          ...prev.menu,
          categories: restCategories,
        },
      };
    });

    if (selectedCategory === categoryId) {
      setSelectedCategory('all');
    }

    setHasUnsavedChanges(true);
    toast.success('Category deleted');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C4A484]" />
      </div>
    );
  }

  if (!menuData || !enData || !ptData) {
    return (
      <div className="text-center py-12">
        <p className="text-[#6B6B6B]">Failed to load menu data</p>
        <button
          onClick={loadAllData}
          className="mt-4 px-4 py-2 bg-[#C4A484] text-white rounded-md"
        >
          Retry
        </button>
      </div>
    );
  }

  const filteredItems = getFilteredItems();
  const subCategories = getSubCategories();

  return (
    <div>
      {/* Rebuild Modal */}
      <RebuildModal 
        isOpen={showRebuildModal} 
        onClose={() => setShowRebuildModal(false)} 
      />

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-serif text-[#2C2C2C]">Menu Editor</h1>
          <p className="text-[#6B6B6B] mt-1">
            Edit menu items, categories, and descriptions in English and Portuguese
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Save Draft Button */}
          <button
            onClick={saveAllData}
            disabled={saving || !hasUnsavedChanges}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-md font-medium transition-colors border ${
              hasUnsavedChanges
                ? 'border-[#C4A484] text-[#C4A484] hover:bg-[#C4A484]/10'
                : 'border-[#E5E5E5] text-[#9CA3AF] cursor-not-allowed'
            }`}
          >
            {saving ? 'Saving...' : 'Save Draft'}
          </button>

          {/* Save & Publish Button */}
          <button
            onClick={saveAndPublish}
            disabled={saving || !hasUnsavedChanges}
            className={`relative flex items-center gap-2 px-6 py-2.5 rounded-md font-medium transition-colors ${
              hasUnsavedChanges
                ? 'bg-[#C4A484] hover:bg-[#B8956F] text-white'
                : 'bg-[#E5E5E5] text-[#9CA3AF] cursor-not-allowed'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            {saving ? 'Saving...' : 'Save & Publish'}
            {hasUnsavedChanges && !saving && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full" />
            )}
          </button>
        </div>
      </div>

      {/* Filters & Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-[#E5E5E5] mb-6">
        <div className="p-4 flex flex-wrap items-center gap-4">
          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-[#6B6B6B]">Category:</label>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setSelectedSubCategory('all');
              }}
              className="px-3 py-2 border border-[#D4C4B5] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#C4A484]"
            >
              <option value="all">All Categories</option>
              {menuData.categories.sort((a, b) => a.sortOrder - b.sortOrder).map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {enData.menu.categories[cat.id]?.name || cat.id}
                </option>
              ))}
            </select>
          </div>

          {/* Sub-category Filter */}
          {subCategories.length > 0 && (
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-[#6B6B6B]">Sub-category:</label>
              <select
                value={selectedSubCategory}
                onChange={(e) => setSelectedSubCategory(e.target.value)}
                className="px-3 py-2 border border-[#D4C4B5] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#C4A484]"
              >
                <option value="all">All</option>
                {subCategories.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Search */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search items..."
                className="pl-9 pr-4 py-2 border border-[#D4C4B5] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#C4A484] w-48"
              />
            </div>
          </div>

          <div className="flex-1" />

          {/* Actions */}
          <button
            onClick={() => setShowAddCategory(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#6B6B6B] hover:text-[#2C2C2C] border border-[#D4C4B5] rounded-md hover:bg-[#F5F1EB] transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Category
          </button>
          
          <button
            onClick={() => setShowAddItem(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#C4A484] hover:bg-[#B8956F] rounded-md transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Item
          </button>
        </div>
      </div>

      {/* Categories Section */}
      <div className="bg-white rounded-lg shadow-sm border border-[#E5E5E5] mb-6">
        <div className="p-4 border-b border-[#E5E5E5]">
          <h2 className="text-lg font-medium text-[#2C2C2C]">Categories</h2>
        </div>
        <div className="p-4">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleCategoryDragEnd}
          >
            <SortableContext
              items={[...menuData.categories].sort((a, b) => a.sortOrder - b.sortOrder).map((c) => c.id)}
              strategy={rectSortingStrategy}
            >
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {[...menuData.categories].sort((a, b) => a.sortOrder - b.sortOrder).map((cat) => (
                  <SortableCategory
                    key={cat.id}
                    id={cat.id}
                    name={enData.menu.categories[cat.id]?.name || cat.id}
                    itemCount={menuData.items.filter((i) => i.categoryId === cat.id).length}
                    isSelected={selectedCategory === cat.id}
                    onSelect={() => {
                      setSelectedCategory(cat.id);
                      setSelectedSubCategory('all');
                    }}
                    onEdit={() => setEditingCategory(cat)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      </div>

      {/* Sub-category management (Phase 2) */}
      {selectedCategory !== 'all' && (
        <div className="bg-white rounded-lg shadow-sm border border-[#E5E5E5] mb-6">
          <div className="p-4 border-b border-[#E5E5E5] flex items-center justify-between">
            <h2 className="text-lg font-medium text-[#2C2C2C]">
              Sub-categories in {enData.menu.categories[selectedCategory]?.name || selectedCategory}
            </h2>
            <button
              onClick={() => setShowAddSubCategory(true)}
              className="px-3 py-1.5 text-sm font-medium text-white bg-[#C4A484] hover:bg-[#B8956F] rounded-md transition-colors"
            >
              + Add sub-category
            </button>
          </div>
          <div className="p-4">
            {getCategorySubCategories(selectedCategory).length === 0 ? (
              <p className="text-sm text-[#9CA3AF]">
                No sub-categories yet. Items without one show directly under the category.
              </p>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleSubCategoryDragEnd}
                modifiers={[restrictToVerticalAxis]}
              >
                <SortableContext
                  items={getCategorySubCategories(selectedCategory).map((s) => s.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-2 max-w-md">
                    {getCategorySubCategories(selectedCategory).map((sub) => (
                      <SortableSubCategory
                        key={sub.id}
                        id={sub.id}
                        name={sub.name}
                        onRename={() => setEditingSubCategory({ id: sub.id, categoryId: selectedCategory })}
                        onDelete={() => {
                          if (window.confirm(`Delete sub-category "${sub.name}"? Items in it will move to no sub-category.`)) {
                            deleteSubCategory(sub.id);
                          }
                        }}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </div>
        </div>
      )}

      {/* Items List with Drag & Drop */}
      <div className="bg-white rounded-lg shadow-sm border border-[#E5E5E5]">
        <div className="p-4 border-b border-[#E5E5E5] flex items-center justify-between">
          <h2 className="text-lg font-medium text-[#2C2C2C]">
            Items {selectedCategory !== 'all' && `in ${enData.menu.categories[selectedCategory]?.name || selectedCategory}`}
            <span className="ml-2 text-sm font-normal text-[#9CA3AF]">
              ({filteredItems.length} items)
            </span>
          </h2>
          {filteredItems.length > 1 && (
            <span className="text-xs text-[#9CA3AF]">
              Drag items to reorder within a group
            </span>
          )}
        </div>

        {filteredItems.length === 0 ? (
          <div className="p-8 text-center text-[#9CA3AF]">
            {searchQuery ? 'No items match your search.' : 'No items found. Add one to get started.'}
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
            modifiers={[restrictToVerticalAxis]}
          >
            <SortableContext
              items={filteredItems.map((i) => i.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="divide-y divide-[#E5E5E5]">
                {filteredItems.map((item, index) => {
                  const enTrans = getItemTranslation(item.id, 'en');
                  const ptTrans = getItemTranslation(item.id, 'pt');
                  const prevItem = index > 0 ? filteredItems[index - 1] : null;
                  const showHeader =
                    selectedCategory !== 'all' &&
                    selectedSubCategory === 'all' &&
                    (!prevItem || prevItem.subCategory !== item.subCategory);
                  const headerLabel = item.subCategory
                    ? enData.menu.subCategories[item.subCategory] || item.subCategory
                    : 'No sub-category';

                  return (
                    <div key={item.id}>
                      {showHeader && (
                        <div className="px-4 pt-4 pb-1 text-xs font-semibold uppercase tracking-wider text-[#C4A484] bg-[#FCFAF7]">
                          {headerLabel}
                        </div>
                      )}
                      <SortableItem
                        item={item}
                        enTranslation={enTrans}
                        ptTranslation={ptTrans}
                        subCategoryName={item.subCategory ? enData.menu.subCategories[item.subCategory] : undefined}
                        onEdit={() => setEditingItem(item)}
                        onDelete={() => setDeleteConfirm({ type: 'item', id: item.id })}
                        onToggleActive={() => toggleItemActive(item.id)}
                      />
                    </div>
                  );
                })}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* Edit Item Modal */}
      {editingItem && (
        <MenuItemEditor
          item={editingItem}
          categories={menuData.categories}
          enTranslation={getItemTranslation(editingItem.id, 'en')}
          ptTranslation={getItemTranslation(editingItem.id, 'pt')}
          categoryTranslations={enData.menu.categories}
          subCategoriesByCategory={subCatsByCategory}
          onSave={(updates) => {
            if (updates.categoryId || updates.subCategory !== undefined) {
              setMenuData((prev) => {
                if (!prev) return prev;
                return {
                  ...prev,
                  items: prev.items.map((i) =>
                    i.id === editingItem.id
                      ? { ...i, ...updates }
                      : i
                  ),
                };
              });
              setHasUnsavedChanges(true);
            }
            
            if (updates.en) {
              updateItemTranslation(editingItem.id, 'en', updates.en);
            }
            if (updates.pt) {
              updateItemTranslation(editingItem.id, 'pt', updates.pt);
            }
            
            setEditingItem(null);
          }}
          onClose={() => setEditingItem(null)}
        />
      )}

      {/* Edit Category Modal */}
      {editingCategory && (
        <CategoryEditor
          category={editingCategory}
          enTranslation={enData.menu.categories[editingCategory.id] || { name: '', description: '' }}
          ptTranslation={ptData.menu.categories[editingCategory.id] || { name: '', description: '' }}
          canDelete={canDeleteCategory(editingCategory.id)}
          onSave={(updates) => {
            if (updates.en) {
              updateCategoryTranslation(editingCategory.id, 'en', updates.en);
            }
            if (updates.pt) {
              updateCategoryTranslation(editingCategory.id, 'pt', updates.pt);
            }
            setEditingCategory(null);
          }}
          onDelete={() => {
            setDeleteConfirm({ type: 'category', id: editingCategory.id });
            setEditingCategory(null);
          }}
          onClose={() => setEditingCategory(null)}
        />
      )}

      {/* Add Item Modal */}
      {showAddItem && (
        <MenuItemEditor
          item={null}
          categories={menuData.categories}
          enTranslation={{ name: '', description: '' }}
          ptTranslation={{ name: '', description: '' }}
          categoryTranslations={enData.menu.categories}
          subCategoriesByCategory={subCatsByCategory}
          defaultCategoryId={selectedCategory !== 'all' ? selectedCategory : menuData.categories[0]?.id}
          onSave={(updates) => {
            if (updates.newItemId) {
              addItem(updates.categoryId || menuData.categories[0].id, {
                id: updates.newItemId,
                subCategory: updates.subCategory,
              });
              
              if (updates.en) {
                updateItemTranslation(updates.newItemId, 'en', updates.en);
              }
              if (updates.pt) {
                updateItemTranslation(updates.newItemId, 'pt', updates.pt);
              }
            }
            setShowAddItem(false);
          }}
          onClose={() => setShowAddItem(false)}
        />
      )}

      {/* Add Sub-category Modal (Phase 2) */}
      {showAddSubCategory && selectedCategory !== 'all' && (
        <SubCategoryEditor
          mode="add"
          categoryName={enData.menu.categories[selectedCategory]?.name || selectedCategory}
          initialEnName=""
          initialPtName=""
          onSave={({ enName, ptName }) => {
            addSubCategory(selectedCategory, enName, ptName);
            setShowAddSubCategory(false);
          }}
          onClose={() => setShowAddSubCategory(false)}
        />
      )}

      {/* Edit Sub-category Modal (Phase 2) */}
      {editingSubCategory && (
        <SubCategoryEditor
          mode="edit"
          categoryName={enData.menu.categories[editingSubCategory.categoryId]?.name || editingSubCategory.categoryId}
          initialEnName={enData.menu.subCategories[editingSubCategory.id] || ''}
          initialPtName={ptData.menu.subCategories[editingSubCategory.id] || ''}
          onSave={({ enName, ptName }) => {
            updateSubCategoryName(editingSubCategory.id, enName, ptName);
            setEditingSubCategory(null);
          }}
          onClose={() => setEditingSubCategory(null)}
        />
      )}

      {/* Add Category Modal */}
      {showAddCategory && (
        <AddCategoryModal
          onSave={(data) => {
            addCategory(data);
            setShowAddCategory(false);
          }}
          onClose={() => setShowAddCategory(false)}
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={deleteConfirm !== null}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => {
          if (deleteConfirm?.type === 'item') {
            deleteItem(deleteConfirm.id);
          } else if (deleteConfirm?.type === 'category') {
            deleteCategory(deleteConfirm.id);
          }
          setDeleteConfirm(null);
        }}
        title={`Delete ${deleteConfirm?.type === 'item' ? 'Item' : 'Category'}`}
        message={`Are you sure you want to delete this ${deleteConfirm?.type}? This action cannot be undone.`}
        confirmText="Delete"
        danger
      />

      {/* Toast notifications */}
      <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />
    </div>
  );
}

// Add Category Modal Component
function AddCategoryModal({
  onSave,
  onClose,
}: {
  onSave: (data: { id: string; slug: string }) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState('');
  const [id, setId] = useState('');

  const generateId = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const handleNameChange = (value: string) => {
    setName(value);
    if (!id) {
      setId(generateId(value));
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Add Category" size="sm">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[#2C2C2C] mb-1">
            Category Name (English)
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="e.g., Appetizers"
            className="w-full px-4 py-2 border border-[#D4C4B5] rounded-md focus:outline-none focus:ring-2 focus:ring-[#C4A484]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#2C2C2C] mb-1">
            Category ID
          </label>
          <input
            type="text"
            value={id}
            onChange={(e) => setId(generateId(e.target.value))}
            placeholder="auto-generated"
            className="w-full px-4 py-2 border border-[#D4C4B5] rounded-md focus:outline-none focus:ring-2 focus:ring-[#C4A484] font-mono text-sm"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-[#6B6B6B] hover:text-[#2C2C2C]"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave({ id, slug: id })}
            disabled={!id || !name}
            className="px-4 py-2 text-sm font-medium text-white bg-[#C4A484] hover:bg-[#B8956F] rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add Category
          </button>
        </div>
      </div>
    </Modal>
  );
}
