'use client';

import { useState, useEffect } from 'react';
import { 
  Settings, 
  Plus, 
  Trash2, 
  Star,
  GripVertical,
  ExternalLink,
  Check,
  X
} from 'lucide-react';

interface ReviewPlatform {
  id: string;
  name: string;
  url: string;
  icon: string;
  isActive: boolean;
  isPrimary: boolean;
  order: number;
}

export default function ReviewSettingsPage() {
  const [platforms, setPlatforms] = useState<ReviewPlatform[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPlatform, setNewPlatform] = useState({
    name: '',
    url: '',
    icon: 'star',
  });

  const fetchPlatforms = async () => {
    try {
      const response = await fetch('/api/admin/review/platforms');
      const data = await response.json();
      if (data.success) {
        setPlatforms(data.platforms);
      }
    } catch (error) {
      console.error('Failed to fetch platforms:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlatforms();
  }, []);

  const handleToggleActive = async (platform: ReviewPlatform) => {
    try {
      const response = await fetch('/api/admin/review/platforms', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: platform.id,
          isActive: !platform.isActive,
        }),
      });

      if (response.ok) {
        fetchPlatforms();
      }
    } catch (error) {
      console.error('Failed to update platform:', error);
    }
  };

  const handleSetPrimary = async (platform: ReviewPlatform) => {
    try {
      const response = await fetch('/api/admin/review/platforms', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: platform.id,
          isPrimary: true,
        }),
      });

      if (response.ok) {
        fetchPlatforms();
      }
    } catch (error) {
      console.error('Failed to update platform:', error);
    }
  };

  const handleUpdateUrl = async (platform: ReviewPlatform, url: string) => {
    try {
      const response = await fetch('/api/admin/review/platforms', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: platform.id,
          url,
        }),
      });

      if (response.ok) {
        fetchPlatforms();
      }
    } catch (error) {
      console.error('Failed to update platform:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this platform?')) return;

    try {
      const response = await fetch(`/api/admin/review/platforms?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchPlatforms();
      }
    } catch (error) {
      console.error('Failed to delete platform:', error);
    }
  };

  const handleAddPlatform = async () => {
    if (!newPlatform.name || !newPlatform.url) return;

    setSaving(true);
    try {
      const response = await fetch('/api/admin/review/platforms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPlatform),
      });

      if (response.ok) {
        setNewPlatform({ name: '', url: '', icon: 'star' });
        setShowAddForm(false);
        fetchPlatforms();
      }
    } catch (error) {
      console.error('Failed to add platform:', error);
    } finally {
      setSaving(false);
    }
  };

  const iconOptions = [
    { value: 'google', label: 'Google' },
    { value: 'tripadvisor', label: 'TripAdvisor' },
    { value: 'thefork', label: 'TheFork' },
    { value: 'star', label: 'Star (default)' },
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-display text-charcoal">Review Platforms</h1>
          <p className="text-stone">Configure where customers can leave reviews</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 bg-terracotta text-warm-white px-4 py-2 rounded-lg hover:bg-terracotta-light transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Platform
        </button>
      </div>

      {/* Info box */}
      <div className="bg-cream rounded-xl p-4 mb-6">
        <p className="text-sm text-stone">
          <strong className="text-charcoal">How it works:</strong> The primary platform is shown prominently on the review page. 
          Other active platforms appear as secondary options. Customers scan the QR code or tap NFC to choose where to leave their review.
        </p>
      </div>

      {/* Add Platform Form */}
      {showAddForm && (
        <div className="bg-warm-white rounded-xl p-5 border border-sand mb-6">
          <h3 className="font-medium text-charcoal mb-4">Add New Platform</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-stone block mb-1">Platform Name</label>
              <input
                type="text"
                value={newPlatform.name}
                onChange={(e) => setNewPlatform({ ...newPlatform, name: e.target.value })}
                placeholder="e.g. Zomato"
                className="w-full bg-cream border border-sand rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-terracotta"
              />
            </div>
            <div>
              <label className="text-xs text-stone block mb-1">Review URL</label>
              <input
                type="url"
                value={newPlatform.url}
                onChange={(e) => setNewPlatform({ ...newPlatform, url: e.target.value })}
                placeholder="https://..."
                className="w-full bg-cream border border-sand rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-terracotta"
              />
            </div>
            <div>
              <label className="text-xs text-stone block mb-1">Icon</label>
              <select
                value={newPlatform.icon}
                onChange={(e) => setNewPlatform({ ...newPlatform, icon: e.target.value })}
                className="w-full bg-cream border border-sand rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-terracotta"
              >
                {iconOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 text-stone hover:text-charcoal transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAddPlatform}
              disabled={!newPlatform.name || !newPlatform.url || saving}
              className="bg-terracotta text-warm-white px-4 py-2 rounded-lg hover:bg-terracotta-light disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? 'Adding...' : 'Add Platform'}
            </button>
          </div>
        </div>
      )}

      {/* Platforms List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-2 border-terracotta border-t-transparent rounded-full mx-auto" />
        </div>
      ) : platforms.length === 0 ? (
        <div className="text-center py-12 bg-cream rounded-xl">
          <Settings className="w-12 h-12 text-stone mx-auto mb-4" />
          <p className="text-stone">No platforms configured</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="mt-4 text-terracotta hover:underline"
          >
            Add your first platform
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {platforms.map((platform) => (
            <div
              key={platform.id}
              className={`bg-warm-white rounded-xl p-4 border transition-all ${
                platform.isPrimary ? 'border-terracotta' : 'border-sand'
              } ${!platform.isActive ? 'opacity-60' : ''}`}
            >
              <div className="flex items-center gap-4">
                {/* Drag handle (future: implement drag-to-reorder) */}
                <div className="text-stone cursor-grab">
                  <GripVertical className="w-5 h-5" />
                </div>

                {/* Platform info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-charcoal">{platform.name}</span>
                    {platform.isPrimary && (
                      <span className="bg-terracotta text-warm-white text-xs px-2 py-0.5 rounded-full">
                        Primary
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="url"
                      value={platform.url}
                      onChange={(e) => handleUpdateUrl(platform, e.target.value)}
                      className="flex-1 text-sm text-stone bg-transparent border-b border-transparent hover:border-sand focus:border-terracotta focus:outline-none truncate"
                      placeholder="Enter review URL..."
                    />
                    {platform.url && (
                      <a
                        href={platform.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-terracotta hover:text-terracotta-light"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {/* Toggle active */}
                  <button
                    onClick={() => handleToggleActive(platform)}
                    className={`p-2 rounded-lg border transition-all ${
                      platform.isActive
                        ? 'bg-green-50 border-green-200 text-green-600'
                        : 'bg-cream border-sand text-stone'
                    }`}
                    title={platform.isActive ? 'Active' : 'Inactive'}
                  >
                    {platform.isActive ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                  </button>

                  {/* Set as primary */}
                  {!platform.isPrimary && platform.isActive && (
                    <button
                      onClick={() => handleSetPrimary(platform)}
                      className="p-2 rounded-lg border border-sand hover:border-terracotta text-stone hover:text-terracotta transition-all"
                      title="Set as primary"
                    >
                      <Star className="w-4 h-4" />
                    </button>
                  )}

                  {/* Delete */}
                  <button
                    onClick={() => handleDelete(platform.id)}
                    className="p-2 rounded-lg border border-sand hover:border-red-300 text-stone hover:text-red-500 transition-all"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Preview link */}
      <div className="mt-8 text-center">
        <a
          href="/review"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-terracotta hover:underline"
        >
          <ExternalLink className="w-4 h-4" />
          Preview review page
        </a>
      </div>
    </div>
  );
}
