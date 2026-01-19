'use client';

import { useState, useEffect, useCallback } from 'react';
import LanguageTabs from '@/components/admin/LanguageTabs';
import ContentField from '@/components/admin/ContentField';

interface LocaleData {
  [key: string]: any;
}

export default function ContactEditorPage() {
  const [enData, setEnData] = useState<LocaleData | null>(null);
  const [ptData, setPtData] = useState<LocaleData | null>(null);
  const [activeLanguage, setActiveLanguage] = useState<'en' | 'pt'>('en');
  const [activeSection, setActiveSection] = useState('header');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Sections for navigation
  const sections = [
    { id: 'header', label: 'Page Header', description: 'Title and subtitle' },
    { id: 'form', label: 'Contact Form', description: 'Form labels and messages' },
    { id: 'info', label: 'Contact Info', description: 'Address, phone, email' },
    { id: 'hours', label: 'Opening Hours', description: 'Schedule display' },
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
        showToast('success', 'Contact page saved successfully');
      } else {
        showToast('error', 'Failed to save changes');
      }
    } catch (error) {
      console.error('Save error:', error);
      showToast('error', 'Failed to save contact page');
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
          <h1 className="text-3xl font-serif text-[#2C2C2C]">Contact Editor</h1>
          <p className="text-[#6B6B6B] mt-1">Edit the contact page content</p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href={`/${activeLanguage}/contact`}
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
            {/* PAGE HEADER */}
            {activeSection === 'header' && (
              <>
                <div className="mb-6 pb-4 border-b border-[#E5E5E5]">
                  <h2 className="text-lg font-medium text-[#2C2C2C]">Page Header</h2>
                  <p className="text-sm text-[#6B6B6B] mt-1">Main title and subtitle at the top of the contact page</p>
                </div>

                <ContentField
                  label="Page Title"
                  description="Main heading (e.g., 'Get in Touch')"
                  value={getValue(['contact', 'title'])}
                  onChange={(val) => updateField(['contact', 'title'], val)}
                  placeholder="Get in Touch"
                  required
                />
                <ContentField
                  label="Page Subtitle"
                  description="Text below the title"
                  value={getValue(['contact', 'subtitle'])}
                  onChange={(val) => updateField(['contact', 'subtitle'], val)}
                  placeholder="We'd love to hear from you"
                />
              </>
            )}

            {/* CONTACT FORM */}
            {activeSection === 'form' && (
              <>
                <div className="mb-6 pb-4 border-b border-[#E5E5E5]">
                  <h2 className="text-lg font-medium text-[#2C2C2C]">Contact Form Labels</h2>
                  <p className="text-sm text-[#6B6B6B] mt-1">Labels and messages for the contact form</p>
                </div>

                <ContentField
                  label="Form Title"
                  description="Heading above the form"
                  value={getValue(['contact', 'form', 'title'])}
                  onChange={(val) => updateField(['contact', 'form', 'title'], val)}
                  placeholder="Send us a message"
                />

                <div className="grid grid-cols-2 gap-4">
                  <ContentField
                    label="Name Field Label"
                    description="Label for name input"
                    value={getValue(['contact', 'form', 'name'])}
                    onChange={(val) => updateField(['contact', 'form', 'name'], val)}
                    placeholder="Your name"
                  />
                  <ContentField
                    label="Email Field Label"
                    description="Label for email input"
                    value={getValue(['contact', 'form', 'email'])}
                    onChange={(val) => updateField(['contact', 'form', 'email'], val)}
                    placeholder="Email address"
                  />
                </div>

                <ContentField
                  label="Subject Field Label"
                  description="Label for subject dropdown"
                  value={getValue(['contact', 'form', 'subject'])}
                  onChange={(val) => updateField(['contact', 'form', 'subject'], val)}
                  placeholder="Subject"
                />
                <ContentField
                  label="Message Field Label"
                  description="Label for message textarea"
                  value={getValue(['contact', 'form', 'message'])}
                  onChange={(val) => updateField(['contact', 'form', 'message'], val)}
                  placeholder="Message"
                />
                <ContentField
                  label="Message Placeholder"
                  description="Placeholder text in the message field"
                  value={getValue(['contact', 'form', 'placeholder'])}
                  onChange={(val) => updateField(['contact', 'form', 'placeholder'], val)}
                  placeholder="How can we help you?"
                />
                <ContentField
                  label="Submit Button Text"
                  description="Text on the send button"
                  value={getValue(['contact', 'form', 'send'])}
                  onChange={(val) => updateField(['contact', 'form', 'send'], val)}
                  placeholder="Send Message"
                />

                <div className="mt-6 mb-4 pt-4 border-t border-[#E5E5E5]">
                  <h3 className="text-sm font-medium text-[#2C2C2C] mb-3">Form Messages</h3>
                </div>

                <ContentField
                  label="Success Message"
                  description="Shown after successful submission"
                  value={getValue(['contact', 'form', 'success'])}
                  onChange={(val) => updateField(['contact', 'form', 'success'], val)}
                  placeholder="Thank you! We'll be in touch soon."
                />
                <ContentField
                  label="Error Message"
                  description="Shown if submission fails"
                  value={getValue(['contact', 'form', 'error'])}
                  onChange={(val) => updateField(['contact', 'form', 'error'], val)}
                  placeholder="Something went wrong. Please try again."
                />
              </>
            )}

            {/* CONTACT INFO */}
            {activeSection === 'info' && (
              <>
                <div className="mb-6 pb-4 border-b border-[#E5E5E5]">
                  <h2 className="text-lg font-medium text-[#2C2C2C]">Contact Information</h2>
                  <p className="text-sm text-[#6B6B6B] mt-1">Address, phone, and email displayed on the page</p>
                </div>

                <ContentField
                  label="Info Section Title"
                  description="Heading for contact info section"
                  value={getValue(['contact', 'info', 'title'])}
                  onChange={(val) => updateField(['contact', 'info', 'title'], val)}
                  placeholder="Contact Information"
                />

                <div className="mt-4 mb-4">
                  <h3 className="text-sm font-medium text-[#2C2C2C] mb-3">Address</h3>
                </div>

                <ContentField
                  label="Address Label"
                  description="Label for address section"
                  value={getValue(['contact', 'info', 'addressLabel'])}
                  onChange={(val) => updateField(['contact', 'info', 'addressLabel'], val)}
                  placeholder="Address"
                />
                <ContentField
                  label="Street Address"
                  description="Street and number"
                  value={getValue(['contact', 'info', 'address', 'street'])}
                  onChange={(val) => updateField(['contact', 'info', 'address', 'street'], val)}
                  placeholder="Rua da Boavista 66"
                />
                <ContentField
                  label="City"
                  description="City and area"
                  value={getValue(['contact', 'info', 'address', 'city'])}
                  onChange={(val) => updateField(['contact', 'info', 'address', 'city'], val)}
                  placeholder="Cais do Sodré, Lisboa"
                />

                <div className="mt-6 mb-4">
                  <h3 className="text-sm font-medium text-[#2C2C2C] mb-3">Phone & Email</h3>
                </div>

                <ContentField
                  label="Phone Label"
                  description="Label for phone number"
                  value={getValue(['contact', 'info', 'phoneLabel'])}
                  onChange={(val) => updateField(['contact', 'info', 'phoneLabel'], val)}
                  placeholder="Phone"
                />
                <ContentField
                  label="Phone Number"
                  description="Restaurant phone number"
                  value={getValue(['contact', 'info', 'phone'])}
                  onChange={(val) => updateField(['contact', 'info', 'phone'], val)}
                  placeholder="+351 XXX XXX XXX"
                />
                <ContentField
                  label="Email Label"
                  description="Label for email address"
                  value={getValue(['contact', 'info', 'emailLabel'])}
                  onChange={(val) => updateField(['contact', 'info', 'emailLabel'], val)}
                  placeholder="Email"
                />
                <ContentField
                  label="Email Address"
                  description="Restaurant email"
                  value={getValue(['contact', 'info', 'email'])}
                  onChange={(val) => updateField(['contact', 'info', 'email'], val)}
                  placeholder="hello@maida.pt"
                />
              </>
            )}

            {/* OPENING HOURS */}
            {activeSection === 'hours' && (
              <>
                <div className="mb-6 pb-4 border-b border-[#E5E5E5]">
                  <h2 className="text-lg font-medium text-[#2C2C2C]">Opening Hours</h2>
                  <p className="text-sm text-[#6B6B6B] mt-1">Schedule displayed on the contact page</p>
                </div>

                <ContentField
                  label="Hours Section Title"
                  description="Heading for hours section"
                  value={getValue(['contact', 'hours', 'title'])}
                  onChange={(val) => updateField(['contact', 'hours', 'title'], val)}
                  placeholder="Opening Hours"
                />

                <ContentField
                  label="Monday"
                  description="Monday hours or 'Closed'"
                  value={getValue(['contact', 'hours', 'monday'])}
                  onChange={(val) => updateField(['contact', 'hours', 'monday'], val)}
                  placeholder="Closed"
                />
                <ContentField
                  label="Tuesday"
                  description="Tuesday hours or 'Closed'"
                  value={getValue(['contact', 'hours', 'tuesday'])}
                  onChange={(val) => updateField(['contact', 'hours', 'tuesday'], val)}
                  placeholder="Closed"
                />
                <ContentField
                  label="Wednesday"
                  description="Wednesday hours"
                  value={getValue(['contact', 'hours', 'wednesday'])}
                  onChange={(val) => updateField(['contact', 'hours', 'wednesday'], val)}
                  placeholder="12:30 – 23:00"
                />
                <ContentField
                  label="Thursday"
                  description="Thursday hours"
                  value={getValue(['contact', 'hours', 'thursday'])}
                  onChange={(val) => updateField(['contact', 'hours', 'thursday'], val)}
                  placeholder="12:30 – 23:00"
                />
                <ContentField
                  label="Friday"
                  description="Friday hours"
                  value={getValue(['contact', 'hours', 'friday'])}
                  onChange={(val) => updateField(['contact', 'hours', 'friday'], val)}
                  placeholder="12:30 – 01:00"
                />
                <ContentField
                  label="Saturday"
                  description="Saturday hours"
                  value={getValue(['contact', 'hours', 'saturday'])}
                  onChange={(val) => updateField(['contact', 'hours', 'saturday'], val)}
                  placeholder="12:30 – 01:00"
                />
                <ContentField
                  label="Sunday"
                  description="Sunday hours"
                  value={getValue(['contact', 'hours', 'sunday'])}
                  onChange={(val) => updateField(['contact', 'hours', 'sunday'], val)}
                  placeholder="12:30 – 23:00"
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
