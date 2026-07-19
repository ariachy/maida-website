'use client';

import { useState, useEffect, useCallback } from 'react';

interface MeetItem {
  id: string;
  sectionId: string;
  type: string;
  title: string;
  titlePt?: string;
  subtitle?: string;
  subtitlePt?: string;
  url?: string;
  icon?: string;
  image?: string;
  color: string;
  order: number;
  isActive: boolean;
  metadata?: string;
}

interface MeetSection {
  id: string;
  title: string;
  titlePt?: string;
  order: number;
  isActive: boolean;
  items: MeetItem[];
}

interface Settings {
  [key: string]: string;
}

const ITEM_TYPES = [
  { value: 'button', label: 'Button', description: 'Standard link button' },
  { value: 'wifi', label: 'WiFi (Collapsible)', description: 'Tap to expand WiFi details' },
  { value: 'wifi-card', label: 'WiFi Card', description: 'Always visible network & password' },
  { value: 'event', label: 'Event Card', description: 'Highlighted event with image' },
  { value: 'review', label: 'Review Widget', description: 'Review CTA with QR option' },
  { value: 'blog', label: 'Blog Post (Auto)', description: 'Pulls latest from /api/blog/latest' },
  { value: 'blog-manual', label: 'Blog Post (Manual)', description: 'Manual blog with image, tags, description' },
  { value: 'separator', label: 'Separator', description: 'Visual divider line' },
  { value: 'icon', label: 'Icon Link', description: 'Small icon with text' },
  { value: 'info', label: 'Info Text', description: 'Plain text info' },
];

const COLOR_PRESETS = [
  { value: 'terracotta', label: 'Terracotta', color: '#A67C5B' },
  { value: 'coral', label: 'Coral', color: '#E07B54' },
  { value: 'olive', label: 'Olive', color: '#7D8471' },
  { value: 'stone', label: 'Stone', color: '#9C9586' },
  { value: 'outline', label: 'Outline', color: 'transparent' },
  { value: 'cream', label: 'Cream', color: '#E8E3DA' },
];

