'use client';

import { useState, useEffect } from 'react';
import LanguageTabs from '@/components/admin/LanguageTabs';
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

  const updateField = (path: string[], value: string) => {
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
  };

  const getValue = (path: string[]): string => {
    const data = activeLanguage === 'en' ? enData : ptData;
    if (!data) return '';
    
    let current: any = data;
    for (const key of path) {
      if (current === undefined || current === null) return '';
      current = current[key];
    }
    return current || '';
  };

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

  const Field = ({ 
    label, 
    description, 
    path, 
    multiline = false,
    placeholder = '',
    required = false
  }: { 
    label: string; 
    description: string; 
    path: string[];
    multiline?: boolean;
    placeholder?: string;
    required?: boolean;
  }) => {
    const value = getValue(path);
    const isEmpty = required && !value.trim();
    
    return (
      <div className="mb-5">
        <label className="block text-sm font-medium text-[#2C2C2C] mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <p className="text-xs text-[#9CA3AF] mb-2">{description}</p>
        {multiline ? (
          <textarea
            value={value}
            onChange={(e) => updateField(path, e.target.value)}
            placeholder={placeholder}
            rows={3}
            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#C4A484] text-sm resize-none ${
              isEmpty ? 'border-red-300 bg-red-50' : 'border-[#D4C4B5]'
            }`}
          />
        ) : (
          <input
            type="text"
            value={value}
            onChange={(e) => updateField(path, e.target.value)}
            placeholder={placeholder}
            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#C4A484] text-sm ${
              isEmpty ? 'border-red-300 bg-red-50' : 'border-[#D4C4B5]'
            }`}
          />
        )}
        {isEmpty && (
          <p className="text-xs text-red-500 mt-1">This field is required</p>
        )}
      </div>
    );
  };

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
            {/* STORY INTRO SECTION */}
            {activeSection === 'story' && (
              <>
                <div className="mb-6 pb-4 border-b border-[#E5E5E5]">
                  <h2 className="text-lg font-medium text-[#2C2C2C]">Introduction Section</h2>
                  <p className="text-sm text-[#6B6B6B] mt-1">The opening text explaining what Maída is about</p>
                </div>

                <Field 
                  label="Section Label" 
                  description="Small hashtag label above title (e.g., '#FromOurRoots')"
                  path={['story', 'label']}
                  placeholder="#FromOurRoots"
                />

                <div className="grid grid-cols-2 gap-4">
                  <Field 
                    label="Title (regular part)" 
                    description="Normal text part of title"
                    path={['story', 'title']}
                    placeholder="Where every meal is"
                    required
                  />
                  <Field 
                    label="Title (highlighted part)" 
                    description="Emphasized text in accent color"
                    path={['story', 'titleHighlight']}
                    placeholder="an invitation"
                    required
                  />
                </div>

                <Field 
                  label="First Paragraph" 
                  description="Opening statement about Maída"
                  path={['story', 'text1']}
                  multiline
                  placeholder="Maída is more than a restaurant..."
                  required
                />

                <Field 
                  label="Second Paragraph" 
                  description="Explanation of the name and concept"
                  path={['story', 'text2']}
                  multiline
                  placeholder="The word مائدة (ma'ida) means..."
                  required
                />

                <Field 
                  label="Button Text" 
                  description="Call-to-action (if used)"
                  path={['story', 'cta']}
                  placeholder="Read Our Story"
                />

                <div className="mt-6 mb-4">
                  <h3 className="text-sm font-medium text-[#2C2C2C] mb-3">Arabic Word Feature</h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Field 
                    label="Arabic Word" 
                    description="The Arabic word displayed"
                    path={['story', 'arabicWord']}
                    placeholder="مائدة"
                  />
                  <Field 
                    label="Arabic Meaning" 
                    description="Translation of the Arabic word"
                    path={['story', 'arabicMeaning']}
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
                  <Field 
                    label="Headline Word 1" 
                    description="First word"
                    path={['about', 'rootsHeadline1']}
                    placeholder="FROM"
                  />
                  <Field 
                    label="Headline Word 2" 
                    description="Second word"
                    path={['about', 'rootsHeadline2']}
                    placeholder="BEIRUT TO"
                  />
                  <Field 
                    label="Headline Word 3" 
                    description="Third word"
                    path={['about', 'rootsHeadline3']}
                    placeholder="LISBOA"
                  />
                </div>

                <Field 
                  label="Journey Text - Paragraph 1" 
                  description="About Lebanese dining culture"
                  path={['about', 'rootsText1']}
                  multiline
                  placeholder="In Lebanon, meals are never rushed..."
                  required
                />

                <Field 
                  label="Journey Text - Paragraph 2" 
                  description="Discovery of Portuguese similarity"
                  path={['about', 'rootsText2']}
                  multiline
                  placeholder="When we arrived in Lisbon..."
                  required
                />

                <Field 
                  label="Journey Text - Paragraph 3" 
                  description="What Maída represents"
                  path={['about', 'rootsText3']}
                  multiline
                  placeholder="That's how two worlds became one..."
                  required
                />

                <div className="mt-6 mb-4 pt-4 border-t border-[#E5E5E5]">
                  <h3 className="text-sm font-medium text-[#2C2C2C] mb-3">Founders Section</h3>
                </div>

                <Field 
                  label="Section Label" 
                  description="Label above founders names"
                  path={['about', 'foundersLabel']}
                  placeholder="Who we are"
                />

                <div className="grid grid-cols-2 gap-4">
                  <Field 
                    label="Founders Headline 1" 
                    description="First part of names"
                    path={['about', 'foundersHeadline1']}
                    placeholder="ANNA &"
                  />
                  <Field 
                    label="Founders Headline 2" 
                    description="Second part"
                    path={['about', 'foundersHeadline2']}
                    placeholder="ANTHONY"
                  />
                </div>

                <Field 
                  label="About Anna" 
                  description="Description of Anna"
                  path={['about', 'foundersAnna']}
                  multiline
                  placeholder="is a culinary and animation director by heart..."
                  required
                />

                <Field 
                  label="About Anthony" 
                  description="Description of Anthony"
                  path={['about', 'foundersAnthony']}
                  multiline
                  placeholder="is an electrical engineer and consultant by trade..."
                  required
                />

                <Field 
                  label="Their Story" 
                  description="How they started Maída"
                  path={['about', 'foundersStory']}
                  multiline
                  placeholder="After opening The Happy Salad..."
                  required
                />

                <Field 
                  label="Today" 
                  description="Where they are now"
                  path={['about', 'foundersToday']}
                  multiline
                  placeholder="Today, you'll find them where they belong..."
                  required
                />

                <div className="mt-6 mb-4 pt-4 border-t border-[#E5E5E5]">
                  <h3 className="text-sm font-medium text-[#2C2C2C] mb-3">Final Call-to-Action</h3>
                </div>

                <Field 
                  label="CTA Title" 
                  description="Main call-to-action text"
                  path={['about', 'ctaTitle']}
                  placeholder="Find your place at the table"
                />

                <div className="grid grid-cols-2 gap-4">
                  <Field 
                    label="Hashtag" 
                    description="Branded hashtag"
                    path={['about', 'ctaHashtag']}
                    placeholder="#MeetMeAtMaída"
                  />
                  <Field 
                    label="Button Text" 
                    description="Reservation button"
                    path={['about', 'ctaButton']}
                    placeholder="Book a table"
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />
    </div>
  );
}
