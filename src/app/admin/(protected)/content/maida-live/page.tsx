'use client';

import { useState, useEffect, useCallback } from 'react';
import LanguageTabs from '@/components/admin/LanguageTabs';
import ContentField from '@/components/admin/ContentField';

interface LocaleData {
  [key: string]: any;
}

export default function MaidaLiveEditorPage() {
  const [enData, setEnData] = useState<LocaleData | null>(null);
  const [ptData, setPtData] = useState<LocaleData | null>(null);
  const [activeLanguage, setActiveLanguage] = useState<'en' | 'pt'>('en');
  const [activeSection, setActiveSection] = useState('hero');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Sections for navigation
  const sections = [
    { id: 'hero', label: 'Hero Section', description: 'Main banner' },
    { id: 'music', label: 'Music Section', description: 'Live music info' },
    { id: 'events', label: 'Private Events', description: 'Events booking' },
    { id: 'cta', label: 'Call to Action', description: 'Bottom CTA' },
  ];

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [enRes, ptRes] = await Promise.all([
          fetch('/api/admin/content/locales/en.json'),
          fetch('/api/admin/content/locales/pt.json'),
        ]);

        if (enRes.ok && ptRes.ok) {
          const enJson = await enRes.json();
          const ptJson = await ptRes.json();
          setEnData(enJson.data);
          setPtData(ptJson.data);
        }
      } catch (error) {
        console.error('Failed to load data:', error);
        showToast('error', 'Failed to load content');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Toast helper
  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  // Save data
  const saveData = async () => {
    setSaving(true);
    try {
      const [enRes, ptRes] = await Promise.all([
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

      if (enRes.ok && ptRes.ok) {
        setHasUnsavedChanges(false);
        showToast('success', 'Maída Live page saved successfully');
      } else {
        showToast('error', 'Failed to save changes');
      }
    } catch (error) {
      console.error('Save error:', error);
      showToast('error', 'Failed to save Maída Live page');
    } finally {
      setSaving(false);
    }
  };

  // Memoized update function to prevent unnecessary re-renders
  const updateField = useCallback((path: string[], value: string) => {
    const setData = activeLanguage === 'en' ? setEnData : setPtData;

    setData((prev) => {
      if (!prev) return prev;

      const newData = JSON.parse(JSON.stringify(prev));
      let current = newData;

      for (let i = 0; i < path.length - 1; i++) {
        if (!current[path[i]]) current[path[i]] = {};
        current = current[path[i]];
      }

      current[path[path.length - 1]] = value;
      return newData;
    });

    setHasUnsavedChanges(true);
  }, [activeLanguage]);

  // Helper to get value from nested path
  const getValue = useCallback((path: string[]): string => {
    const data = activeLanguage === 'en' ? enData : ptData;
    if (!data) return '';

    let current: any = data;
    for (const key of path) {
      if (current === undefined || current === null) return '';
      current = current[key];
    }
    return typeof current === 'string' ? current : '';
  }, [activeLanguage, enData, ptData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C4A484]"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg ${
            toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
          } text-white`}
        >
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-serif text-[#2C2C2C]">Maída Live Editor</h1>
          <p className="text-[#6B6B6B] mt-1">Edit the events and music page</p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href={`/${activeLanguage}/maida-live`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 border border-[#D4C4B5] rounded-md text-[#6B6B6B] hover:bg-[#F5F1EB] transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            View Page
          </a>
          <button
            onClick={saveData}
            disabled={saving || !hasUnsavedChanges}
            className={`relative flex items-center gap-2 px-6 py-2.5 rounded-md font-medium transition-colors ${
              hasUnsavedChanges
                ? 'bg-[#C4A484] hover:bg-[#B8956F] text-white'
                : 'bg-[#E5E5E5] text-[#9CA3AF] cursor-not-allowed'
            }`}
          >
            {saving ? 'Saving...' : 'Save Changes'}
            {hasUnsavedChanges && !saving && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full" />
            )}
          </button>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Section Navigation */}
        <div className="w-56 flex-shrink-0">
          <div className="bg-white rounded-lg shadow-sm border border-[#E5E5E5] p-2">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full text-left px-3 py-2.5 rounded-md transition-colors ${
                  activeSection === section.id
                    ? 'bg-[#C4A484]/10 text-[#C4A484]'
                    : 'text-[#6B6B6B] hover:bg-[#F5F1EB]'
                }`}
              >
                <span className="block text-sm font-medium">{section.label}</span>
                <span className="block text-xs text-[#9CA3AF] mt-0.5">{section.description}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Editor Area */}
        <div className="flex-1 bg-white rounded-lg shadow-sm border border-[#E5E5E5]">
          <LanguageTabs activeLanguage={activeLanguage} onLanguageChange={setActiveLanguage} />

          <div className="p-6">
            {/* HERO SECTION */}
            {activeSection === 'hero' && (
              <>
                <div className="mb-6 pb-4 border-b border-[#E5E5E5]">
                  <h2 className="text-lg font-medium text-[#2C2C2C]">Hero Section</h2>
                  <p className="text-sm text-[#6B6B6B] mt-1">Main banner at the top of the events page</p>
                </div>

                <ContentField
                  label="Tagline"
                  description="Small text above the title (e.g., 'Music • Culture • Atmosphere')"
                  value={getValue(['maidaLive', 'heroTagline'])}
                  onChange={(val) => updateField(['maidaLive', 'heroTagline'], val)}
                  placeholder="Music • Culture • Atmosphere"
                />
                <ContentField
                  label="Page Title"
                  description="Main heading"
                  value={getValue(['maidaLive', 'heroTitle'])}
                  onChange={(val) => updateField(['maidaLive', 'heroTitle'], val)}
                  placeholder="Maída Live"
                  required
                />
                <ContentField
                  label="Subtitle"
                  description="Descriptive text below the title"
                  value={getValue(['maidaLive', 'heroSubtitle'])}
                  onChange={(val) => updateField(['maidaLive', 'heroSubtitle'], val)}
                  multiline
                  placeholder="Where dinner becomes an experience..."
                />

                <div className="mt-6 mb-4 pt-4 border-t border-[#E5E5E5]">
                  <h3 className="text-sm font-medium text-[#2C2C2C] mb-3">Bottom CTA Section</h3>
                </div>

                <ContentField
                  label="CTA Title"
                  description="Heading for the call-to-action area"
                  value={getValue(['maidaLive', 'heroCTA', 'title'])}
                  onChange={(val) => updateField(['maidaLive', 'heroCTA', 'title'], val)}
                  placeholder="Join Us Tonight"
                />
                <ContentField
                  label="CTA Subtitle"
                  description="Supporting text"
                  value={getValue(['maidaLive', 'heroCTA', 'subtitle'])}
                  onChange={(val) => updateField(['maidaLive', 'heroCTA', 'subtitle'], val)}
                  placeholder="Book your table now"
                />
                <ContentField
                  label="Button Text"
                  description="Call-to-action button"
                  value={getValue(['maidaLive', 'heroCTA', 'button'])}
                  onChange={(val) => updateField(['maidaLive', 'heroCTA', 'button'], val)}
                  placeholder="Reserve a Table"
                />
              </>
            )}

            {/* MUSIC SECTION */}
            {activeSection === 'music' && (
              <>
                <div className="mb-6 pb-4 border-b border-[#E5E5E5]">
                  <h2 className="text-lg font-medium text-[#2C2C2C]">Music Section</h2>
                  <p className="text-sm text-[#6B6B6B] mt-1">Live music and DJ information</p>
                </div>

                <ContentField
                  label="Section Title"
                  description="Main heading for music section"
                  value={getValue(['maidaLive', 'music', 'title'])}
                  onChange={(val) => updateField(['maidaLive', 'music', 'title'], val)}
                  placeholder="Live Music & DJ Sets"
                  required
                />
                <ContentField
                  label="Section Subtitle"
                  description="Subtitle or tagline"
                  value={getValue(['maidaLive', 'music', 'subtitle'])}
                  onChange={(val) => updateField(['maidaLive', 'music', 'subtitle'], val)}
                  placeholder="Every weekend"
                />
                <ContentField
                  label="Description"
                  description="Main paragraph about the music program"
                  value={getValue(['maidaLive', 'music', 'description'])}
                  onChange={(val) => updateField(['maidaLive', 'music', 'description'], val)}
                  multiline
                  rows={4}
                  placeholder="Describe your music program..."
                />

                <div className="mt-6 mb-4 pt-4 border-t border-[#E5E5E5]">
                  <h3 className="text-sm font-medium text-[#2C2C2C] mb-3">Schedule</h3>
                </div>

                <ContentField
                  label="Schedule Label"
                  description="Label for schedule section"
                  value={getValue(['maidaLive', 'music', 'scheduleLabel'])}
                  onChange={(val) => updateField(['maidaLive', 'music', 'scheduleLabel'], val)}
                  placeholder="When to catch us live"
                />
                <ContentField
                  label="Friday Schedule"
                  description="Friday music schedule"
                  value={getValue(['maidaLive', 'music', 'friday'])}
                  onChange={(val) => updateField(['maidaLive', 'music', 'friday'], val)}
                  placeholder="Friday: DJ from 21:00"
                />
                <ContentField
                  label="Saturday Schedule"
                  description="Saturday music schedule"
                  value={getValue(['maidaLive', 'music', 'saturday'])}
                  onChange={(val) => updateField(['maidaLive', 'music', 'saturday'], val)}
                  placeholder="Saturday: Live music from 20:00"
                />
              </>
            )}

            {/* PRIVATE EVENTS SECTION */}
            {activeSection === 'events' && (
              <>
                <div className="mb-6 pb-4 border-b border-[#E5E5E5]">
                  <h2 className="text-lg font-medium text-[#2C2C2C]">Private Events Section</h2>
                  <p className="text-sm text-[#6B6B6B] mt-1">Information about private bookings</p>
                </div>

                <ContentField
                  label="Section Title"
                  description="Main heading"
                  value={getValue(['maidaLive', 'events', 'title'])}
                  onChange={(val) => updateField(['maidaLive', 'events', 'title'], val)}
                  placeholder="Private Events"
                  required
                />
                <ContentField
                  label="Section Subtitle"
                  description="Tagline or subtitle"
                  value={getValue(['maidaLive', 'events', 'subtitle'])}
                  onChange={(val) => updateField(['maidaLive', 'events', 'subtitle'], val)}
                  placeholder="Host your special occasion with us"
                />
                <ContentField
                  label="Description"
                  description="Main paragraph about private events"
                  value={getValue(['maidaLive', 'events', 'description'])}
                  onChange={(val) => updateField(['maidaLive', 'events', 'description'], val)}
                  multiline
                  rows={4}
                  placeholder="Describe your private event offerings..."
                />

                <div className="mt-6 mb-4 pt-4 border-t border-[#E5E5E5]">
                  <h3 className="text-sm font-medium text-[#2C2C2C] mb-3">Features</h3>
                </div>

                <ContentField
                  label="Feature 1"
                  description="First feature or benefit"
                  value={getValue(['maidaLive', 'events', 'feature1'])}
                  onChange={(val) => updateField(['maidaLive', 'events', 'feature1'], val)}
                  placeholder="Customized menus"
                />
                <ContentField
                  label="Feature 2"
                  description="Second feature or benefit"
                  value={getValue(['maidaLive', 'events', 'feature2'])}
                  onChange={(val) => updateField(['maidaLive', 'events', 'feature2'], val)}
                  placeholder="Dedicated space"
                />
                <ContentField
                  label="Feature 3"
                  description="Third feature or benefit"
                  value={getValue(['maidaLive', 'events', 'feature3'])}
                  onChange={(val) => updateField(['maidaLive', 'events', 'feature3'], val)}
                  placeholder="Personal service"
                />
                <ContentField
                  label="Contact Button Text"
                  description="Button to contact about events"
                  value={getValue(['maidaLive', 'events', 'contactButton'])}
                  onChange={(val) => updateField(['maidaLive', 'events', 'contactButton'], val)}
                  placeholder="Inquire About Events"
                />
              </>
            )}

            {/* CTA SECTION */}
            {activeSection === 'cta' && (
              <>
                <div className="mb-6 pb-4 border-b border-[#E5E5E5]">
                  <h2 className="text-lg font-medium text-[#2C2C2C]">Call to Action Section</h2>
                  <p className="text-sm text-[#6B6B6B] mt-1">Bottom banner encouraging reservations</p>
                </div>

                <ContentField
                  label="CTA Title"
                  description="Main heading"
                  value={getValue(['maidaLive', 'cta', 'title'])}
                  onChange={(val) => updateField(['maidaLive', 'cta', 'title'], val)}
                  placeholder="Experience Maída Live"
                  required
                />
                <ContentField
                  label="CTA Subtitle"
                  description="Supporting text"
                  value={getValue(['maidaLive', 'cta', 'subtitle'])}
                  onChange={(val) => updateField(['maidaLive', 'cta', 'subtitle'], val)}
                  multiline
                  placeholder="Join us for an unforgettable evening..."
                />
                <ContentField
                  label="Button Text"
                  description="Reservation button"
                  value={getValue(['maidaLive', 'cta', 'button'])}
                  onChange={(val) => updateField(['maidaLive', 'cta', 'button'], val)}
                  placeholder="Reserve Your Table"
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
