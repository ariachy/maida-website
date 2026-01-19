'use client';

import { useState, useEffect, useCallback } from 'react';
import LanguageTabs from '@/components/admin/LanguageTabs';
import ContentField from '@/components/admin/ContentField';
import { ToastContainer, useToast } from '@/components/admin/Toast';

interface LocaleData {
  [key: string]: any;
}

export default function FooterEditorPage() {
  const toast = useToast();
  
  const [enData, setEnData] = useState<LocaleData | null>(null);
  const [ptData, setPtData] = useState<LocaleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeLanguage, setActiveLanguage] = useState('en');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

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
      toast.error('Failed to load footer data');
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
      toast.success('Footer saved successfully!');
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save footer');
    } finally {
      setSaving(false);
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

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-serif text-[#2C2C2C]">Footer Editor</h1>
          <p className="text-[#6B6B6B] mt-1">Edit footer content, links, and contact info</p>
        </div>
        <div className="flex items-center gap-3">
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

      {/* Content Area */}
      <div className="space-y-6">
        {/* Branding Section */}
        <div className="bg-white rounded-lg shadow-sm border border-[#E5E5E5] p-6">
          <div className="mb-6 pb-4 border-b border-[#E5E5E5]">
            <h2 className="text-lg font-medium text-[#2C2C2C]">Branding</h2>
            <p className="text-sm text-[#6B6B6B] mt-1">Main footer tagline and branding</p>
          </div>

          <ContentField 
            label="Tagline" 
            description="Main slogan displayed in footer"
            value={getValue(['footer', 'tagline'])}
            onChange={createOnChange(['footer', 'tagline'])}
            placeholder="Mediterranean Flavours. Lebanese Soul."
          />

          <ContentField 
            label="Location Text" 
            description="Location shown in footer"
            value={getValue(['footer', 'location'])}
            onChange={createOnChange(['footer', 'location'])}
            placeholder="Cais do Sodré, Lisboa"
          />

          <ContentField 
            label="Copyright Text" 
            description="Copyright notice"
            value={getValue(['footer', 'copyright'])}
            onChange={createOnChange(['footer', 'copyright'])}
            placeholder="© 2026 maída"
          />
        </div>

        {/* Navigation Labels */}
        <div className="bg-white rounded-lg shadow-sm border border-[#E5E5E5] p-6">
          <div className="mb-6 pb-4 border-b border-[#E5E5E5]">
            <h2 className="text-lg font-medium text-[#2C2C2C]">Navigation Labels</h2>
            <p className="text-sm text-[#6B6B6B] mt-1">Column headers and link text</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <ContentField 
              label="Navigate Column Header" 
              description="Header for main navigation links"
              value={getValue(['footer', 'navigate'])}
              onChange={createOnChange(['footer', 'navigate'])}
              placeholder="Navigate"
            />
            <ContentField 
              label="Discover Column Header" 
              description="Header for discover links"
              value={getValue(['footer', 'discover'])}
              onChange={createOnChange(['footer', 'discover'])}
              placeholder="Discover"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <ContentField 
              label="What is SAJ Link" 
              description="Link text for SAJ page"
              value={getValue(['footer', 'whatIsSaj'])}
              onChange={createOnChange(['footer', 'whatIsSaj'])}
              placeholder="What is SAJ?"
            />
            <ContentField 
              label="Coffee & Tea Link" 
              description="Link text for Coffee & Tea page"
              value={getValue(['footer', 'coffeeTea'])}
              onChange={createOnChange(['footer', 'coffeeTea'])}
              placeholder="Coffee & Tea"
            />
          </div>
        </div>

        {/* Hours Section */}
        <div className="bg-white rounded-lg shadow-sm border border-[#E5E5E5] p-6">
          <div className="mb-6 pb-4 border-b border-[#E5E5E5]">
            <h2 className="text-lg font-medium text-[#2C2C2C]">Opening Hours</h2>
            <p className="text-sm text-[#6B6B6B] mt-1">Hours displayed in footer</p>
          </div>

          <ContentField 
            label="Hours Section Title" 
            description="Header for hours section"
            value={getValue(['footer', 'hours'])}
            onChange={createOnChange(['footer', 'hours'])}
            placeholder="Hours"
          />

          <ContentField 
            label="Open Hours" 
            description="Main opening hours text"
            value={getValue(['footer', 'hoursValue'])}
            onChange={createOnChange(['footer', 'hoursValue'])}
            placeholder="Tue – Sat: 19h – 00h"
          />

          <ContentField 
            label="Closed Days" 
            description="Days when closed"
            value={getValue(['footer', 'closed'])}
            onChange={createOnChange(['footer', 'closed'])}
            placeholder="Sun – Mon: Closed"
          />
        </div>

        {/* Contact Section */}
        <div className="bg-white rounded-lg shadow-sm border border-[#E5E5E5] p-6">
          <div className="mb-6 pb-4 border-b border-[#E5E5E5]">
            <h2 className="text-lg font-medium text-[#2C2C2C]">Contact & Links</h2>
            <p className="text-sm text-[#6B6B6B] mt-1">Contact info and action links</p>
          </div>

          <ContentField 
            label="Contact Section Title" 
            description="Header for contact section"
            value={getValue(['footer', 'contact'])}
            onChange={createOnChange(['footer', 'contact'])}
            placeholder="Contact"
          />

          <div className="grid grid-cols-2 gap-4">
            <ContentField 
              label="Reservations Link Text" 
              description="Text for reservation button/link"
              value={getValue(['footer', 'reservations'])}
              onChange={createOnChange(['footer', 'reservations'])}
              placeholder="Reservations"
            />
            <ContentField 
              label="Gift Cards Link Text" 
              description="Text for gift cards link"
              value={getValue(['footer', 'giftCards'])}
              onChange={createOnChange(['footer', 'giftCards'])}
              placeholder="Gift Cards"
            />
          </div>
        </div>

        {/* Preview */}
        <div className="bg-[#2C2C2C] rounded-lg p-8 text-white">
          <h3 className="text-sm font-medium text-[#9CA3AF] mb-4">Preview ({activeLanguage.toUpperCase()})</h3>
          <div className="grid grid-cols-3 gap-8 text-sm">
            <div>
              <p className="font-serif text-2xl mb-2">maída</p>
              <p className="text-[#9CA3AF]">{getValue(['footer', 'tagline'])}</p>
              <p className="text-[#9CA3AF] mt-1">{getValue(['footer', 'location'])}</p>
            </div>
            <div>
              <p className="font-medium mb-2">{getValue(['footer', 'hours'])}</p>
              <p className="text-[#9CA3AF]">{getValue(['footer', 'hoursValue'])}</p>
              <p className="text-[#9CA3AF]">{getValue(['footer', 'closed'])}</p>
            </div>
            <div>
              <p className="font-medium mb-2">{getValue(['footer', 'contact'])}</p>
              <p className="text-[#C4A484]">{getValue(['footer', 'reservations'])}</p>
              <p className="text-[#9CA3AF]">{getValue(['footer', 'giftCards'])}</p>
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-[#3C3C3C] text-xs text-[#9CA3AF]">
            {getValue(['footer', 'copyright'])}
          </div>
        </div>
      </div>

      <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />
    </div>
  );
}
