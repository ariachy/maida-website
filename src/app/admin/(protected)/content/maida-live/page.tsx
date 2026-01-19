'use client';

import { useState, useEffect } from 'react';
import LanguageTabs from '@/components/admin/LanguageTabs';
import { ToastContainer, useToast } from '@/components/admin/Toast';

interface LocaleData {
  [key: string]: any;
}

export default function MaidaLiveEditorPage() {
  const toast = useToast();
  
  const [enData, setEnData] = useState<LocaleData | null>(null);
  const [ptData, setPtData] = useState<LocaleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeLanguage, setActiveLanguage] = useState('en');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');

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
      toast.error('Failed to load Maída Live data');
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
      toast.success('Maída Live saved successfully!');
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save Maída Live');
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

  const updateTheme = (index: number, field: 'week' | 'theme' | 'description', value: string) => {
    const setData = activeLanguage === 'en' ? setEnData : setPtData;
    
    setData((prev) => {
      if (!prev) return prev;
      
      const newData = JSON.parse(JSON.stringify(prev));
      if (!newData.maidaLive) newData.maidaLive = {};
      if (!newData.maidaLive.thursdayThemes) newData.maidaLive.thursdayThemes = [];
      if (!newData.maidaLive.thursdayThemes[index]) {
        newData.maidaLive.thursdayThemes[index] = { week: '', theme: '', description: '' };
      }
      newData.maidaLive.thursdayThemes[index][field] = value;
      return newData;
    });
    
    setHasUnsavedChanges(true);
  };

  const getThemeValue = (index: number, field: 'week' | 'theme' | 'description'): string => {
    const data = activeLanguage === 'en' ? enData : ptData;
    return data?.maidaLive?.thursdayThemes?.[index]?.[field] || '';
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
    { id: 'hero', label: 'Hero & CTA', description: 'Page title, tagline, and bottom CTA' },
    { id: 'labels', label: 'Section Labels', description: 'Common labels used throughout' },
    { id: 'nights', label: 'Event Nights', description: 'Thu/Fri/Sat descriptions' },
    { id: 'thursday', label: 'Thursday Themes', description: 'Monthly rotation schedule' },
    { id: 'private', label: 'Private Events', description: 'Private event section' },
    { id: 'dj', label: 'DJ Application', description: 'DJ application form labels' },
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
          <h1 className="text-3xl font-serif text-[#2C2C2C]">Maída Live Editor</h1>
          <p className="text-[#6B6B6B] mt-1">Edit the events page content</p>
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

                <Field label="Tagline" description="Small text above the title (e.g., 'Music • Culture • Atmosphere')" path={['maidaLive', 'heroTagline']} placeholder="Music • Culture • Atmosphere" />
                <Field label="Page Title" description="Main heading" path={['maidaLive', 'heroTitle']} placeholder="Maída Live" required />
                <Field label="Subtitle" description="Descriptive text below the title" path={['maidaLive', 'heroSubtitle']} multiline placeholder="Where dinner becomes an experience..." />

                <div className="mt-6 mb-4 pt-4 border-t border-[#E5E5E5]">
                  <h3 className="text-sm font-medium text-[#2C2C2C] mb-3">Bottom CTA Section</h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="CTA Title" description="Text before the highlighted part" path={['maidaLive', 'ctaTitle']} placeholder="An evolving atmosphere of food, drinks," />
                  <Field label="CTA Title (highlighted)" description="Emphasized text" path={['maidaLive', 'ctaTitleHighlight']} placeholder="and music" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="CTA Hashtag" description="Branded hashtag" path={['maidaLive', 'ctaHashtag']} placeholder="#MeetMeAtMaída" />
                  <Field label="CTA Button" description="Reservation button text" path={['maidaLive', 'ctaButton']} placeholder="Reserve a Table" />
                </div>
              </>
            )}

            {/* SECTION LABELS */}
            {activeSection === 'labels' && (
              <>
                <div className="mb-6 pb-4 border-b border-[#E5E5E5]">
                  <h2 className="text-lg font-medium text-[#2C2C2C]">Common Labels</h2>
                  <p className="text-sm text-[#6B6B6B] mt-1">Labels used throughout the events page</p>
                </div>

                <Field label="Weekly Program Title" description="Heading for the schedule section" path={['maidaLive', 'weeklyProgramTitle']} placeholder="Our weekly program" />
                <Field label="Monthly Rotation" description="Label for Thursday rotation" path={['maidaLive', 'monthlyRotation']} placeholder="Monthly Rotation" />
                <div className="grid grid-cols-2 gap-4">
                  <Field label="'Week' Label" description="Word for 'Week'" path={['maidaLive', 'week']} placeholder="Week" />
                  <Field label="'Hours' Label" description="Word for 'Hours'" path={['maidaLive', 'hours']} placeholder="Hours" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="'The Vibe' Label" description="Friday section label" path={['maidaLive', 'theVibe']} placeholder="The Vibe" />
                  <Field label="'The Journey' Label" description="Saturday section label" path={['maidaLive', 'theJourney']} placeholder="The Journey" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="'DJ Sets from' Label" description="Used before time" path={['maidaLive', 'djSetsFrom']} placeholder="DJ Sets from" />
                  <Field label="'Party Mode' Label" description="Saturday late night label" path={['maidaLive', 'partyMode']} placeholder="Party Mode" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="'From' Label" description="Used before time" path={['maidaLive', 'from']} placeholder="From" />
                  <Field label="'Click to collapse'" description="Expandable section hint" path={['maidaLive', 'clickToCollapse']} placeholder="Click to collapse" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="'Click to see schedule'" description="Thursday expand hint" path={['maidaLive', 'clickToSeeSchedule']} placeholder="Click to see schedule" />
                  <Field label="'Click to learn more'" description="General expand hint" path={['maidaLive', 'clickToLearnMore']} placeholder="Click to learn more" />
                </div>
              </>
            )}

            {/* EVENT NIGHTS */}
            {activeSection === 'nights' && (
              <>
                <div className="mb-6 pb-4 border-b border-[#E5E5E5]">
                  <h2 className="text-lg font-medium text-[#2C2C2C]">Event Nights</h2>
                  <p className="text-sm text-[#6B6B6B] mt-1">Descriptions for Thursday, Friday, and Saturday</p>
                </div>

                <div className="p-4 bg-[#F9F9F9] rounded-lg mb-4">
                  <h3 className="text-sm font-medium text-[#C4A484] mb-3">Thursday - Cultural Rotation</h3>
                  <Field label="Day Title" description="e.g., 'Thursdays'" path={['maidaLive', 'nights', 'thursday', 'title']} placeholder="Thursdays" />
                  <Field label="Day Subtitle" description="e.g., 'Cultural Rotation'" path={['maidaLive', 'nights', 'thursday', 'subtitle']} placeholder="Cultural Rotation" />
                  <Field label="Description" description="What happens on Thursdays" path={['maidaLive', 'nights', 'thursday', 'description']} multiline placeholder="Every Thursday brings a different flavour..." />
                </div>

                <div className="p-4 bg-[#F9F9F9] rounded-lg mb-4">
                  <h3 className="text-sm font-medium text-[#C4A484] mb-3">Friday - Dinner & DJ</h3>
                  <Field label="Day Title" description="e.g., 'Fridays'" path={['maidaLive', 'nights', 'friday', 'title']} placeholder="Fridays" />
                  <Field label="Day Subtitle" description="e.g., 'Dinner & DJ'" path={['maidaLive', 'nights', 'friday', 'subtitle']} placeholder="Dinner & DJ" />
                  <Field label="Description" description="What happens on Fridays" path={['maidaLive', 'nights', 'friday', 'description']} multiline placeholder="The weekend begins. Live DJ sets..." />
                  <Field label="'The Vibe' Expanded Description" description="More detail when expanded" path={['maidaLive', 'nights', 'friday', 'vibeDescription']} multiline placeholder="Not a party - an elevated dinner experience..." />
                </div>

                <div className="p-4 bg-[#F9F9F9] rounded-lg">
                  <h3 className="text-sm font-medium text-[#C4A484] mb-3">Saturday - The Full Journey</h3>
                  <Field label="Day Title" description="e.g., 'Saturdays'" path={['maidaLive', 'nights', 'saturday', 'title']} placeholder="Saturdays" />
                  <Field label="Day Subtitle" description="e.g., 'The Full Journey'" path={['maidaLive', 'nights', 'saturday', 'subtitle']} placeholder="The Full Journey" />
                  <Field label="Description" description="What happens on Saturdays" path={['maidaLive', 'nights', 'saturday', 'description']} multiline placeholder="The full journey - dinner, drinks, and dancing..." />
                  <Field label="'The Journey' Expanded Description" description="More detail when expanded" path={['maidaLive', 'nights', 'saturday', 'journeyDescription']} multiline placeholder="Start with dinner, stay for the party..." />
                </div>
              </>
            )}

            {/* THURSDAY THEMES */}
            {activeSection === 'thursday' && (
              <>
                <div className="mb-6 pb-4 border-b border-[#E5E5E5]">
                  <h2 className="text-lg font-medium text-[#2C2C2C]">Thursday Themes</h2>
                  <p className="text-sm text-[#6B6B6B] mt-1">Monthly rotation schedule for Thursday nights (4 weeks)</p>
                </div>

                {[0, 1, 2, 3].map((index) => (
                  <div key={index} className="p-4 bg-[#F9F9F9] rounded-lg mb-4">
                    <h3 className="text-sm font-medium text-[#C4A484] mb-3">Week {index + 1} Theme</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs text-[#6B6B6B] mb-1">Week Label</label>
                        <input
                          type="text"
                          value={getThemeValue(index, 'week')}
                          onChange={(e) => updateTheme(index, 'week', e.target.value)}
                          placeholder={`${index + 1}${['st', 'nd', 'rd', 'th'][index]}`}
                          className="w-full px-3 py-2 border border-[#D4C4B5] rounded-md focus:outline-none focus:ring-2 focus:ring-[#C4A484] text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-[#6B6B6B] mb-1">Theme Name</label>
                        <input
                          type="text"
                          value={getThemeValue(index, 'theme')}
                          onChange={(e) => updateTheme(index, 'theme', e.target.value)}
                          placeholder="Theme name"
                          className="w-full px-3 py-2 border border-[#D4C4B5] rounded-md focus:outline-none focus:ring-2 focus:ring-[#C4A484] text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-[#6B6B6B] mb-1">Description</label>
                        <input
                          type="text"
                          value={getThemeValue(index, 'description')}
                          onChange={(e) => updateTheme(index, 'description', e.target.value)}
                          placeholder="Brief description"
                          className="w-full px-3 py-2 border border-[#D4C4B5] rounded-md focus:outline-none focus:ring-2 focus:ring-[#C4A484] text-sm"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* PRIVATE EVENTS */}
            {activeSection === 'private' && (
              <>
                <div className="mb-6 pb-4 border-b border-[#E5E5E5]">
                  <h2 className="text-lg font-medium text-[#2C2C2C]">Private Events</h2>
                  <p className="text-sm text-[#6B6B6B] mt-1">Section for private event inquiries</p>
                </div>

                <Field label="Section Title" description="First word of heading" path={['maidaLive', 'privateEvents', 'title']} placeholder="Enjoying" />
                <Field label="Section Subtitle" description="Second part of heading" path={['maidaLive', 'privateEvents', 'subtitle']} placeholder="Make it private." />
                <Field label="Description" description="Text explaining private events" path={['maidaLive', 'privateEvents', 'description']} multiline placeholder="Host your next celebration, corporate event..." />
                <Field label="Button Text" description="CTA button text" path={['maidaLive', 'privateEvents', 'cta']} placeholder="Contact us" />
              </>
            )}

            {/* DJ APPLICATION */}
            {activeSection === 'dj' && (
              <>
                <div className="mb-6 pb-4 border-b border-[#E5E5E5]">
                  <h2 className="text-lg font-medium text-[#2C2C2C]">DJ Application</h2>
                  <p className="text-sm text-[#6B6B6B] mt-1">DJ application section and form labels</p>
                </div>

                <Field label="Section Title" description="Main heading" path={['maidaLive', 'djApplication', 'title']} placeholder="Are you a DJ?" />
                <Field label="Section Subtitle" description="Secondary heading" path={['maidaLive', 'djApplication', 'subtitle']} placeholder="Join our rotation." />
                <Field label="Description" description="Invitation text" path={['maidaLive', 'djApplication', 'description']} multiline placeholder="If your sound fits our vibe, we want to hear from you." />
                <Field label="Apply Button Text" description="Button to open form" path={['maidaLive', 'djApplication', 'cta']} placeholder="Apply to play" />

                <div className="mt-6 mb-4 pt-4 border-t border-[#E5E5E5]">
                  <h3 className="text-sm font-medium text-[#2C2C2C] mb-3">Form Labels</h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="Modal Title" description="Form popup title" path={['maidaLive', 'djApplication', 'form', 'modalTitle']} placeholder="DJ Application" />
                  <Field label="Modal Subtitle" description="Text before 'rotation'" path={['maidaLive', 'djApplication', 'form', 'modalSubtitle']} placeholder="Join the" />
                </div>
                <Field label="'Rotation' Word" description="Highlighted word in subtitle" path={['maidaLive', 'djApplication', 'form', 'rotation']} placeholder="rotation" />
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Name Field Label" description="Label for name input" path={['maidaLive', 'djApplication', 'form', 'name']} placeholder="Full name" />
                  <Field label="Name Placeholder" description="Placeholder text" path={['maidaLive', 'djApplication', 'form', 'namePlaceholder']} placeholder="Your name or DJ name" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Email Field Label" description="Label for email" path={['maidaLive', 'djApplication', 'form', 'email']} placeholder="Email" />
                  <Field label="Phone Field Label" description="Label for phone" path={['maidaLive', 'djApplication', 'form', 'phone']} placeholder="Phone" />
                </div>
                <Field label="Genres Field Label" description="Label for music genres" path={['maidaLive', 'djApplication', 'form', 'genres']} placeholder="Genres you play" />
                <Field label="Other Genres Placeholder" description="Placeholder for other genres" path={['maidaLive', 'djApplication', 'form', 'otherGenresPlaceholder']} placeholder="Other genres (optional)" />
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Music Link Label" description="Label for SoundCloud/mix link" path={['maidaLive', 'djApplication', 'form', 'musicLink']} placeholder="Music link (optional)" />
                  <Field label="Music Link Hint" description="Helper text below field" path={['maidaLive', 'djApplication', 'form', 'musicLinkHint']} placeholder="Share a link to your mixes or music" />
                </div>
                <Field label="Message Field Label" description="Label for bio/message" path={['maidaLive', 'djApplication', 'form', 'message']} placeholder="Tell us about yourself (optional)" />
                <Field label="Message Placeholder" description="Placeholder text" path={['maidaLive', 'djApplication', 'form', 'messagePlaceholder']} placeholder="Brief bio, experience, why Maída..." />
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Submit Button" description="Form submit button" path={['maidaLive', 'djApplication', 'form', 'submit']} placeholder="Submit application" />
                  <Field label="Sending State" description="Text while submitting" path={['maidaLive', 'djApplication', 'form', 'sending']} placeholder="Sending..." />
                </div>
                <Field label="Close Button" description="Close modal button" path={['maidaLive', 'djApplication', 'form', 'close']} placeholder="Close" />

                <div className="mt-6 mb-4 pt-4 border-t border-[#E5E5E5]">
                  <h3 className="text-sm font-medium text-[#2C2C2C] mb-3">Form Messages</h3>
                </div>

                <Field label="Success Title" description="Shown after successful submission" path={['maidaLive', 'djApplication', 'form', 'successTitle']} placeholder="Application sent!" />
                <Field label="Success Message" description="Success confirmation text" path={['maidaLive', 'djApplication', 'form', 'successMessage']} multiline placeholder="Thanks for your interest! We'll review..." />
                <Field label="Validation Error" description="Shown if required fields missing" path={['maidaLive', 'djApplication', 'form', 'validationError']} placeholder="Please fill in all required fields..." />
                <Field label="Error Message" description="Generic error message" path={['maidaLive', 'djApplication', 'form', 'error']} placeholder="Something went wrong. Please try again." />
                <Field label="Network Error" description="Connection error message" path={['maidaLive', 'djApplication', 'form', 'networkError']} placeholder="Network error. Please try again." />
                <Field label="Privacy Note" description="Privacy disclaimer text" path={['maidaLive', 'djApplication', 'form', 'privacyNote']} placeholder="By submitting, you agree to be contacted..." />
              </>
            )}
          </div>
        </div>
      </div>

      <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />
    </div>
  );
}