export default function MeetMeAtMaidaAdminPage() {
  const [sections, setSections] = useState<MeetSection[]>([]);
  const [settings, setSettings] = useState<Settings>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'sections' | 'settings'>('sections');
  const [settingsTab, setSettingsTab] = useState<'branding' | 'wifi' | 'footer' | 'appearance'>('branding');
  
  // Modal states
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingSection, setEditingSection] = useState<MeetSection | null>(null);
  const [editingItem, setEditingItem] = useState<MeetItem | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<string>('');

  // Form states
  const [sectionForm, setSectionForm] = useState({ title: '', titlePt: '', isActive: true });
  const [itemForm, setItemForm] = useState({
    type: 'button',
    title: '',
    titlePt: '',
    subtitle: '',
    subtitlePt: '',
    url: '',
    icon: '',
    image: '',
    color: 'terracotta',
    isActive: true,
    metadata: {} as Record<string, string>,
  });

  const fetchData = useCallback(async () => {
    try {
      const [sectionsRes, settingsRes] = await Promise.all([
        fetch('/api/admin/meetmeatmaida/sections'),
        fetch('/api/admin/meetmeatmaida/settings'),
      ]);

      const sectionsData = await sectionsRes.json();
      const settingsData = await settingsRes.json();

      if (sectionsData.success) {
        setSections(sectionsData.sections);
      }
      if (settingsData.success) {
        setSettings(settingsData.settings);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Section handlers
  const handleSaveSection = async () => {
    setSaving(true);
    try {
      const method = editingSection ? 'PUT' : 'POST';
      const body = editingSection
        ? { id: editingSection.id, ...sectionForm }
        : sectionForm;

      const res = await fetch('/api/admin/meetmeatmaida/sections', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        await fetchData();
        setShowSectionModal(false);
        setEditingSection(null);
        setSectionForm({ title: '', titlePt: '', isActive: true });
      }
    } catch (error) {
      console.error('Error saving section:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSection = async (id: string) => {
    if (!confirm('Delete this section and all its items?')) return;

    try {
      const res = await fetch(`/api/admin/meetmeatmaida/sections?id=${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        await fetchData();
      }
    } catch (error) {
      console.error('Error deleting section:', error);
    }
  };

  // Item handlers
  const handleSaveItem = async () => {
    setSaving(true);
    try {
      const method = editingItem ? 'PUT' : 'POST';
      const body = editingItem
        ? { id: editingItem.id, ...itemForm }
        : { sectionId: selectedSectionId, ...itemForm };

      const res = await fetch('/api/admin/meetmeatmaida/items', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        await fetchData();
        setShowItemModal(false);
        setEditingItem(null);
        setItemForm({
          type: 'button',
          title: '',
          titlePt: '',
          subtitle: '',
          subtitlePt: '',
          url: '',
          icon: '',
          image: '',
          color: 'terracotta',
          isActive: true,
          metadata: {},
        });
      }
    } catch (error) {
      console.error('Error saving item:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm('Delete this item?')) return;

    try {
      const res = await fetch(`/api/admin/meetmeatmaida/items?id=${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        await fetchData();
      }
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const handleToggleItem = async (item: MeetItem) => {
    try {
      await fetch('/api/admin/meetmeatmaida/items', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.id, isActive: !item.isActive }),
      });
      await fetchData();
    } catch (error) {
      console.error('Error toggling item:', error);
    }
  };

  const handleToggleSection = async (section: MeetSection) => {
    try {
      await fetch('/api/admin/meetmeatmaida/sections', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: section.id, isActive: !section.isActive }),
      });
      await fetchData();
    } catch (error) {
      console.error('Error toggling section:', error);
    }
  };

  // Settings handlers
  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/meetmeatmaida/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings }),
      });
      if (res.ok) {
        await fetchData();
      }
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setSaving(false);
    }
  };

  // Move item up/down
  const handleMoveItem = async (item: MeetItem, direction: 'up' | 'down') => {
    const section = sections.find((s) => s.id === item.sectionId);
    if (!section) return;

    const currentIndex = section.items.findIndex((i) => i.id === item.id);
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

    if (newIndex < 0 || newIndex >= section.items.length) return;

    const newItems = [...section.items];
    [newItems[currentIndex], newItems[newIndex]] = [newItems[newIndex], newItems[currentIndex]];

    const reorderData = newItems.map((i, idx) => ({ id: i.id, order: idx }));

    try {
      await fetch('/api/admin/meetmeatmaida/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'items', items: reorderData }),
      });
      await fetchData();
    } catch (error) {
      console.error('Error reordering:', error);
    }
  };

  // Move section up/down
  const handleMoveSection = async (section: MeetSection, direction: 'up' | 'down') => {
    const currentIndex = sections.findIndex((s) => s.id === section.id);
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

    if (newIndex < 0 || newIndex >= sections.length) return;

    const newSections = [...sections];
    [newSections[currentIndex], newSections[newIndex]] = [newSections[newIndex], newSections[currentIndex]];

    const reorderData = newSections.map((s, idx) => ({ id: s.id, order: idx }));

    try {
      await fetch('/api/admin/meetmeatmaida/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'sections', items: reorderData }),
      });
      await fetchData();
    } catch (error) {
      console.error('Error reordering:', error);
    }
  };

  const getColorPreview = (color: string) => {
    const preset = COLOR_PRESETS.find((c) => c.value === color);
    if (preset) {
      return preset.color === 'transparent' 
        ? { border: '2px solid #D4CFC4', background: 'transparent' }
        : { background: preset.color };
    }
    return { background: color };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-terracotta border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display text-charcoal">Meet Me at Maída</h1>
          <p className="text-stone">Manage your link page content</p>
        </div>
        <a
          href="/meetmeatmaida"
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 bg-charcoal text-warm-white rounded-lg hover:bg-charcoal/80 transition-colors text-sm"
        >
          View Live Page →
        </a>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-sand">
        <button
          onClick={() => setActiveTab('sections')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'sections'
              ? 'text-terracotta border-b-2 border-terracotta'
              : 'text-stone hover:text-charcoal'
          }`}
        >
          Sections & Items
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'settings'
              ? 'text-terracotta border-b-2 border-terracotta'
              : 'text-stone hover:text-charcoal'
          }`}
        >
          Settings
        </button>
      </div>

      {/* Sections Tab */}
      {activeTab === 'sections' && (
        <div className="space-y-6">
          {/* Add Section Button */}
          <button
            onClick={() => {
              setEditingSection(null);
              setSectionForm({ title: '', titlePt: '', isActive: true });
              setShowSectionModal(true);
            }}
            className="px-4 py-2 bg-terracotta text-warm-white rounded-lg hover:bg-terracotta-light transition-colors text-sm"
          >
            + Add Section
          </button>

          {/* Sections List */}
          <div className="space-y-4">
            {sections.map((section, sectionIndex) => (
              <div
                key={section.id}
                className={`bg-white rounded-xl border ${
                  section.isActive ? 'border-sand' : 'border-red-200 bg-red-50/50'
                } overflow-hidden`}
              >
                {/* Section Header */}
                <div className="flex items-center justify-between p-4 bg-cream/50">
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => handleMoveSection(section, 'up')}
                        disabled={sectionIndex === 0}
                        className="text-stone hover:text-charcoal disabled:opacity-30"
                      >
                        ▲
                      </button>
                      <button
                        onClick={() => handleMoveSection(section, 'down')}
                        disabled={sectionIndex === sections.length - 1}
                        className="text-stone hover:text-charcoal disabled:opacity-30"
                      >
                        ▼
                      </button>
                    </div>
                    <div>
                      <h3 className="font-medium text-charcoal">{section.title || '(No header)'}</h3>
                      <p className="text-xs text-stone">{section.items.length} items</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleSection(section)}
                      className={`px-3 py-1 rounded text-xs ${
                        section.isActive
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {section.isActive ? 'Active' : 'Hidden'}
                    </button>
                    <button
                      onClick={() => {
                        setEditingSection(section);
                        setSectionForm({ 
                          title: section.title, 
                          titlePt: section.titlePt || '',
                          isActive: section.isActive 
                        });
                        setShowSectionModal(true);
                      }}
                      className="p-2 text-stone hover:text-charcoal"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDeleteSection(section.id)}
                      className="p-2 text-stone hover:text-red-500"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                {/* Items */}
                <div className="p-4 space-y-2">
                  {section.items.map((item, itemIndex) => (
                    <div
                      key={item.id}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        item.isActive ? 'bg-cream/50' : 'bg-red-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col gap-0.5">
                          <button
                            onClick={() => handleMoveItem(item, 'up')}
                            disabled={itemIndex === 0}
                            className="text-stone hover:text-charcoal disabled:opacity-30 text-xs"
                          >
                            ▲
                          </button>
                          <button
                            onClick={() => handleMoveItem(item, 'down')}
                            disabled={itemIndex === section.items.length - 1}
                            className="text-stone hover:text-charcoal disabled:opacity-30 text-xs"
                          >
                            ▼
                          </button>
                        </div>
                        <div
                          className="w-4 h-4 rounded-full border"
                          style={getColorPreview(item.color)}
                        />
                        <div>
                          <p className="text-sm text-charcoal">
                            {item.icon && <span className="mr-1">{item.icon}</span>}
                            {item.title || `(${item.type})`}
                          </p>
                          <p className="text-xs text-stone">{ITEM_TYPES.find(t => t.value === item.type)?.label || item.type}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleItem(item)}
                          className={`w-8 h-5 rounded-full transition-colors ${
                            item.isActive ? 'bg-green-500' : 'bg-gray-300'
                          }`}
                        >
                          <div
                            className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${
                              item.isActive ? 'translate-x-3.5' : 'translate-x-0.5'
                            }`}
                          />
                        </button>
                        <button
                          onClick={() => {
                            setEditingItem(item);
                            setSelectedSectionId(item.sectionId);
                            const metadata = item.metadata ? JSON.parse(item.metadata) : {};
                            setItemForm({
                              type: item.type,
                              title: item.title,
                              titlePt: item.titlePt || '',
                              subtitle: item.subtitle || '',
                              subtitlePt: item.subtitlePt || '',
                              url: item.url || '',
                              icon: item.icon || '',
                              image: item.image || '',
                              color: item.color,
                              isActive: item.isActive,
                              metadata,
                            });
                            setShowItemModal(true);
                          }}
                          className="p-1 text-stone hover:text-charcoal"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="p-1 text-stone hover:text-red-500"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Add Item Button */}
                  <button
                    onClick={() => {
                      setEditingItem(null);
                      setSelectedSectionId(section.id);
                      setItemForm({
                        type: 'button',
                        title: '',
                        titlePt: '',
                        subtitle: '',
                        subtitlePt: '',
                        url: '',
                        icon: '',
                        image: '',
                        color: 'terracotta',
                        isActive: true,
                        metadata: {},
                      });
                      setShowItemModal(true);
                    }}
                    className="w-full py-2 border-2 border-dashed border-sand rounded-lg text-stone hover:border-terracotta hover:text-terracotta transition-colors text-sm"
                  >
                    + Add Item
                  </button>
                </div>
              </div>
            ))}

            {sections.length === 0 && (
              <div className="text-center py-12 text-stone">
                No sections yet. Create your first section to get started.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          {/* Settings Sub-tabs */}
          <div className="flex gap-1 bg-cream/50 p-1 rounded-lg w-fit flex-wrap">
            {[
              { id: 'branding', label: '✨ Branding' },
              { id: 'wifi', label: '📶 WiFi' },
              { id: 'footer', label: '📍 Footer' },
              { id: 'appearance', label: '🎨 Appearance' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSettingsTab(tab.id as typeof settingsTab)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  settingsTab === tab.id
                    ? 'bg-white text-charcoal shadow-sm'
                    : 'text-stone hover:text-charcoal'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Branding Tab */}
          {settingsTab === 'branding' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-sand p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xl">✨</span>
                  <h3 className="font-medium text-charcoal">Taglines & Branding</h3>
                </div>
                <p className="text-sm text-stone mb-6">Set the taglines that appear at the top of your page.</p>
                
                <div className="space-y-6">
                  {/* Primary Tagline */}
                  <div className="p-4 bg-cream/30 rounded-lg">
                    <label className="block text-sm font-medium text-charcoal mb-3">Primary Tagline (italic)</label>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-stone mb-1">English</label>
                        <input
                          type="text"
                          value={settings.tagline_1 || ''}
                          onChange={(e) => setSettings({ ...settings, tagline_1: e.target.value })}
                          className="w-full px-3 py-2 border border-sand rounded-lg text-sm"
                          placeholder="Mediterranean Flavours. Lebanese Soul."
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-stone mb-1">Português</label>
                        <input
                          type="text"
                          value={settings.tagline_1_pt || ''}
                          onChange={(e) => setSettings({ ...settings, tagline_1_pt: e.target.value })}
                          className="w-full px-3 py-2 border border-sand rounded-lg text-sm"
                          placeholder="Sabores Mediterrâneos. Alma Libanesa."
                        />
                      </div>
                    </div>
                  </div>

                  {/* Secondary Tagline */}
                  <div className="p-4 bg-cream/30 rounded-lg">
                    <label className="block text-sm font-medium text-charcoal mb-3">Secondary Tagline (description)</label>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-stone mb-1">English</label>
                        <textarea
                          value={settings.tagline_2 || ''}
                          onChange={(e) => setSettings({ ...settings, tagline_2: e.target.value })}
                          className="w-full px-3 py-2 border border-sand rounded-lg text-sm"
                          rows={3}
                          placeholder="A place where flavors, music, and good company come together. Rooted in tradition, reimagined for today."
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-stone mb-1">Português</label>
                        <textarea
                          value={settings.tagline_2_pt || ''}
                          onChange={(e) => setSettings({ ...settings, tagline_2_pt: e.target.value })}
                          className="w-full px-3 py-2 border border-sand rounded-lg text-sm"
                          rows={3}
                          placeholder="Um lugar onde sabores, música e boa companhia se encontram."
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* WiFi Tab */}
          {settingsTab === 'wifi' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-sand p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xl">📶</span>
                  <h3 className="font-medium text-charcoal">WiFi Credentials</h3>
                </div>
                <p className="text-sm text-stone mb-6">These credentials are shown when you add a WiFi item to any section.</p>
                
                <div className="grid grid-cols-2 gap-6">
                  <div className="p-4 bg-cream/30 rounded-lg">
                    <label className="block text-sm font-medium text-charcoal mb-2">📡 Network Name</label>
                    <input
                      type="text"
                      value={settings.wifi_network || ''}
                      onChange={(e) => setSettings({ ...settings, wifi_network: e.target.value })}
                      className="w-full px-3 py-2 border border-sand rounded-lg text-sm font-mono"
                      placeholder="Maida-Guest"
                    />
                  </div>
                  <div className="p-4 bg-cream/30 rounded-lg">
                    <label className="block text-sm font-medium text-charcoal mb-2">🔑 Password</label>
                    <input
                      type="text"
                      value={settings.wifi_password || ''}
                      onChange={(e) => setSettings({ ...settings, wifi_password: e.target.value })}
                      className="w-full px-3 py-2 border border-sand rounded-lg text-sm font-mono"
                      placeholder="MaidaGuest"
                    />
                  </div>
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-700">
                    💡 <strong>Tip:</strong> Add a &quot;WiFi Card&quot; item to any section to display these credentials with a copy button for guests.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Footer Tab */}
          {settingsTab === 'footer' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-sand p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xl">📍</span>
                  <h3 className="font-medium text-charcoal">Footer Information</h3>
                </div>
                <p className="text-sm text-stone mb-6">Information displayed at the bottom of the page.</p>
                
                <div className="space-y-6">
                  {/* Directions */}
                  <div className="p-4 bg-cream/30 rounded-lg">
                    <label className="block text-sm font-medium text-charcoal mb-3">📍 Directions Button</label>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs text-stone mb-1">Text (EN)</label>
                        <input
                          type="text"
                          value={settings.footer_directions_text || ''}
                          onChange={(e) => setSettings({ ...settings, footer_directions_text: e.target.value })}
                          className="w-full px-3 py-2 border border-sand rounded-lg text-sm"
                          placeholder="Directions"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-stone mb-1">Text (PT)</label>
                        <input
                          type="text"
                          value={settings.footer_directions_text_pt || ''}
                          onChange={(e) => setSettings({ ...settings, footer_directions_text_pt: e.target.value })}
                          className="w-full px-3 py-2 border border-sand rounded-lg text-sm"
                          placeholder="Direções"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-stone mb-1">Google Maps URL</label>
                        <input
                          type="text"
                          value={settings.footer_directions_url || ''}
                          onChange={(e) => setSettings({ ...settings, footer_directions_url: e.target.value })}
                          className="w-full px-3 py-2 border border-sand rounded-lg text-sm"
                          placeholder="https://maps.google.com/..."
                        />
                      </div>
                    </div>
                  </div>

                  {/* Contact */}
                  <div className="p-4 bg-cream/30 rounded-lg">
                    <label className="block text-sm font-medium text-charcoal mb-3">✉️ Contact Button</label>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs text-stone mb-1">Text (EN)</label>
                        <input
                          type="text"
                          value={settings.footer_contact_text || ''}
                          onChange={(e) => setSettings({ ...settings, footer_contact_text: e.target.value })}
                          className="w-full px-3 py-2 border border-sand rounded-lg text-sm"
                          placeholder="Contact"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-stone mb-1">Text (PT)</label>
                        <input
                          type="text"
                          value={settings.footer_contact_text_pt || ''}
                          onChange={(e) => setSettings({ ...settings, footer_contact_text_pt: e.target.value })}
                          className="w-full px-3 py-2 border border-sand rounded-lg text-sm"
                          placeholder="Contacto"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-stone mb-1">Email or URL</label>
                        <input
                          type="text"
                          value={settings.footer_contact_url || ''}
                          onChange={(e) => setSettings({ ...settings, footer_contact_url: e.target.value })}
                          className="w-full px-3 py-2 border border-sand rounded-lg text-sm"
                          placeholder="mailto:info@maida.pt"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Hours */}
                  <div className="p-4 bg-cream/30 rounded-lg">
                    <label className="block text-sm font-medium text-charcoal mb-3">🕐 Opening Hours</label>
                    <input
                      type="text"
                      value={settings.footer_hours || ''}
                      onChange={(e) => setSettings({ ...settings, footer_hours: e.target.value })}
                      className="w-full px-3 py-2 border border-sand rounded-lg text-sm"
                      placeholder="Wed – Mon: 12:00 – 23:00 · Fri – Sat: 12:00 – 01:00"
                    />
                    <p className="text-xs text-stone mt-2">Use · (middle dot) to separate different schedules</p>
                  </div>

                  {/* Address */}
                  <div className="p-4 bg-cream/30 rounded-lg">
                    <label className="block text-sm font-medium text-charcoal mb-3">🏠 Address</label>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-stone mb-1">Display Text</label>
                        <input
                          type="text"
                          value={settings.footer_address_text || ''}
                          onChange={(e) => setSettings({ ...settings, footer_address_text: e.target.value })}
                          className="w-full px-3 py-2 border border-sand rounded-lg text-sm"
                          placeholder="Rua da Boavista 66, 1200-068, Lisboa"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-stone mb-1">Link URL</label>
                        <input
                          type="text"
                          value={settings.footer_address_url || ''}
                          onChange={(e) => setSettings({ ...settings, footer_address_url: e.target.value })}
                          className="w-full px-3 py-2 border border-sand rounded-lg text-sm"
                          placeholder="https://maps.google.com/..."
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Appearance Tab */}
          {settingsTab === 'appearance' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-sand p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xl">🎨</span>
                  <h3 className="font-medium text-charcoal">Page Background</h3>
                </div>
                <p className="text-sm text-stone mb-6">Customize the background color or gradient of the page.</p>
                
                <div className="space-y-4">
                  <label className="flex items-center gap-3 p-3 bg-cream/30 rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.use_gradient === 'true'}
                      onChange={(e) =>
                        setSettings({ ...settings, use_gradient: e.target.checked ? 'true' : 'false' })
                      }
                      className="rounded w-5 h-5"
                    />
                    <div>
                      <span className="text-sm font-medium text-charcoal">Use gradient background</span>
                      <p className="text-xs text-stone">Enable for a smooth color transition from top to bottom</p>
                    </div>
                  </label>

                  {settings.use_gradient === 'true' ? (
                    <div className="grid grid-cols-2 gap-6 p-4 bg-cream/30 rounded-lg">
                      <div>
                        <label className="block text-sm font-medium text-charcoal mb-2">Top Color (From)</label>
                        <div className="flex gap-3 items-center">
                          <input
                            type="color"
                            value={settings.background_gradient_from || '#F5F0E8'}
                            onChange={(e) =>
                              setSettings({ ...settings, background_gradient_from: e.target.value })
                            }
                            className="w-12 h-12 rounded-lg cursor-pointer border border-sand"
                          />
                          <input
                            type="text"
                            value={settings.background_gradient_from || '#F5F0E8'}
                            onChange={(e) =>
                              setSettings({ ...settings, background_gradient_from: e.target.value })
                            }
                            className="flex-1 px-3 py-2 border border-sand rounded-lg text-sm font-mono"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-charcoal mb-2">Bottom Color (To)</label>
                        <div className="flex gap-3 items-center">
                          <input
                            type="color"
                            value={settings.background_gradient_to || '#EDE8E0'}
                            onChange={(e) =>
                              setSettings({ ...settings, background_gradient_to: e.target.value })
                            }
                            className="w-12 h-12 rounded-lg cursor-pointer border border-sand"
                          />
                          <input
                            type="text"
                            value={settings.background_gradient_to || '#EDE8E0'}
                            onChange={(e) =>
                              setSettings({ ...settings, background_gradient_to: e.target.value })
                            }
                            className="flex-1 px-3 py-2 border border-sand rounded-lg text-sm font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-cream/30 rounded-lg">
                      <label className="block text-sm font-medium text-charcoal mb-2">Solid Background Color</label>
                      <div className="flex gap-3 items-center">
                        <input
                          type="color"
                          value={settings.background_color || '#F5F0E8'}
                          onChange={(e) => setSettings({ ...settings, background_color: e.target.value })}
                          className="w-12 h-12 rounded-lg cursor-pointer border border-sand"
                        />
                        <input
                          type="text"
                          value={settings.background_color || '#F5F0E8'}
                          onChange={(e) => setSettings({ ...settings, background_color: e.target.value })}
                          className="flex-1 px-3 py-2 border border-sand rounded-lg text-sm font-mono max-w-[200px]"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => setSettings({ ...settings, background_color: '#F5F0E8' })}
                            className="px-3 py-2 text-xs bg-[#F5F0E8] border border-sand rounded-lg hover:ring-2 ring-terracotta"
                            title="Warm Cream"
                          >
                            Warm
                          </button>
                          <button
                            onClick={() => setSettings({ ...settings, background_color: '#2D2926' })}
                            className="px-3 py-2 text-xs bg-[#2D2926] text-white border border-sand rounded-lg hover:ring-2 ring-terracotta"
                            title="Charcoal"
                          >
                            Dark
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Preview */}
                  <div className="p-4 bg-cream/30 rounded-lg">
                    <label className="block text-sm font-medium text-charcoal mb-2">Preview</label>
                    <div
                      className="h-24 rounded-lg border border-sand"
                      style={
                        settings.use_gradient === 'true'
                          ? { background: `linear-gradient(180deg, ${settings.background_gradient_from || '#F5F0E8'} 0%, ${settings.background_gradient_to || '#EDE8E0'} 100%)` }
                          : { backgroundColor: settings.background_color || '#F5F0E8' }
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="flex items-center gap-4">
            <button
              onClick={handleSaveSettings}
              disabled={saving}
              className="px-6 py-2 bg-terracotta text-warm-white rounded-lg hover:bg-terracotta-light transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save All Settings'}
            </button>
            <span className="text-sm text-stone">Changes apply to all categories</span>
          </div>
        </div>
      )}

      {/* Section Modal */}
      {showSectionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-lg font-medium text-charcoal mb-4">
              {editingSection ? 'Edit Section' : 'Add Section'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-stone mb-1">Header (EN) - leave blank for no header</label>
                <input
                  type="text"
                  value={sectionForm.title}
                  onChange={(e) => setSectionForm({ ...sectionForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-sand rounded-lg"
                  placeholder="e.g., FROM OUR BLOG"
                />
              </div>
              <div>
                <label className="block text-sm text-stone mb-1">Header (PT)</label>
                <input
                  type="text"
                  value={sectionForm.titlePt}
                  onChange={(e) => setSectionForm({ ...sectionForm, titlePt: e.target.value })}
                  className="w-full px-3 py-2 border border-sand rounded-lg"
                  placeholder="e.g., DO NOSSO BLOG"
                />
              </div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={sectionForm.isActive}
                  onChange={(e) => setSectionForm({ ...sectionForm, isActive: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm text-charcoal">Active</span>
              </label>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowSectionModal(false)}
                className="px-4 py-2 text-stone hover:text-charcoal"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSection}
                disabled={saving}
                className="px-4 py-2 bg-terracotta text-warm-white rounded-lg hover:bg-terracotta-light disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Item Modal */}
      {showItemModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg my-8 mx-4">
            <h2 className="text-lg font-medium text-charcoal mb-4">
              {editingItem ? 'Edit Item' : 'Add Item'}
            </h2>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
              {/* Type */}
              <div>
                <label className="block text-sm text-stone mb-1">Type</label>
                <select
                  value={itemForm.type}
                  onChange={(e) => setItemForm({ ...itemForm, type: e.target.value })}
                  className="w-full px-3 py-2 border border-sand rounded-lg"
                >
                  {ITEM_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label} - {type.description}
                    </option>
                  ))}
                </select>
              </div>

              {/* Title fields - not shown for separator or blog */}
              {!['separator', 'blog'].includes(itemForm.type) && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-stone mb-1">Title (EN)</label>
                      <input
                        type="text"
                        value={itemForm.title}
                        onChange={(e) => setItemForm({ ...itemForm, title: e.target.value })}
                        className="w-full px-3 py-2 border border-sand rounded-lg"
                        placeholder="e.g., View Our Menu"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-stone mb-1">Title (PT)</label>
                      <input
                        type="text"
                        value={itemForm.titlePt}
                        onChange={(e) => setItemForm({ ...itemForm, titlePt: e.target.value })}
                        className="w-full px-3 py-2 border border-sand rounded-lg"
                        placeholder="e.g., Ver o Nosso Menu"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Subtitle (for events) */}
              {['event', 'info'].includes(itemForm.type) && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-stone mb-1">Subtitle (EN)</label>
                    <input
                      type="text"
                      value={itemForm.subtitle}
                      onChange={(e) => setItemForm({ ...itemForm, subtitle: e.target.value })}
                      className="w-full px-3 py-2 border border-sand rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-stone mb-1">Subtitle (PT)</label>
                    <input
                      type="text"
                      value={itemForm.subtitlePt}
                      onChange={(e) => setItemForm({ ...itemForm, subtitlePt: e.target.value })}
                      className="w-full px-3 py-2 border border-sand rounded-lg"
                    />
                  </div>
                </div>
              )}

              {/* URL */}
              {!['info', 'wifi', 'wifi-card', 'separator', 'blog'].includes(itemForm.type) && (
                <div>
                  <label className="block text-sm text-stone mb-1">URL</label>
                  <input
                    type="text"
                    value={itemForm.url}
                    onChange={(e) => setItemForm({ ...itemForm, url: e.target.value })}
                    className="w-full px-3 py-2 border border-sand rounded-lg"
                    placeholder="https://..."
                  />
                </div>
              )}

              {/* Icon */}
              {!['separator', 'blog', 'blog-manual'].includes(itemForm.type) && (
                <div>
                  <label className="block text-sm text-stone mb-1">Icon (emoji)</label>
                  <input
                    type="text"
                    value={itemForm.icon}
                    onChange={(e) => setItemForm({ ...itemForm, icon: e.target.value })}
                    className="w-full px-3 py-2 border border-sand rounded-lg"
                    placeholder="📍 or 🎵"
                  />
                </div>
              )}

              {/* Image (for events) */}
              {itemForm.type === 'event' && (
                <div>
                  <label className="block text-sm text-stone mb-1">Image URL</label>
                  <input
                    type="text"
                    value={itemForm.image}
                    onChange={(e) => setItemForm({ ...itemForm, image: e.target.value })}
                    className="w-full px-3 py-2 border border-sand rounded-lg"
                    placeholder="/images/events/..."
                  />
                </div>
              )}

              {/* Blog Manual Fields */}
              {itemForm.type === 'blog-manual' && (
                <>
                  <div>
                    <label className="block text-sm text-stone mb-1">Thumbnail Image URL</label>
                    <input
                      type="text"
                      value={itemForm.image}
                      onChange={(e) => setItemForm({ ...itemForm, image: e.target.value })}
                      className="w-full px-3 py-2 border border-sand rounded-lg"
                      placeholder="/images/blog/thumbnail.jpg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-stone mb-1">Tags (comma-separated)</label>
                    <input
                      type="text"
                      value={itemForm.metadata.tags || ''}
                      onChange={(e) => setItemForm({ ...itemForm, metadata: { ...itemForm.metadata, tags: e.target.value } })}
                      className="w-full px-3 py-2 border border-sand rounded-lg"
                      placeholder="tradition, the debate, at the table"
                    />
                    <p className="text-xs text-stone mt-1">Shows as small tag pills (max 3 displayed)</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-stone mb-1">Description (EN)</label>
                      <textarea
                        value={itemForm.metadata.description || ''}
                        onChange={(e) => setItemForm({ ...itemForm, metadata: { ...itemForm.metadata, description: e.target.value } })}
                        className="w-full px-3 py-2 border border-sand rounded-lg text-sm"
                        rows={2}
                        maxLength={100}
                        placeholder="Brief description (max 100 chars)"
                      />
                      <p className="text-xs text-stone mt-1">{(itemForm.metadata.description || '').length}/100</p>
                    </div>
                    <div>
                      <label className="block text-sm text-stone mb-1">Description (PT)</label>
                      <textarea
                        value={itemForm.metadata.descriptionPt || ''}
                        onChange={(e) => setItemForm({ ...itemForm, metadata: { ...itemForm.metadata, descriptionPt: e.target.value } })}
                        className="w-full px-3 py-2 border border-sand rounded-lg text-sm"
                        rows={2}
                        maxLength={100}
                        placeholder="Descrição breve (máx 100 chars)"
                      />
                      <p className="text-xs text-stone mt-1">{(itemForm.metadata.descriptionPt || '').length}/100</p>
                    </div>
                  </div>
                </>
              )}

              {/* Review-specific fields */}
              {itemForm.type === 'review' && (
                <div className="p-4 bg-cream/30 rounded-lg space-y-3">
                  <label className="block text-sm font-medium text-charcoal">QR Code Image</label>
                  <input
                    type="text"
                    value={itemForm.metadata.qrImage || ''}
                    onChange={(e) => setItemForm({ ...itemForm, metadata: { ...itemForm.metadata, qrImage: e.target.value } })}
                    className="w-full px-3 py-2 border border-sand rounded-lg text-sm"
                    placeholder="/images/google-review-qr.png"
                  />
                  <p className="text-xs text-stone">Upload QR to /public/images/ and enter the path. Shown when user taps &quot;Show QR Code&quot;.</p>
                  {itemForm.metadata.qrImage && (
                    <div className="mt-2">
                      <img 
                        src={itemForm.metadata.qrImage} 
                        alt="QR Preview" 
                        className="w-24 h-24 object-contain bg-white p-2 rounded"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Color */}
              {['button', 'review'].includes(itemForm.type) && (
                <div>
                  <label className="block text-sm text-stone mb-2">Color</label>
                  <div className="flex gap-2 flex-wrap items-center">
                    {COLOR_PRESETS.map((color) => (
                      <button
                        key={color.value}
                        onClick={() => setItemForm({ ...itemForm, color: color.value })}
                        className={`w-8 h-8 rounded-full border-2 ${
                          itemForm.color === color.value ? 'ring-2 ring-terracotta ring-offset-2' : 'border-gray-200'
                        }`}
                        style={{ backgroundColor: color.color === 'transparent' ? '#fff' : color.color }}
                        title={color.label}
                      />
                    ))}
                    <div className="flex items-center gap-2 ml-2">
                      <span className="text-xs text-stone">Custom:</span>
                      <input
                        type="color"
                        value={itemForm.color.startsWith('#') ? itemForm.color : '#A67C5B'}
                        onChange={(e) => setItemForm({ ...itemForm, color: e.target.value })}
                        className="w-8 h-8 rounded cursor-pointer border-0"
                        title="Custom color"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Active */}
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={itemForm.isActive}
                  onChange={(e) => setItemForm({ ...itemForm, isActive: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm text-charcoal">Active</span>
              </label>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowItemModal(false)}
                className="px-4 py-2 text-stone hover:text-charcoal"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveItem}
                disabled={saving || (!itemForm.title && !['separator', 'blog'].includes(itemForm.type))}
                className="px-4 py-2 bg-terracotta text-warm-white rounded-lg hover:bg-terracotta-light disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
