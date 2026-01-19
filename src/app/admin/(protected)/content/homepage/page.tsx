'use client';

import { useState, useEffect } from 'react';
import LanguageTabs from '@/components/admin/LanguageTabs';
import { ToastContainer, useToast } from '@/components/admin/Toast';

interface LocaleData {
  [key: string]: any;
}

// Required fields for validation
const REQUIRED_FIELDS: Record<string, string[][]> = {
  hero: [
    ['hero', 'title1'],
    ['hero', 'title2'],
    ['hero', 'subtitle'],
  ],
  homeStory: [
    ['homeStory', 'title'],
    ['homeStory', 'text'],
  ],
  homeCta: [
    ['homeCta', 'title'],
    ['homeCta', 'button'],
  ],
};

export default function HomepageEditorPage() {
  const toast = useToast();
  
  const [enData, setEnData] = useState<LocaleData | null>(null);
  const [ptData, setPtData] = useState<LocaleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeLanguage, setActiveLanguage] = useState('en');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');
  const [validationErrors, setValidationErrors] = useState<Set<string>>(new Set());

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
      toast.error('Failed to load homepage data');
    } finally {
      setLoading(false);
    }
  };

  const saveData = async () => {
    if (!enData || !ptData) return;

    // Validate required fields
    const errors = new Set<string>();
    Object.entries(REQUIRED_FIELDS).forEach(([section, fields]) => {
      fields.forEach((path) => {
        const enValue = getValueFromData(enData, path);
        const ptValue = getValueFromData(ptData, path);
        if (!enValue || !ptValue) {
          errors.add(path.join('.'));
        }
      });
    });

    if (errors.size > 0) {
      setValidationErrors(errors);
      toast.error('Please fill in all required fields in both languages');
      return;
    }

    setValidationErrors(new Set());
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
      toast.success('Homepage saved successfully!');
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save homepage');
    } finally {
      setSaving(false);
    }
  };

  // Helper to get value from specific data object
  const getValueFromData = (data: LocaleData, path: string[]): string => {
    let current: any = data;
    for (const key of path) {
      if (current === undefined || current === null) return '';
      current = current[key];
    }
    return current || '';
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
    { id: 'hero', label: 'Hero Section', description: 'The main banner visitors see first' },
    { id: 'homeStory', label: 'Story Preview', description: 'Brief intro to your story on homepage' },
    { id: 'homeMenu', label: 'Menu Preview', description: 'Featured dishes & drinks section' },
    { id: 'homeVisit', label: 'Visit Section', description: 'Hours and location info' },
    { id: 'homeCta', label: 'Final Call-to-Action', description: 'Bottom reservation prompt' },
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

                <Field label="Badge Text" description="Small label above the main title (e.g., 'Restaurant-bar')" path={['hero', 'badge']} />
                <Field label="Location" description="Location shown below the badge (e.g., 'Cais do Sodré, Lisboa')" path={['hero', 'location']} />

                <div className="grid grid-cols-2 gap-4">
                  <Field label="Main Title - Line 1" description="First line of the big headline" path={['hero', 'title1']} placeholder="Mediterranean Flavours." required />
                  <Field label="Main Title - Line 2" description="Second line of the big headline" path={['hero', 'title2']} placeholder="Lebanese Soul." required />
                </div>

                <Field label="Subtitle" description="Descriptive text below the main title" path={['hero', 'subtitle']} multiline required />

                <div className="grid grid-cols-2 gap-4">
                  <Field label="Primary Button Text" description="Main call-to-action button" path={['hero', 'cta']} placeholder="Reserve a Table" />
                  <Field label="Secondary Button Text" description="Link to menu page" path={['hero', 'viewMenu']} placeholder="View Menu" />
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
                  <Field label="Headline Word 1" description="First word in stacked headline" path={['homeStory', 'headline1']} placeholder="FROM" />
                  <Field label="Headline Word 2" description="Second word" path={['homeStory', 'headline2']} placeholder="OUR" />
                  <Field label="Headline Word 3" description="Third word" path={['homeStory', 'headline3']} placeholder="ROOTS" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="Title (regular part)" description="Normal text part of title" path={['homeStory', 'title']} placeholder="Where every meal is" />
                  <Field label="Title (highlighted part)" description="Emphasized part shown in accent color" path={['homeStory', 'titleHighlight']} placeholder="an invitation" />
                </div>

                <Field label="Story Text" description="Main paragraph explaining your concept" path={['homeStory', 'text']} multiline required />
                <Field label="Button Text" description="Link to full story page" path={['homeStory', 'cta']} placeholder="Read Our Story" />
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
                  <Field label="Section Title - Line 1" description="First line of section heading" path={['homeMenu', 'title1']} placeholder="A TASTE" />
                  <Field label="Section Title - Line 2" description="Second line of section heading" path={['homeMenu', 'title2']} placeholder="OF MAÍDA" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="Kitchen Tab Label" description="Label for food items tab" path={['homeMenu', 'fromKitchen']} placeholder="From our kitchen" />
                  <Field label="Bar Tab Label" description="Label for drinks tab" path={['homeMenu', 'fromBar']} placeholder="From our bar" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="Menu Button Text" description="Link to full menu page" path={['homeMenu', 'fullMenu']} placeholder="Full Menu" />
                  <Field label="Image Placeholder Text" description="Shown when dish image is missing" path={['homeMenu', 'imageComingSoon']} placeholder="Image coming soon" />
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
                  <Field label="Section Title - Word 1" description="First word of heading" path={['homeVisit', 'headline1']} placeholder="FIND" />
                  <Field label="Section Title - Word 2" description="Second word of heading" path={['homeVisit', 'headline2']} placeholder="US" />
                </div>

                <div className="mt-6 mb-4">
                  <h3 className="text-sm font-medium text-[#2C2C2C] mb-3">Opening Hours</h3>
                </div>

                <Field label="Mon/Wed/Thu/Sun Hours" description="Opening hours for these days" path={['homeVisit', 'hours', 'monWedThuSun']} placeholder="Mon, Wed, Thu, Sun: 12:30 – 23:00" />
                <Field label="Friday Hours" description="Opening hours for Friday" path={['homeVisit', 'hours', 'friday']} placeholder="Friday: 12:30 – 01:00" />
                <Field label="Saturday Hours" description="Opening hours for Saturday" path={['homeVisit', 'hours', 'saturday']} placeholder="Saturday: 12:30 – 01:00" />
                <Field label="Closed Day" description="Which day you're closed" path={['homeVisit', 'hours', 'closed']} placeholder="Tuesday: Closed" />
                <Field label="Kitchen Note" description="Note about kitchen closing time" path={['homeVisit', 'hours', 'kitchenCloses']} placeholder="Kitchen closes" />

                <div className="mt-6 mb-4">
                  <h3 className="text-sm font-medium text-[#2C2C2C] mb-3">Address</h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="Street Address" description="Street name and number" path={['homeVisit', 'address', 'street']} placeholder="Rua da Boavista 66" />
                  <Field label="Postal Code & City" description="Postal code and city" path={['homeVisit', 'address', 'postal']} placeholder="1200-068 Lisboa" />
                </div>

                <Field label="Directions Button Text" description="Text for directions link" path={['homeVisit', 'directions']} placeholder="Directions" />
              </>
            )}

            {/* HOME CTA SECTION */}
            {activeSection === 'homeCta' && (
              <>
                <div className="mb-6 pb-4 border-b border-[#E5E5E5]">
                  <h2 className="text-lg font-medium text-[#2C2C2C]">Final Call-to-Action</h2>
                  <p className="text-sm text-[#6B6B6B] mt-1">Bottom section prompting visitors to make a reservation</p>
                </div>

                <Field label="Title" description="Main text encouraging reservation" path={['homeCta', 'title']} placeholder="Your table is waiting" required />
                <Field label="Hashtag / Subtitle" description="Branded hashtag shown below title" path={['homeCta', 'subtitle']} placeholder="#MeetMeAtMaída" />
                <Field label="Button Text" description="Reservation button text" path={['homeCta', 'button']} placeholder="Reserve a Table" />
              </>
            )}
          </div>
        </div>
      </div>

      <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />
    </div>
  );
}
