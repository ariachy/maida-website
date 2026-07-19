'use client';

import { useState, useEffect, useCallback } from 'react';
import LanguageTabs from '@/components/admin/LanguageTabs';
import ContentField from '@/components/admin/ContentField';
import { ToastContainer, useToast } from '@/components/admin/Toast';
import RebuildModal from '@/components/admin/RebuildModal';

interface LocaleData {
  [key: string]: any;
}

export default function ContactEditorPage() {
  const toast = useToast();
  
  const [enData, setEnData] = useState<LocaleData | null>(null);
  const [ptData, setPtData] = useState<LocaleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeLanguage, setActiveLanguage] = useState<'en' | 'pt'>('en');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [activeSection, setActiveSection] = useState('header');
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
      toast.error('Failed to load contact data');
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
      toast.error('Failed to save contact page');
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
    { id: 'header', label: 'Page Header', description: 'Title and subtitle at top' },
    { id: 'form', label: 'Contact Form', description: 'Form labels and messages' },
    { id: 'subjects', label: 'Subject Options', description: 'Dropdown options for subject' },
    { id: 'info', label: 'Contact Info', description: 'Address, phone, email' },
    { id: 'hours', label: 'Opening Hours', description: 'Business hours display' },
    { id: 'location', label: 'Location', description: 'Map section labels' },
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
          <h1 className="text-3xl font-serif text-[#2C2C2C]">Contact Page Editor</h1>
          <p className="text-[#6B6B6B] mt-1">Edit the Contact page content</p>
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
            {/* PAGE HEADER */}
            {activeSection === 'header' && (
              <>
                <div className="mb-6 pb-4 border-b border-[#E5E5E5]">
                  <h2 className="text-lg font-medium text-[#2C2C2C]">Page Header</h2>
                  <p className="text-sm text-[#6B6B6B] mt-1">Main title and hero section of the contact page</p>
                </div>

                <ContentField
                  label="Page Title"
                  description="Main heading at top of page"
                  value={getValue(['contact', 'title'])}
                  onChange={(val) => updateField(['contact', 'title'], val)}
                  placeholder="Get in Touch"
                  required
                />
                <ContentField
                  label="Subtitle"
                  description="Supporting text below title"
                  value={getValue(['contact', 'subtitle'])}
                  onChange={(val) => updateField(['contact', 'subtitle'], val)}
                  placeholder="For reservations, inquiries, or just to say hello"
                />
              </>
            )}

            {/* CONTACT FORM */}
            {activeSection === 'form' && (
              <>
                <div className="mb-6 pb-4 border-b border-[#E5E5E5]">
                  <h2 className="text-lg font-medium text-[#2C2C2C]">Contact Form</h2>
                  <p className="text-sm text-[#6B6B6B] mt-1">Labels and placeholder text for the contact form</p>
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
                    label="Name Label"
                    description="Label for name field"
                    value={getValue(['contact', 'form', 'name'])}
                    onChange={(val) => updateField(['contact', 'form', 'name'], val)}
                    placeholder="Name"
                  />
                  <ContentField
                    label="Email Label"
                    description="Label for email field"
                    value={getValue(['contact', 'form', 'email'])}
                    onChange={(val) => updateField(['contact', 'form', 'email'], val)}
                    placeholder="Email"
                  />
                </div>

                <ContentField
                  label="Subject Label"
                  description="Label for subject dropdown"
                  value={getValue(['contact', 'form', 'subject'])}
                  onChange={(val) => updateField(['contact', 'form', 'subject'], val)}
                  placeholder="Subject"
                />
                <ContentField
                  label="Message Label"
                  description="Label for message textarea"
                  value={getValue(['contact', 'form', 'message'])}
                  onChange={(val) => updateField(['contact', 'form', 'message'], val)}
                  placeholder="Message"
                />
                <ContentField
                  label="Submit Button Text"
                  description="Text on the submit button"
                  value={getValue(['contact', 'form', 'submit'])}
                  onChange={(val) => updateField(['contact', 'form', 'submit'], val)}
                  placeholder="Send Message"
                />

                <div className="mt-6 mb-4">
                  <h3 className="text-sm font-medium text-[#2C2C2C] mb-3">Form Messages</h3>
                </div>

                <ContentField
                  label="Success Message"
                  description="Shown when form is submitted successfully"
                  value={getValue(['contact', 'form', 'success'])}
                  onChange={(val) => updateField(['contact', 'form', 'success'], val)}
                  placeholder="Thank you! We'll get back to you soon."
                />
                <ContentField
                  label="Error Message"
                  description="Shown when form submission fails"
                  value={getValue(['contact', 'form', 'error'])}
                  onChange={(val) => updateField(['contact', 'form', 'error'], val)}
                  placeholder="Something went wrong. Please try again."
                />
              </>
            )}

            {/* SUBJECT OPTIONS */}
            {activeSection === 'subjects' && (
              <>
                <div className="mb-6 pb-4 border-b border-[#E5E5E5]">
                  <h2 className="text-lg font-medium text-[#2C2C2C]">Subject Dropdown Options</h2>
                  <p className="text-sm text-[#6B6B6B] mt-1">Options that appear in the subject dropdown</p>
                </div>

                <ContentField
                  label="General Inquiry"
                  description="Option for general questions"
                  value={getValue(['contact', 'subjects', 'general'])}
                  onChange={(val) => updateField(['contact', 'subjects', 'general'], val)}
                  placeholder="General Inquiry"
                />
                <ContentField
                  label="Reservations"
                  description="Option for booking questions"
                  value={getValue(['contact', 'subjects', 'reservations'])}
                  onChange={(val) => updateField(['contact', 'subjects', 'reservations'], val)}
                  placeholder="Reservations"
                />
                <ContentField
                  label="Private Events"
                  description="Option for event inquiries"
                  value={getValue(['contact', 'subjects', 'events'])}
                  onChange={(val) => updateField(['contact', 'subjects', 'events'], val)}
                  placeholder="Private Events"
                />
                <ContentField
                  label="Feedback"
                  description="Option for feedback"
                  value={getValue(['contact', 'subjects', 'feedback'])}
                  onChange={(val) => updateField(['contact', 'subjects', 'feedback'], val)}
                  placeholder="Feedback"
                />
                <ContentField
                  label="Other"
                  description="Catch-all option"
                  value={getValue(['contact', 'subjects', 'other'])}
                  onChange={(val) => updateField(['contact', 'subjects', 'other'], val)}
                  placeholder="Other"
                />
              </>
            )}

            {/* CONTACT INFO */}
            {activeSection === 'info' && (
              <>
                <div className="mb-6 pb-4 border-b border-[#E5E5E5]">
                  <h2 className="text-lg font-medium text-[#2C2C2C]">Contact Information</h2>
                  <p className="text-sm text-[#6B6B6B] mt-1">Your address, phone, and email details</p>
                </div>

                <ContentField
                  label="Section Title"
                  description="Heading for contact info section"
                  value={getValue(['contact', 'info', 'title'])}
                  onChange={(val) => updateField(['contact', 'info', 'title'], val)}
                  placeholder="Contact"
                />
                <ContentField
                  label="Street Address"
                  description="Your street address"
                  value={getValue(['contact', 'info', 'address'])}
                  onChange={(val) => updateField(['contact', 'info', 'address'], val)}
                  placeholder="Rua da Boavista 66"
                />
                <ContentField
                  label="City & Postal Code"
                  description="City and postal code"
                  value={getValue(['contact', 'info', 'city'])}
                  onChange={(val) => updateField(['contact', 'info', 'city'], val)}
                  placeholder="1200-067 Lisboa"
                />
                <ContentField
                  label="Phone Number"
                  description="Contact phone number"
                  value={getValue(['contact', 'info', 'phone'])}
                  onChange={(val) => updateField(['contact', 'info', 'phone'], val)}
                  placeholder="+351 961 111 383"
                />
                <ContentField
                  label="Email Address"
                  description="Contact email"
                  value={getValue(['contact', 'info', 'email'])}
                  onChange={(val) => updateField(['contact', 'info', 'email'], val)}
                  placeholder="info@maida.pt"
                />
              </>
            )}

            {/* OPENING HOURS */}
            {activeSection === 'hours' && (
              <>
                <div className="mb-6 pb-4 border-b border-[#E5E5E5]">
                  <h2 className="text-lg font-medium text-[#2C2C2C]">Opening Hours</h2>
                  <p className="text-sm text-[#6B6B6B] mt-1">Business hours displayed on contact page</p>
                </div>

                <ContentField
                  label="Section Title"
                  description="Heading for hours section"
                  value={getValue(['contact', 'hours', 'title'])}
                  onChange={(val) => updateField(['contact', 'hours', 'title'], val)}
                  placeholder="Opening Hours"
                />
                <ContentField
                  label="Closed Days Label"
                  description="Word for 'Closed'"
                  value={getValue(['contact', 'hours', 'closedText'])}
                  onChange={(val) => updateField(['contact', 'hours', 'closedText'], val)}
                  placeholder="Closed"
                />
                <ContentField
                  label="Monday-Tuesday Hours"
                  description="Hours for closed days"
                  value={getValue(['contact', 'hours', 'closed'])}
                  onChange={(val) => updateField(['contact', 'hours', 'closed'], val)}
                  placeholder="Monday - Tuesday: Closed"
                />
                <ContentField
                  label="Midweek Hours"
                  description="Wed/Thu/Sun hours"
                  value={getValue(['contact', 'hours', 'midweek'])}
                  onChange={(val) => updateField(['contact', 'hours', 'midweek'], val)}
                  placeholder="Wed, Thu, Sun: 12:30 - 23:00"
                />
                <ContentField
                  label="Midweek Kitchen Note"
                  description="Kitchen closing for midweek"
                  value={getValue(['contact', 'hours', 'midweekKitchen'])}
                  onChange={(val) => updateField(['contact', 'hours', 'midweekKitchen'], val)}
                  placeholder="Kitchen closes 22:30"
                />
                <ContentField
                  label="Weekend Hours"
                  description="Fri/Sat hours"
                  value={getValue(['contact', 'hours', 'weekend'])}
                  onChange={(val) => updateField(['contact', 'hours', 'weekend'], val)}
                  placeholder="Fri - Sat: 12:30 - 01:00"
                />
                <ContentField
                  label="Weekend Kitchen Note"
                  description="Kitchen closing for weekend"
                  value={getValue(['contact', 'hours', 'weekendKitchen'])}
                  onChange={(val) => updateField(['contact', 'hours', 'weekendKitchen'], val)}
                  placeholder="Kitchen closes 23:30"
                />
              </>
            )}

            {/* LOCATION */}
            {activeSection === 'location' && (
              <>
                <div className="mb-6 pb-4 border-b border-[#E5E5E5]">
                  <h2 className="text-lg font-medium text-[#2C2C2C]">Location Section</h2>
                  <p className="text-sm text-[#6B6B6B] mt-1">Map section labels</p>
                </div>

                <ContentField
                  label="Section Title"
                  description="Heading above the map"
                  value={getValue(['contact', 'location', 'title'])}
                  onChange={(val) => updateField(['contact', 'location', 'title'], val)}
                  placeholder="Location"
                />
                <ContentField
                  label="Directions Link Text"
                  description="Text for Google Maps link"
                  value={getValue(['contact', 'location', 'directions'])}
                  onChange={(val) => updateField(['contact', 'location', 'directions'], val)}
                  placeholder="Get Directions →"
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
