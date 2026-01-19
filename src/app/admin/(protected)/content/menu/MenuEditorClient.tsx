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
} from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';

import LanguageTabs from '@/components/admin/LanguageTabs';
import Modal, { ConfirmModal } from '@/components/admin/Modal';
import { ToastContainer, useToast } from '@/components/admin/Toast';
import MenuItemEditor from './MenuItemEditor';
import CategoryEditor from './CategoryEditor';
import SortableItem from './SortableItem';

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
}

interface MenuData {
  categories: Category[];
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
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'item' | 'category'; id: string } | null>(null);

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

  const saveAllData = async () => {
    if (!menuData || !enData || !ptData) return;

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
      toast.success('Menu saved successfully!');
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save menu');
    } finally {
      setSaving(false);
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

  // Handle drag end for reordering
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const filteredItems = getFilteredItems();
      const oldIndex = filteredItems.findIndex((i) => i.id === active.id);
      const newIndex = filteredItems.findIndex((i) => i.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const reorderedFiltered = arrayMove(filteredItems, oldIndex, newIndex);
        
        setMenuData((prev) => {
          if (!prev) return prev;
          
          const newItems = prev.items.map((item) => {
            const newPosition = reorderedFiltered.findIndex((f) => f.id === item.id);
            if (newPosition !== -1) {
              return { ...item, sortOrder: newPosition + 1 };
            }
            return item;
          });

          return { ...prev, items: newItems };
        });

        setHasUnsavedChanges(true);
      }
    }
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
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-serif text-[#2C2C2C]">Menu Editor</h1>
          <p className="text-[#6B6B6B] mt-1">
            Edit menu items, categories, and descriptions in English and Portuguese
          </p>
        </div>
        <button
          onClick={saveAllData}
          disabled={saving || !hasUnsavedChanges}
          className={`relative flex items-center gap-2 px-6 py-2.5 rounded-md font-medium transition-colors ${
            hasUnsavedChanges
              ? 'bg-[#C4A484] hover:bg-[#B8956F] text-white'
              : 'bg-[#E5E5E5] text-[#9CA3AF] cursor-not-allowed'
          }`}
        >
          {saving ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Saving...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Save Changes
            </>
          )}
          {hasUnsavedChanges && !saving && (
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full" />
          )}
        </button>
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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {menuData.categories.sort((a, b) => a.sortOrder - b.sortOrder).map((cat) => (
              <div
                key={cat.id}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedCategory === cat.id
                    ? 'border-[#C4A484] bg-[#C4A484]/5'
                    : 'border-[#E5E5E5] hover:border-[#D4C4B5]'
                }`}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setSelectedSubCategory('all');
                }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-[#2C2C2C] truncate">
                    {enData.menu.categories[cat.id]?.name || cat.id}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingCategory(cat);
                    }}
                    className="p-1 text-[#9CA3AF] hover:text-[#C4A484] transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                </div>
                <span className="text-xs text-[#9CA3AF]">
                  {menuData.items.filter((i) => i.categoryId === cat.id).length} items
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

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
              Drag items to reorder
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
                {filteredItems.map((item) => {
                  const enTrans = getItemTranslation(item.id, 'en');
                  const ptTrans = getItemTranslation(item.id, 'pt');
                  
                  return (
                    <SortableItem
                      key={item.id}
                      item={item}
                      enTranslation={enTrans}
                      ptTranslation={ptTrans}
                      subCategoryName={item.subCategory ? enData.menu.subCategories[item.subCategory] : undefined}
                      onEdit={() => setEditingItem(item)}
                      onDelete={() => setDeleteConfirm({ type: 'item', id: item.id })}
                    />
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
          subCategories={enData.menu.subCategories}
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
          subCategories={enData.menu.subCategories}
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
