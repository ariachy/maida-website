'use client';

import { useState, useEffect, useCallback } from 'react';
import LanguageTabs from '@/components/admin/LanguageTabs';
import ContentField from '@/components/admin/ContentField';
import { ToastContainer, useToast } from '@/components/admin/Toast';
import RebuildModal from '@/components/admin/RebuildModal';

interface LocaleData {
  [key: string]: any;
}

export default function MaidaLiveEditorPage() {
  const toast = useToast();
  
  const [enData, setEnData] = useState<LocaleData | null>(null);
  const [ptData, setPtData] = useState<LocaleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeLanguage, setActiveLanguage] = useState<'en' | 'pt'>('en');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');
  const [showRebuildModal, setShowRebuildModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

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

  const loadData = async () => {
    setLoading(true);
    try {
      const [enRes, ptRes] = await Promise.all([
        fetch('/api/admin/content/locales/en.json'),
        fetch('/api/admin/content/locales/pt.json'),
      ]);

      if (!enRes.ok || !ptRes.ok) throw new Error('Failed to load data');

      const [enJson, ptJson] = await Promise.all([enRes.json(), ptRes.json()]);
      setEnData(enJson.data);
      setPtData(ptJson.data);
    } catch (error) {
      console.error('Load error:', error);
      toast.error('Failed to load Maída Sessions data');
    } finally {
      setLoading(false);
    }
  };

  const saveData = async (): Promise<boolean> => {
    if (!enData || !ptData) return false;

    setSaving(true);
    try {
      const results = await Promise.all([
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

      if (!results.every((r) => r.ok)) throw new Error('Failed to save');

      setHasUnsavedChanges(false);
      return true;
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save Maída Sessions');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const saveAndPublish = async () => {
    const saved = await saveData();
    if (saved) {
      setShowRebuildModal(true);
    }
  };

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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C4A484]" />
      </div>
    );
  }

  if (!enData || !ptData) {
    return (
      <div className="text-center py-12">
        <p className="text-[#6B6B6B]">Failed to load data</p>
        <button onClick={loadData} className="mt-4 px-4 py-2 bg-[#C4A484] text-white rounded-md">
          Retry
        </button>
      </div>
    );
  }

  const sections = [
    { id: 'hero', label: 'Page Header', description: 'Title and intro' },
    { id: 'nights', label: 'Night Cards', description: 'Thu/Fri/Sat descriptions' },
    { id: 'events', label: 'Private Events', description: 'Events section' },
    { id: 'dj', label: 'DJ Application', description: 'DJ form section' },
  ];

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
          <h1 className="text-3xl font-serif text-[#2C2C2C]">Maída Sessions Editor</h1>
          <p className="text-[#6B6B6B] mt-1">Edit the Maída Sessions page content</p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href={`/${activeLanguage}/maida-sessions`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 border border-[#D4C4B5] rounded-md text-[#6B6B6B] hover:bg-[#F5F1EB] transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            View Page
          </a>
          
          {/* Save Draft Button */}
          <button
            onClick={saveData}
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
          <LanguageTabs activeLanguage={activeLanguage} onLanguageChange={(lang) => setActiveLanguage(lang as 'en' | 'pt')} />

          <div className="p-6">
            {/* HERO SECTION */}
            {activeSection === 'hero' && (
              <>
                <div className="mb-6 pb-4 border-b border-[#E5E5E5]">
                  <h2 className="text-lg font-medium text-[#2C2C2C]">Page Header</h2>
                  <p className="text-sm text-[#6B6B6B] mt-1">Title and introduction text</p>
                </div>

                <ContentField
                  label="Tagline"
                  description="Small line above the title (the title itself is the fixed brand name)"
                  value={getValue(['maidaLive', 'heroTagline'])}
                  onChange={(val) => updateField(['maidaLive', 'heroTagline'], val)}
                  placeholder="Music • Culture • Atmosphere"
                />
                <ContentField
                  label="Subtitle"
                  description="Supporting text below title"
                  value={getValue(['maidaLive', 'heroSubtitle'])}
                  onChange={(val) => updateField(['maidaLive', 'heroSubtitle'], val)}
                  multiline
                  placeholder="Where dinner becomes an experience. Music, culture, and atmosphere."
                />
              </>
            )}

            {/* NIGHTS SECTION */}
            {activeSection === 'nights' && (
              <>
                <div className="mb-6 pb-4 border-b border-[#E5E5E5]">
                  <h2 className="text-lg font-medium text-[#2C2C2C]">Night Cards</h2>
                  <p className="text-sm text-[#6B6B6B] mt-1">Descriptions for each night</p>
                </div>

                <div className="space-y-8">
                  {/* Thursday */}
                  <div className="p-4 border border-[#E5E5E5] rounded-lg">
                    <h3 className="font-medium text-[#2C2C2C] mb-4">Thursday</h3>
                    <ContentField
                      label="Title"
                      description="Night theme"
                      value={getValue(['maidaLive', 'nights', 'thursday', 'title'])}
                      onChange={(val) => updateField(['maidaLive', 'nights', 'thursday', 'title'], val)}
                      placeholder="Cultural Rotation"
                    />
                    <ContentField
                      label="Description"
                      description="What happens on Thursday"
                      value={getValue(['maidaLive', 'nights', 'thursday', 'description'])}
                      onChange={(val) => updateField(['maidaLive', 'nights', 'thursday', 'description'], val)}
                      multiline
                      placeholder="Each week brings something new..."
                    />
                  </div>

                  {/* Friday */}
                  <div className="p-4 border border-[#E5E5E5] rounded-lg">
                    <h3 className="font-medium text-[#2C2C2C] mb-4">Friday</h3>
                    <ContentField
                      label="Title"
                      description="Night theme"
                      value={getValue(['maidaLive', 'nights', 'friday', 'title'])}
                      onChange={(val) => updateField(['maidaLive', 'nights', 'friday', 'title'], val)}
                      placeholder="DJ Night"
                    />
                    <ContentField
                      label="Description"
                      description="What happens on Friday"
                      value={getValue(['maidaLive', 'nights', 'friday', 'description'])}
                      onChange={(val) => updateField(['maidaLive', 'nights', 'friday', 'description'], val)}
                      multiline
                      placeholder="Our resident and guest DJs..."
                    />
                  </div>

                  {/* Saturday */}
                  <div className="p-4 border border-[#E5E5E5] rounded-lg">
                    <h3 className="font-medium text-[#2C2C2C] mb-4">Saturday</h3>
                    <ContentField
                      label="Title"
                      description="Night theme"
                      value={getValue(['maidaLive', 'nights', 'saturday', 'title'])}
                      onChange={(val) => updateField(['maidaLive', 'nights', 'saturday', 'title'], val)}
                      placeholder="Live Music"
                    />
                    <ContentField
                      label="Description"
                      description="What happens on Saturday"
                      value={getValue(['maidaLive', 'nights', 'saturday', 'description'])}
                      onChange={(val) => updateField(['maidaLive', 'nights', 'saturday', 'description'], val)}
                      multiline
                      placeholder="Live performances from local and..."
                    />
                  </div>
                </div>
              </>
            )}

            {/* PRIVATE EVENTS */}
            {activeSection === 'events' && (
              <>
                <div className="mb-6 pb-4 border-b border-[#E5E5E5]">
                  <h2 className="text-lg font-medium text-[#2C2C2C]">Private Events Section</h2>
                  <p className="text-sm text-[#6B6B6B] mt-1">Information about hosting events</p>
                </div>

                <ContentField
                  label="Section Title"
                  description="Heading for events section"
                  value={getValue(['maidaLive', 'privateEvents', 'title'])}
                  onChange={(val) => updateField(['maidaLive', 'privateEvents', 'title'], val)}
                  placeholder="Private Events"
                />
                <ContentField
                  label="Description"
                  description="What you offer for private events"
                  value={getValue(['maidaLive', 'privateEvents', 'description'])}
                  onChange={(val) => updateField(['maidaLive', 'privateEvents', 'description'], val)}
                  multiline
                  placeholder="From intimate celebrations to..."
                />
                <ContentField
                  label="Button Text"
                  description="CTA button text"
                  value={getValue(['maidaLive', 'privateEvents', 'cta'])}
                  onChange={(val) => updateField(['maidaLive', 'privateEvents', 'cta'], val)}
                  placeholder="Inquire Now"
                />
              </>
            )}

            {/* DJ APPLICATION */}
            {activeSection === 'dj' && (
              <>
                <div className="mb-6 pb-4 border-b border-[#E5E5E5]">
                  <h2 className="text-lg font-medium text-[#2C2C2C]">DJ Application Section</h2>
                  <p className="text-sm text-[#6B6B6B] mt-1">Form for DJs to apply</p>
                </div>

                <ContentField
                  label="Section Title"
                  description="Heading for DJ section"
                  value={getValue(['maidaLive', 'djApplication', 'title'])}
                  onChange={(val) => updateField(['maidaLive', 'djApplication', 'title'], val)}
                  placeholder="Spin at Maída"
                />
                <ContentField
                  label="Description"
                  description="What you're looking for"
                  value={getValue(['maidaLive', 'djApplication', 'description'])}
                  onChange={(val) => updateField(['maidaLive', 'djApplication', 'description'], val)}
                  multiline
                  placeholder="We're always looking for talented DJs..."
                />
                <ContentField
                  label="Button Text"
                  description="Application button text"
                  value={getValue(['maidaLive', 'djApplication', 'cta'])}
                  onChange={(val) => updateField(['maidaLive', 'djApplication', 'cta'], val)}
                  placeholder="Apply to DJ"
                />

                <div className="mt-6 mb-4">
                  <h3 className="text-sm font-medium text-[#2C2C2C] mb-3">Form Labels</h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <ContentField
                    label="Name Label"
                    description="Label for name field"
                    value={getValue(['maidaLive', 'djApplication', 'form', 'name'])}
                    onChange={(val) => updateField(['maidaLive', 'djApplication', 'form', 'name'], val)}
                    placeholder="Name"
                  />
                  <ContentField
                    label="Email Label"
                    description="Label for email field"
                    value={getValue(['maidaLive', 'djApplication', 'form', 'email'])}
                    onChange={(val) => updateField(['maidaLive', 'djApplication', 'form', 'email'], val)}
                    placeholder="Email"
                  />
                </div>
                <ContentField
                  label="SoundCloud/Mixcloud Label"
                  description="Label for music link field"
                  value={getValue(['maidaLive', 'djApplication', 'form', 'link'])}
                  onChange={(val) => updateField(['maidaLive', 'djApplication', 'form', 'link'], val)}
                  placeholder="SoundCloud / Mixcloud Link"
                />
                <ContentField
                  label="Message Label"
                  description="Label for message field"
                  value={getValue(['maidaLive', 'djApplication', 'form', 'message'])}
                  onChange={(val) => updateField(['maidaLive', 'djApplication', 'form', 'message'], val)}
                  placeholder="Tell us about your style"
                />
                <ContentField
                  label="Submit Button"
                  description="Form submit button text"
                  value={getValue(['maidaLive', 'djApplication', 'form', 'submit'])}
                  onChange={(val) => updateField(['maidaLive', 'djApplication', 'form', 'submit'], val)}
                  placeholder="Submit Application"
                />
              </>
            )}
          </div>
        </div>
      </div>

      <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />
    </div>
  );
}
