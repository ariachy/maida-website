'use client';

import { useState, useEffect } from 'react';
import LanguageTabs from '@/components/admin/LanguageTabs';
import { ToastContainer, useToast } from '@/components/admin/Toast';

interface LocaleData {
  [key: string]: any;
}

export default function ContactEditorPage() {
  const toast = useToast();
  
  const [enData, setEnData] = useState<LocaleData | null>(null);
  const [ptData, setPtData] = useState<LocaleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeLanguage, setActiveLanguage] = useState('en');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [activeSection, setActiveSection] = useState('header');

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
      toast.success('Contact page saved successfully!');
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save contact page');
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
    { id: 'header', label: 'Page Header', description: 'Title and subtitle at top' },
    { id: 'form', label: 'Contact Form', description: 'Form labels and messages' },
    { id: 'subjects', label: 'Subject Options', description: 'Dropdown options for subject' },
    { id: 'info', label: 'Contact Info', description: 'Address, phone, email' },
    { id: 'hours', label: 'Opening Hours', description: 'Business hours display' },
    { id: 'location', label: 'Location', description: 'Map section labels' },
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
          <h1 className="text-3xl font-serif text-[#2C2C2C]">Contact Page Editor</h1>
          <p className="text-[#6B6B6B] mt-1">Edit the Contact page labels and information</p>
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

                <Field label="Page Title" description="Main heading (e.g., 'Get in Touch')" path={['contact', 'title']} placeholder="Get in Touch" required />
                <Field label="Page Subtitle" description="Text below the title" path={['contact', 'subtitle']} placeholder="We'd love to hear from you" />
              </>
            )}

            {/* CONTACT FORM */}
            {activeSection === 'form' && (
              <>
                <div className="mb-6 pb-4 border-b border-[#E5E5E5]">
                  <h2 className="text-lg font-medium text-[#2C2C2C]">Contact Form Labels</h2>
                  <p className="text-sm text-[#6B6B6B] mt-1">Labels and messages for the contact form</p>
                </div>

                <Field label="Form Title" description="Heading above the form" path={['contact', 'form', 'title']} placeholder="Send us a message" />

                <div className="grid grid-cols-2 gap-4">
                  <Field label="Name Field Label" description="Label for name input" path={['contact', 'form', 'name']} placeholder="Your name" />
                  <Field label="Email Field Label" description="Label for email input" path={['contact', 'form', 'email']} placeholder="Email address" />
                </div>

                <Field label="Subject Field Label" description="Label for subject dropdown" path={['contact', 'form', 'subject']} placeholder="Subject" />
                <Field label="Message Field Label" description="Label for message textarea" path={['contact', 'form', 'message']} placeholder="Message" />
                <Field label="Message Placeholder" description="Placeholder text in the message field" path={['contact', 'form', 'placeholder']} placeholder="How can we help you?" />

                <div className="grid grid-cols-2 gap-4">
                  <Field label="Submit Button Text" description="Text on the send button" path={['contact', 'form', 'send']} placeholder="Send message" />
                  <Field label="Sending State Text" description="Text while form is submitting" path={['contact', 'form', 'sending']} placeholder="Sending..." />
                </div>

                <Field label="Success Message" description="Shown after form is submitted successfully" path={['contact', 'form', 'success']} multiline placeholder="Thank you! Your message has been sent..." />
                <Field label="Error Message" description="Shown if form submission fails" path={['contact', 'form', 'error']} placeholder="Something went wrong. Please try again." />
              </>
            )}

            {/* SUBJECT OPTIONS */}
            {activeSection === 'subjects' && (
              <>
                <div className="mb-6 pb-4 border-b border-[#E5E5E5]">
                  <h2 className="text-lg font-medium text-[#2C2C2C]">Subject Dropdown Options</h2>
                  <p className="text-sm text-[#6B6B6B] mt-1">Options in the subject dropdown menu</p>
                </div>

                <Field label="Default Option (Placeholder)" description="First option prompting user to select" path={['contact', 'subjects', 'select']} placeholder="Select a topic" />
                <Field label="Option 1 - General Inquiry" description="Option for general questions" path={['contact', 'subjects', 'general']} placeholder="General inquiry" />
                <Field label="Option 2 - Large Group Reservation" description="Option for group bookings" path={['contact', 'subjects', 'reservation']} placeholder="Large group reservation (6+)" />
                <Field label="Option 3 - Private Event" description="Option for event inquiries" path={['contact', 'subjects', 'event']} placeholder="Private event" />
                <Field label="Option 4 - Feedback" description="Option for feedback" path={['contact', 'subjects', 'feedback']} placeholder="Feedback" />
                <Field label="Option 5 - Other" description="Catch-all option" path={['contact', 'subjects', 'other']} placeholder="Other" />
              </>
            )}

            {/* CONTACT INFO */}
            {activeSection === 'info' && (
              <>
                <div className="mb-6 pb-4 border-b border-[#E5E5E5]">
                  <h2 className="text-lg font-medium text-[#2C2C2C]">Contact Information</h2>
                  <p className="text-sm text-[#6B6B6B] mt-1">Your address, phone, and email details</p>
                </div>

                <Field label="Section Title" description="Heading for contact info section" path={['contact', 'info', 'title']} placeholder="Contact" />
                <Field label="Street Address" description="Your street address" path={['contact', 'info', 'address']} placeholder="Rua da Boavista 66" />
                <Field label="City & Postal Code" description="City and postal code" path={['contact', 'info', 'city']} placeholder="1200-067 Lisboa" />
                <Field label="Phone Number" description="Contact phone number" path={['contact', 'info', 'phone']} placeholder="+351 961 111 383" />
                <Field label="Email Address" description="Contact email" path={['contact', 'info', 'email']} placeholder="info@maida.pt" />
              </>
            )}

            {/* OPENING HOURS */}
            {activeSection === 'hours' && (
              <>
                <div className="mb-6 pb-4 border-b border-[#E5E5E5]">
                  <h2 className="text-lg font-medium text-[#2C2C2C]">Opening Hours</h2>
                  <p className="text-sm text-[#6B6B6B] mt-1">Business hours displayed on contact page</p>
                </div>

                <Field label="Section Title" description="Heading for hours section" path={['contact', 'hours', 'title']} placeholder="Opening Hours" />
                <Field label="Closed Days Label" description="Word for 'Closed'" path={['contact', 'hours', 'closedText']} placeholder="Closed" />
                <Field label="Monday-Tuesday Hours" description="Hours for closed days" path={['contact', 'hours', 'closed']} placeholder="Monday - Tuesday: Closed" />
                <Field label="Midweek Hours" description="Wed/Thu/Sun hours" path={['contact', 'hours', 'midweek']} placeholder="Wed, Thu, Sun: 12:30 - 23:00" />
                <Field label="Midweek Kitchen Note" description="Kitchen closing for midweek" path={['contact', 'hours', 'midweekKitchen']} placeholder="Kitchen closes 22:30" />
                <Field label="Weekend Hours" description="Fri/Sat hours" path={['contact', 'hours', 'weekend']} placeholder="Fri - Sat: 12:30 - 01:00" />
                <Field label="Weekend Kitchen Note" description="Kitchen closing for weekend" path={['contact', 'hours', 'weekendKitchen']} placeholder="Kitchen closes 23:30" />
              </>
            )}

            {/* LOCATION */}
            {activeSection === 'location' && (
              <>
                <div className="mb-6 pb-4 border-b border-[#E5E5E5]">
                  <h2 className="text-lg font-medium text-[#2C2C2C]">Location Section</h2>
                  <p className="text-sm text-[#6B6B6B] mt-1">Map section labels</p>
                </div>

                <Field label="Section Title" description="Heading above the map" path={['contact', 'location', 'title']} placeholder="Location" />
                <Field label="Directions Link Text" description="Text for Google Maps link" path={['contact', 'location', 'directions']} placeholder="Get Directions →" />
              </>
            )}
          </div>
        </div>
      </div>

      <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />
    </div>
  );
}
