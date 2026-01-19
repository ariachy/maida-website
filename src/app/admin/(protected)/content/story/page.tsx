'use client';

import { useState, useEffect, useCallback } from 'react';
import LanguageTabs from '@/components/admin/LanguageTabs';
import ContentField from '@/components/admin/ContentField';
import { ToastContainer, useToast } from '@/components/admin/Toast';

interface LocaleData {
  [key: string]: any;
}

export default function StoryEditorPage() {
  const toast = useToast();
  
  const [enData, setEnData] = useState<LocaleData | null>(null);
  const [ptData, setPtData] = useState<LocaleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeLanguage, setActiveLanguage] = useState('en');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [activeSection, setActiveSection] = useState('story');

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
      toast.error('Failed to load story data');
    } finally {
      setLoading(false);
    }
  };

  const saveData = async () => {
    if (!enData || !ptData) return;

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
      toast.success('Story page saved successfully!');
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save story page');
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

  // Helper to create onChange handler for a specific path
  const createOnChange = useCallback((path: string[]) => {
    return (value: string) => updateField(path, value);
  }, [updateField]);

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
    { id: 'story', label: 'Introduction', description: 'Opening section with your concept' },
    { id: 'about', label: 'Our Journey', description: 'From Beirut to Lisboa + Founders' },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-serif text-[#2C2C2C]">Story Page Editor</h1>
          <p className="text-[#6B6B6B] mt-1">Edit the About/Story page content</p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href={`/${activeLanguage}/story`}
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

      {/* Language Tabs */}
      <div className="mb-6">
        <LanguageTabs
          activeLanguage={activeLanguage}
          onLanguageChange={setActiveLanguage}
        />
      </div>

      {/* Section Navigation */}
      <div className="flex gap-2 mb-6">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeSection === section.id
                ? 'bg-[#C4A484] text-white'
                : 'bg-white text-[#6B6B6B] hover:bg-[#F5F1EB]'
            }`}
          >
            {section.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="bg-white rounded-lg shadow-sm border border-[#E5E5E5]">
        <div className="p-6">
          {/* STORY / INTRODUCTION SECTION */}
          {activeSection === 'story' && (
            <>
              <div className="mb-6 pb-4 border-b border-[#E5E5E5]">
                <h2 className="text-lg font-medium text-[#2C2C2C]">Introduction Section</h2>
                <p className="text-sm text-[#6B6B6B] mt-1">The opening text explaining what Maída is about</p>
              </div>

              <ContentField 
                label="Section Label" 
                description="Small hashtag label above title (e.g., '#FromOurRoots')"
                value={getValue(['story', 'label'])}
                onChange={createOnChange(['story', 'label'])}
                placeholder="#FromOurRoots"
              />

              <div className="grid grid-cols-2 gap-4">
                <ContentField 
                  label="Title (regular part)" 
                  description="Normal text part of title"
                  value={getValue(['story', 'title'])}
                  onChange={createOnChange(['story', 'title'])}
                  placeholder="Where every meal is"
                  required
                />
                <ContentField 
                  label="Title (highlighted part)" 
                  description="Emphasized text in accent color"
                  value={getValue(['story', 'titleHighlight'])}
                  onChange={createOnChange(['story', 'titleHighlight'])}
                  placeholder="an invitation"
                  required
                />
              </div>

              <ContentField 
                label="First Paragraph" 
                description="Opening statement about Maída"
                value={getValue(['story', 'text1'])}
                onChange={createOnChange(['story', 'text1'])}
                multiline
                placeholder="Maída is more than a restaurant..."
                required
              />

              <ContentField 
                label="Second Paragraph" 
                description="Explanation of the name and concept"
                value={getValue(['story', 'text2'])}
                onChange={createOnChange(['story', 'text2'])}
                multiline
                placeholder="The word مائدة (ma'ida) means..."
                required
              />

              <ContentField 
                label="Button Text" 
                description="Call-to-action (if used)"
                value={getValue(['story', 'cta'])}
                onChange={createOnChange(['story', 'cta'])}
                placeholder="Read Our Story"
              />

              <div className="mt-6 mb-4">
                <h3 className="text-sm font-medium text-[#2C2C2C] mb-3">Arabic Word Feature</h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <ContentField 
                  label="Arabic Word" 
                  description="The Arabic word displayed"
                  value={getValue(['story', 'arabicWord'])}
                  onChange={createOnChange(['story', 'arabicWord'])}
                  placeholder="مائدة"
                />
                <ContentField 
                  label="Arabic Meaning" 
                  description="Translation of the Arabic word"
                  value={getValue(['story', 'arabicMeaning'])}
                  onChange={createOnChange(['story', 'arabicMeaning'])}
                  placeholder="The Gathering Table"
                />
              </div>
            </>
          )}

          {/* ABOUT / JOURNEY SECTION */}
          {activeSection === 'about' && (
            <>
              <div className="mb-6 pb-4 border-b border-[#E5E5E5]">
                <h2 className="text-lg font-medium text-[#2C2C2C]">Our Journey - From Beirut to Lisboa</h2>
                <p className="text-sm text-[#6B6B6B] mt-1">The story of how Maída came to be</p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <ContentField 
                  label="Headline Word 1" 
                  description="First word"
                  value={getValue(['about', 'rootsHeadline1'])}
                  onChange={createOnChange(['about', 'rootsHeadline1'])}
                  placeholder="FROM"
                />
                <ContentField 
                  label="Headline Word 2" 
                  description="Second word"
                  value={getValue(['about', 'rootsHeadline2'])}
                  onChange={createOnChange(['about', 'rootsHeadline2'])}
                  placeholder="BEIRUT TO"
                />
                <ContentField 
                  label="Headline Word 3" 
                  description="Third word"
                  value={getValue(['about', 'rootsHeadline3'])}
                  onChange={createOnChange(['about', 'rootsHeadline3'])}
                  placeholder="LISBOA"
                />
              </div>

              <ContentField 
                label="Journey Text - Paragraph 1" 
                description="About Lebanese dining culture"
                value={getValue(['about', 'rootsText1'])}
                onChange={createOnChange(['about', 'rootsText1'])}
                multiline
                placeholder="In Lebanon, meals are never rushed..."
                required
              />

              <ContentField 
                label="Journey Text - Paragraph 2" 
                description="Discovery of Portuguese similarity"
                value={getValue(['about', 'rootsText2'])}
                onChange={createOnChange(['about', 'rootsText2'])}
                multiline
                placeholder="When we arrived in Lisbon..."
                required
              />

              <ContentField 
                label="Journey Text - Paragraph 3" 
                description="What Maída represents"
                value={getValue(['about', 'rootsText3'])}
                onChange={createOnChange(['about', 'rootsText3'])}
                multiline
                placeholder="That's how two worlds became one..."
                required
              />

              <div className="mt-6 mb-4 pt-4 border-t border-[#E5E5E5]">
                <h3 className="text-sm font-medium text-[#2C2C2C] mb-3">Founders Section</h3>
              </div>

              <ContentField 
                label="Section Label" 
                description="Label above founders names"
                value={getValue(['about', 'foundersLabel'])}
                onChange={createOnChange(['about', 'foundersLabel'])}
                placeholder="Who we are"
              />

              <div className="grid grid-cols-2 gap-4">
                <ContentField 
                  label="Founders Headline 1" 
                  description="First part of names"
                  value={getValue(['about', 'foundersHeadline1'])}
                  onChange={createOnChange(['about', 'foundersHeadline1'])}
                  placeholder="ANNA &"
                />
                <ContentField 
                  label="Founders Headline 2" 
                  description="Second part"
                  value={getValue(['about', 'foundersHeadline2'])}
                  onChange={createOnChange(['about', 'foundersHeadline2'])}
                  placeholder="ANTHONY"
                />
              </div>

              <ContentField 
                label="About Anna" 
                description="Description of Anna"
                value={getValue(['about', 'foundersAnna'])}
                onChange={createOnChange(['about', 'foundersAnna'])}
                multiline
                placeholder="is a culinary and animation director by heart..."
                required
              />

              <ContentField 
                label="About Anthony" 
                description="Description of Anthony"
                value={getValue(['about', 'foundersAnthony'])}
                onChange={createOnChange(['about', 'foundersAnthony'])}
                multiline
                placeholder="is an electrical engineer and consultant by trade..."
                required
              />

              <ContentField 
                label="Their Story" 
                description="How they started Maída"
                value={getValue(['about', 'foundersStory'])}
                onChange={createOnChange(['about', 'foundersStory'])}
                multiline
                placeholder="After opening The Happy Salad..."
                required
              />

              <ContentField 
                label="Today" 
                description="Where they are now"
                value={getValue(['about', 'foundersToday'])}
                onChange={createOnChange(['about', 'foundersToday'])}
                multiline
                placeholder="Today, you'll find them where they belong..."
                required
              />

              <div className="mt-6 mb-4 pt-4 border-t border-[#E5E5E5]">
                <h3 className="text-sm font-medium text-[#2C2C2C] mb-3">Final Call-to-Action</h3>
              </div>

              <ContentField 
                label="CTA Title" 
                description="Main call-to-action text"
                value={getValue(['about', 'ctaTitle'])}
                onChange={createOnChange(['about', 'ctaTitle'])}
                placeholder="Find your place at the table"
              />

              <div className="grid grid-cols-2 gap-4">
                <ContentField 
                  label="Hashtag" 
                  description="Branded hashtag"
                  value={getValue(['about', 'ctaHashtag'])}
                  onChange={createOnChange(['about', 'ctaHashtag'])}
                  placeholder="#MeetMeAtMaída"
                />
                <ContentField 
                  label="Button Text" 
                  description="Reservation button"
                  value={getValue(['about', 'ctaButton'])}
                  onChange={createOnChange(['about', 'ctaButton'])}
                  placeholder="Book a table"
                />
              </div>
            </>
          )}
        </div>
      </div>

      <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />
    </div>
  );
}
