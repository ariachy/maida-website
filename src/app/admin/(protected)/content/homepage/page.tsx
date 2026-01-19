'use client';

import { useState, useEffect, useCallback } from 'react';
import LanguageTabs from '@/components/admin/LanguageTabs';
import ContentField from '@/components/admin/ContentField';

interface LocaleData {
  [key: string]: any;
}

export default function HomepageEditorPage() {
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
    { id: 'hero', label: 'Hero Section', description: 'Main banner and tagline' },
    { id: 'homeStory', label: 'Story Preview', description: 'About section preview' },
    { id: 'homeMenu', label: 'Menu Preview', description: 'Featured dishes section' },
    { id: 'homeVisit', label: 'Visit Section', description: 'Location and hours' },
    { id: 'cta', label: 'Call to Action', description: 'Bottom reservation banner' },
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
        showToast('success', 'Homepage saved successfully');
      } else {
        showToast('error', 'Failed to save changes');
      }
    } catch (error) {
      console.error('Save error:', error);
      showToast('error', 'Failed to save homepage');
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
          <h1 className="text-3xl font-serif text-[#2C2C2C]">Homepage Editor</h1>
          <p className="text-[#6B6B6B] mt-1">Edit text that appears on the homepage</p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href={`/${activeLanguage}`}
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
                  <p className="text-sm text-[#6B6B6B] mt-1">The main banner at the top of the homepage with your tagline</p>
                </div>

                <ContentField
                  label="Badge Text"
                  description="Small label above the main title (e.g., 'Restaurant-bar')"
                  value={getValue(['hero', 'badge'])}
                  onChange={(val) => updateField(['hero', 'badge'], val)}
                />
                <ContentField
                  label="Location"
                  description="Location shown below the badge (e.g., 'Cais do Sodré, Lisboa')"
                  value={getValue(['hero', 'location'])}
                  onChange={(val) => updateField(['hero', 'location'], val)}
                />

                <div className="grid grid-cols-2 gap-4">
                  <ContentField
                    label="Main Title - Line 1"
                    description="First line of the big headline"
                    value={getValue(['hero', 'title1'])}
                    onChange={(val) => updateField(['hero', 'title1'], val)}
                    placeholder="Mediterranean Flavours."
                    required
                  />
                  <ContentField
                    label="Main Title - Line 2"
                    description="Second line of the big headline"
                    value={getValue(['hero', 'title2'])}
                    onChange={(val) => updateField(['hero', 'title2'], val)}
                    placeholder="Lebanese Soul."
                    required
                  />
                </div>

                <ContentField
                  label="Subtitle"
                  description="Descriptive text below the main title"
                  value={getValue(['hero', 'subtitle'])}
                  onChange={(val) => updateField(['hero', 'subtitle'], val)}
                  multiline
                  required
                />

                <div className="grid grid-cols-2 gap-4">
                  <ContentField
                    label="Primary Button Text"
                    description="Main call-to-action button"
                    value={getValue(['hero', 'cta'])}
                    onChange={(val) => updateField(['hero', 'cta'], val)}
                    placeholder="Reserve a Table"
                  />
                  <ContentField
                    label="Secondary Button Text"
                    description="Link to menu page"
                    value={getValue(['hero', 'viewMenu'])}
                    onChange={(val) => updateField(['hero', 'viewMenu'], val)}
                    placeholder="View Menu"
                  />
                </div>
              </>
            )}

            {/* HOME STORY SECTION */}
            {activeSection === 'homeStory' && (
              <>
                <div className="mb-6 pb-4 border-b border-[#E5E5E5]">
                  <h2 className="text-lg font-medium text-[#2C2C2C]">Story Preview Section</h2>
                  <p className="text-sm text-[#6B6B6B] mt-1">Brief introduction to your story that appears on the homepage</p>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <ContentField
                    label="Headline Word 1"
                    description="First word in stacked headline"
                    value={getValue(['homeStory', 'headline1'])}
                    onChange={(val) => updateField(['homeStory', 'headline1'], val)}
                    placeholder="FROM"
                  />
                  <ContentField
                    label="Headline Word 2"
                    description="Second word"
                    value={getValue(['homeStory', 'headline2'])}
                    onChange={(val) => updateField(['homeStory', 'headline2'], val)}
                    placeholder="OUR"
                  />
                  <ContentField
                    label="Headline Word 3"
                    description="Third word"
                    value={getValue(['homeStory', 'headline3'])}
                    onChange={(val) => updateField(['homeStory', 'headline3'], val)}
                    placeholder="ROOTS"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <ContentField
                    label="Title (regular part)"
                    description="Normal text part of title"
                    value={getValue(['homeStory', 'title'])}
                    onChange={(val) => updateField(['homeStory', 'title'], val)}
                    placeholder="Where every meal is"
                  />
                  <ContentField
                    label="Title (highlighted part)"
                    description="Emphasized part shown in accent color"
                    value={getValue(['homeStory', 'titleHighlight'])}
                    onChange={(val) => updateField(['homeStory', 'titleHighlight'], val)}
                    placeholder="an invitation"
                  />
                </div>

                <ContentField
                  label="Story Text"
                  description="Main paragraph explaining your concept"
                  value={getValue(['homeStory', 'text'])}
                  onChange={(val) => updateField(['homeStory', 'text'], val)}
                  multiline
                  required
                />
                <ContentField
                  label="Button Text"
                  description="Link to full story page"
                  value={getValue(['homeStory', 'cta'])}
                  onChange={(val) => updateField(['homeStory', 'cta'], val)}
                  placeholder="Read Our Story"
                />
              </>
            )}

            {/* HOME MENU SECTION */}
            {activeSection === 'homeMenu' && (
              <>
                <div className="mb-6 pb-4 border-b border-[#E5E5E5]">
                  <h2 className="text-lg font-medium text-[#2C2C2C]">Menu Preview Section</h2>
                  <p className="text-sm text-[#6B6B6B] mt-1">Section showcasing featured dishes and drinks</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <ContentField
                    label="Section Title - Line 1"
                    description="First line of section heading"
                    value={getValue(['homeMenu', 'title1'])}
                    onChange={(val) => updateField(['homeMenu', 'title1'], val)}
                    placeholder="A TASTE"
                  />
                  <ContentField
                    label="Section Title - Line 2"
                    description="Second line of section heading"
                    value={getValue(['homeMenu', 'title2'])}
                    onChange={(val) => updateField(['homeMenu', 'title2'], val)}
                    placeholder="OF MAÍDA"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <ContentField
                    label="Kitchen Tab Label"
                    description="Label for food items tab"
                    value={getValue(['homeMenu', 'fromKitchen'])}
                    onChange={(val) => updateField(['homeMenu', 'fromKitchen'], val)}
                    placeholder="From our kitchen"
                  />
                  <ContentField
                    label="Bar Tab Label"
                    description="Label for drinks tab"
                    value={getValue(['homeMenu', 'fromBar'])}
                    onChange={(val) => updateField(['homeMenu', 'fromBar'], val)}
                    placeholder="From our bar"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <ContentField
                    label="Menu Button Text"
                    description="Link to full menu page"
                    value={getValue(['homeMenu', 'fullMenu'])}
                    onChange={(val) => updateField(['homeMenu', 'fullMenu'], val)}
                    placeholder="Full Menu"
                  />
                  <ContentField
                    label="Image Placeholder Text"
                    description="Shown when dish image is missing"
                    value={getValue(['homeMenu', 'imageComingSoon'])}
                    onChange={(val) => updateField(['homeMenu', 'imageComingSoon'], val)}
                    placeholder="Image coming soon"
                  />
                </div>

                <div className="mt-6 p-4 bg-[#F9F9F9] rounded-lg">
                  <p className="text-sm text-[#6B6B6B]">
                    <strong>Note:</strong> Featured dishes and drinks are configured separately in the Menu Editor.
                    This section only controls the labels and headings.
                  </p>
                </div>
              </>
            )}

            {/* HOME VISIT SECTION */}
            {activeSection === 'homeVisit' && (
              <>
                <div className="mb-6 pb-4 border-b border-[#E5E5E5]">
                  <h2 className="text-lg font-medium text-[#2C2C2C]">Visit Section</h2>
                  <p className="text-sm text-[#6B6B6B] mt-1">Location, hours, and directions information</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <ContentField
                    label="Section Title - Word 1"
                    description="First word of heading"
                    value={getValue(['homeVisit', 'headline1'])}
                    onChange={(val) => updateField(['homeVisit', 'headline1'], val)}
                    placeholder="FIND"
                  />
                  <ContentField
                    label="Section Title - Word 2"
                    description="Second word of heading"
                    value={getValue(['homeVisit', 'headline2'])}
                    onChange={(val) => updateField(['homeVisit', 'headline2'], val)}
                    placeholder="US"
                  />
                </div>

                <div className="mt-6 mb-4">
                  <h3 className="text-sm font-medium text-[#2C2C2C] mb-3">Opening Hours</h3>
                </div>

                <ContentField
                  label="Mon/Wed/Thu/Sun Hours"
                  description="Opening hours for these days"
                  value={getValue(['homeVisit', 'hours', 'monWedThuSun'])}
                  onChange={(val) => updateField(['homeVisit', 'hours', 'monWedThuSun'], val)}
                  placeholder="Mon, Wed, Thu, Sun: 12:30 – 23:00"
                />
                <ContentField
                  label="Friday/Saturday Hours"
                  description="Opening hours for weekend"
                  value={getValue(['homeVisit', 'hours', 'friSat'])}
                  onChange={(val) => updateField(['homeVisit', 'hours', 'friSat'], val)}
                  placeholder="Fri, Sat: 12:30 – 01:00"
                />
                <ContentField
                  label="Closed Days"
                  description="Days the restaurant is closed"
                  value={getValue(['homeVisit', 'hours', 'closed'])}
                  onChange={(val) => updateField(['homeVisit', 'hours', 'closed'], val)}
                  placeholder="Closed Tuesday"
                />

                <div className="mt-6 mb-4">
                  <h3 className="text-sm font-medium text-[#2C2C2C] mb-3">Address & Contact</h3>
                </div>

                <ContentField
                  label="Street Address"
                  description="Restaurant street address"
                  value={getValue(['homeVisit', 'address', 'street'])}
                  onChange={(val) => updateField(['homeVisit', 'address', 'street'], val)}
                  placeholder="Rua da Boavista 66"
                />
                <ContentField
                  label="City/Area"
                  description="City or neighborhood"
                  value={getValue(['homeVisit', 'address', 'city'])}
                  onChange={(val) => updateField(['homeVisit', 'address', 'city'], val)}
                  placeholder="Cais do Sodré, Lisboa"
                />
                <ContentField
                  label="Directions Button Text"
                  description="Text for the directions link"
                  value={getValue(['homeVisit', 'directions'])}
                  onChange={(val) => updateField(['homeVisit', 'directions'], val)}
                  placeholder="Get Directions"
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
                  description="Main heading for the call-to-action"
                  value={getValue(['cta', 'title'])}
                  onChange={(val) => updateField(['cta', 'title'], val)}
                  placeholder="Join Us at the Table"
                  required
                />
                <ContentField
                  label="CTA Subtitle"
                  description="Supporting text below the title"
                  value={getValue(['cta', 'subtitle'])}
                  onChange={(val) => updateField(['cta', 'subtitle'], val)}
                  multiline
                  placeholder="Experience Mediterranean flavours..."
                />
                <ContentField
                  label="Button Text"
                  description="Reservation button text"
                  value={getValue(['cta', 'button'])}
                  onChange={(val) => updateField(['cta', 'button'], val)}
                  placeholder="Reserve a Table"
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
