'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import CookieConsent from '@/components/consent/CookieConsent';

interface MeetItem {
  id: string;
  type: string;
  title: string;
  titlePt?: string;
  subtitle?: string;
  subtitlePt?: string;
  url?: string;
  icon?: string;
  image?: string;
  color: string;
  metadata?: string;
}

interface MeetSection {
  id: string;
  title: string;
  titlePt?: string;
  items: MeetItem[];
}

interface Settings {
  background_color: string;
  background_gradient_from: string;
  background_gradient_to: string;
  use_gradient: string;
  footer_directions_text: string;
  footer_directions_text_pt: string;
  footer_directions_url: string;
  footer_contact_text: string;
  footer_contact_text_pt: string;
  footer_contact_url: string;
  footer_hours: string;
  footer_address_text: string;
  footer_address_url: string;
  wifi_network: string;
  wifi_password: string;
  tagline_1: string;
  tagline_1_pt: string;
  tagline_2: string;
  tagline_2_pt: string;
  review_qr_image: string;
}

interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  image: string;
  tags?: string[];
}

// Default settings
const DEFAULT_SETTINGS: Settings = {
  background_color: '#F5F0E8',
  background_gradient_from: '#F5F0E8',
  background_gradient_to: '#EDE8E0',
  use_gradient: 'false',
  footer_directions_text: 'Directions',
  footer_directions_text_pt: 'Direções',
  footer_directions_url: 'https://maps.google.com/?q=Rua+da+Boavista+66+1200-068+Lisboa',
  footer_contact_text: 'Contact',
  footer_contact_text_pt: 'Contacto',
  footer_contact_url: 'mailto:info@maida.pt',
  footer_hours: 'Wed – Mon: 18:00 – 23:30 · Fri – Sat: 18:00 till late (02:00)',
  footer_address_text: 'Rua da Boavista 66, 1200-068, Lisboa',
  footer_address_url: 'https://maps.google.com/?q=Rua+da+Boavista+66+1200-068+Lisboa',
  wifi_network: 'Maida-Guest',
  wifi_password: 'MaidaGuest',
  tagline_1: 'Mediterranean Flavours. Lebanese Soul.',
  tagline_1_pt: 'Sabores Mediterrâneos. Alma Libanesa.',
  tagline_2: 'A place where flavors, music, and good company come together. Rooted in tradition, reimagined for today.',
  tagline_2_pt: 'Um lugar onde sabores, música e boa companhia se encontram. Enraizado na tradição, reinventado para hoje.',
  review_qr_image: '',
};

export default function MeetMeAtMaidaPage() {
  const [sections, setSections] = useState<MeetSection[]>([]);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [latestBlogPost, setLatestBlogPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState<'en' | 'pt'>('en');

  // Open cookie consent banner via custom event
  const openCookieSettings = useCallback(() => {
    window.dispatchEvent(new CustomEvent('open-cookie-consent'));
  }, []);

  // Detect browser language on mount
  useEffect(() => {
    const browserLang = navigator.language || (navigator as any).userLanguage || 'en';
    if (browserLang.startsWith('pt')) {
      setLanguage('pt');
    }
  }, []);
  const [wifiExpanded, setWifiExpanded] = useState(false);
  const [copiedWifi, setCopiedWifi] = useState(false);
  const [showReviewQR, setShowReviewQR] = useState<string | null>(null); // Track by item ID

  useEffect(() => {
    fetch('/api/meetmeatmaida')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setSections(data.sections || []);
          setSettings({ ...DEFAULT_SETTINGS, ...data.settings });
          setLatestBlogPost(data.latestBlogPost);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const t = (en: string | undefined, pt: string | undefined) => {
    return language === 'pt' && pt ? pt : en || '';
  };

  const copyWifiPassword = () => {
    if (settings?.wifi_password) {
      navigator.clipboard.writeText(settings.wifi_password);
      setCopiedWifi(true);
      setTimeout(() => setCopiedWifi(false), 2000);
    }
  };

  // Process URLs: rewrite internal links to include the current language prefix
  const processUrl = (url: string | undefined): { href: string; isInternal: boolean } => {
    if (!url) return { href: '#', isInternal: false };
    
    // External URLs (http, https, mailto, tel, etc.) — leave as-is
    if (/^(https?:\/\/|mailto:|tel:)/.test(url)) {
      return { href: url, isInternal: false };
    }
    
    // Internal paths: strip any existing /en/ or /pt/ prefix, then add the current language
    const cleanPath = url.replace(/^\/(en|pt)(\/|$)/, '/');
    return { href: `/${language}${cleanPath.startsWith('/') ? '' : '/'}${cleanPath}`, isInternal: true };
  };

  const getButtonStyles = (color: string) => {
    const presets: Record<string, string> = {
      terracotta: 'bg-[#A67C5B] hover:bg-[#8B6549] text-white',
      coral: 'bg-[#E07B54] hover:bg-[#C86A46] text-white',
      olive: 'bg-[#7D8471] hover:bg-[#6B7260] text-white',
      stone: 'bg-[#9C9586] hover:bg-[#8A847A] text-white',
      outline: 'bg-transparent hover:bg-[#E8E3DA] text-[#5C5C5C] border border-[#D4CFC4]',
      cream: 'bg-[#E8E3DA] hover:bg-[#DDD8CF] text-[#5C5C5C]',
    };
    
    if (presets[color]) {
      return presets[color];
    }
    
    return `text-white hover:opacity-90`;
  };

  const getCustomStyle = (color: string) => {
    if (color.startsWith('#')) {
      return { backgroundColor: color };
    }
    return {};
  };

  const renderItem = (item: MeetItem) => {
    const metadata = item.metadata ? JSON.parse(item.metadata) : {};
    const title = t(item.title, item.titlePt);
    const subtitle = t(item.subtitle, item.subtitlePt);

    switch (item.type) {
      case 'button':
        const buttonUrl = processUrl(item.url);
        return (
          <a
            key={item.id}
            href={buttonUrl.href}
            target={buttonUrl.isInternal ? undefined : "_blank"} rel={buttonUrl.isInternal ? undefined : "noopener noreferrer"}
            className={`flex items-center justify-center gap-2 w-full py-3 px-5 rounded-lg transition-all duration-200 ${getButtonStyles(item.color)}`}
            style={getCustomStyle(item.color)}
          >
            {item.icon && <span className="text-base">{item.icon}</span>}
            <span className="font-medium text-sm">{title}</span>
          </a>
        );

      case 'icon':
        const iconUrl = processUrl(item.url);
        return (
          <a
            key={item.id}
            href={iconUrl.href}
            target={iconUrl.isInternal ? undefined : "_blank"} rel={iconUrl.isInternal ? undefined : "noopener noreferrer"}
            className="flex items-center gap-2 text-[#8B8578] hover:text-[#A67C5B] transition-colors"
          >
            {item.icon && <span>{item.icon}</span>}
            <span className="text-sm">{title}</span>
          </a>
        );

      case 'wifi':
        return (
          <div key={item.id} className="w-full">
            <button
              onClick={() => setWifiExpanded(!wifiExpanded)}
              className="flex items-center justify-center gap-2 w-full py-3 px-5 rounded-lg bg-[#E8E3DA] hover:bg-[#DDD8CF] text-[#5C5C5C] transition-all duration-200"
            >
              <span className="text-base">📶</span>
              <span className="font-medium text-sm">{title}</span>
              <span className={`ml-1 text-xs transition-transform duration-200 ${wifiExpanded ? 'rotate-180' : ''}`}>
                ▼
              </span>
            </button>
            
            {wifiExpanded && (
              <div className="mt-2 bg-white/80 border border-[#E8E3DA] rounded-lg p-4 space-y-3 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">📡</span>
                    <span className="text-xs text-[#8B8578] uppercase">{language === 'en' ? 'Network' : 'Rede'}</span>
                  </div>
                  <span className="font-mono text-sm text-[#5C5C5C]">{settings?.wifi_network}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">🔑</span>
                    <span className="text-xs text-[#8B8578] uppercase">{language === 'en' ? 'Password' : 'Senha'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm text-[#5C5C5C]">{settings?.wifi_password}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        copyWifiPassword();
                      }}
                      className="px-2 py-1 text-xs bg-[#E8E3DA] hover:bg-[#DDD8CF] text-[#7D8471] rounded transition-colors"
                    >
                      {copiedWifi ? '✓' : language === 'en' ? 'COPY' : 'COPIAR'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 'review':
        const qrImage = metadata.qrImage || '';
        const isQRShown = showReviewQR === item.id;
        return (
          <div key={item.id} className="w-full space-y-3">
            <p className="text-center text-[#5C5C5C] text-sm">
              {language === 'en' 
                ? "Enjoyed your visit? We'd love to hear from you!" 
                : "Gostou da sua visita? Adoraríamos ouvir a sua opinião!"}
            </p>
            <div className="flex gap-2 justify-center">
              <a
                href={item.url || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 px-5 bg-[#7D8471] hover:bg-[#6B7260] text-white rounded-lg transition-colors text-sm font-medium text-center whitespace-nowrap"
              >
                {title}
              </a>
              {qrImage && (
                <button
                  onClick={() => setShowReviewQR(isQRShown ? null : item.id)}
                  className="py-2.5 px-5 bg-transparent hover:bg-[#E8E3DA] text-[#5C5C5C] border border-[#D4CFC4] rounded-lg transition-colors text-sm font-medium whitespace-nowrap"
                >
                  {language === 'en' ? 'Show QR Code' : 'Mostrar Código QR'}
                </button>
              )}
            </div>
            {isQRShown && qrImage && (
              <div className="flex justify-center pt-2 animate-fadeIn">
                <div className="bg-white p-3 rounded-lg shadow-sm">
                  <Image 
                    src={qrImage} 
                    alt="QR Code" 
                    width={140} 
                    height={140}
                    className="rounded"
                  />
                </div>
              </div>
            )}
          </div>
        );

      case 'separator':
        return (
          <div key={item.id} className="py-1">
            <div className="h-px bg-[#E8E3DA]" />
          </div>
        );

      case 'info':
        return (
          <div key={item.id} className="text-center text-[#8B8578] text-sm">
            {item.icon && <span className="mr-2">{item.icon}</span>}
            {title}
          </div>
        );

      case 'blog':
        if (!latestBlogPost) return null;
        return (
          <a
            key={item.id}
            href={`/${language}/blog/${latestBlogPost.slug}`}
            className="flex gap-3 bg-white/60 border border-[#E8E3DA] rounded-lg overflow-hidden hover:border-[#A67C5B]/30 transition-all duration-200 group"
          >
            {latestBlogPost.image && (
              <div className="relative w-24 h-24 flex-shrink-0 overflow-hidden">
                <Image
                  src={latestBlogPost.image}
                  alt={latestBlogPost.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
            )}
            <div className="py-2 pr-3 flex flex-col justify-center min-w-0">
              {latestBlogPost.tags && latestBlogPost.tags.length > 0 && (
                <div className="flex gap-1.5 mb-1 flex-wrap">
                  {latestBlogPost.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="text-[#A67C5B] text-[10px] uppercase tracking-wide px-1.5 py-0.5 bg-[#A67C5B]/10 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              <h3 className="text-[#5C5C5C] text-sm font-medium group-hover:text-[#A67C5B] transition-colors line-clamp-1">
                {latestBlogPost.title}
              </h3>
              {latestBlogPost.excerpt && (
                <p className="text-[#8B8578] text-xs italic mt-0.5 line-clamp-2">
                  {latestBlogPost.excerpt}
                </p>
              )}
            </div>
          </a>
        );

      case 'blog-manual':
        const tags = metadata.tags ? metadata.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [];
        const description = t(metadata.description, metadata.descriptionPt);
        const blogManualUrl = processUrl(item.url);
        return (
          <a
            key={item.id}
            href={blogManualUrl.href}
            target={blogManualUrl.isInternal ? undefined : "_blank"} rel={blogManualUrl.isInternal ? undefined : "noopener noreferrer"}
            className="flex gap-3 bg-white/60 border border-[#E8E3DA] rounded-lg overflow-hidden hover:border-[#A67C5B]/30 transition-all duration-200 group"
          >
            {item.image && (
              <div className="relative w-24 h-24 flex-shrink-0 overflow-hidden">
                <Image
                  src={item.image}
                  alt={title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
            )}
            <div className="py-2 pr-3 flex flex-col justify-center min-w-0">
              {tags.length > 0 && (
                <div className="flex gap-1.5 mb-1 flex-wrap">
                  {tags.slice(0, 3).map((tag: string) => (
                    <span key={tag} className="text-[#A67C5B] text-[10px] uppercase tracking-wide px-1.5 py-0.5 bg-[#A67C5B]/10 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              <h3 className="text-[#5C5C5C] text-sm font-medium group-hover:text-[#A67C5B] transition-colors line-clamp-1">
                {title}
              </h3>
              {description && (
                <p className="text-[#8B8578] text-xs italic mt-0.5 line-clamp-2">
                  {description}
                </p>
              )}
            </div>
          </a>
        );

      case 'event':
        const eventUrl = processUrl(item.url);
        return (
          <a
            key={item.id}
            href={eventUrl.href}
            target={eventUrl.isInternal ? undefined : "_blank"} rel={eventUrl.isInternal ? undefined : "noopener noreferrer"}
            className="block bg-white/60 border border-[#E8E3DA] rounded-lg p-4 hover:border-[#A67C5B]/30 transition-all duration-200"
          >
            {item.image && (
              <div className="relative w-full h-28 mb-3 rounded-lg overflow-hidden">
                <Image
                  src={item.image}
                  alt={title}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div className="flex items-start gap-2">
              {item.icon && <span className="text-xl">{item.icon}</span>}
              <div>
                <h3 className="text-[#5C5C5C] font-medium text-sm">{title}</h3>
                {subtitle && (
                  <p className="text-[#8B8578] text-xs mt-0.5">{subtitle}</p>
                )}
                {metadata.date && (
                  <p className="text-[#A67C5B] text-xs mt-1">{metadata.date}</p>
                )}
              </div>
            </div>
          </a>
        );

      default:
        return null;
    }
  };

  const backgroundStyle = settings?.use_gradient === 'true'
    ? {
        background: `linear-gradient(180deg, ${settings.background_gradient_from} 0%, ${settings.background_gradient_to} 100%)`,
      }
    : {
        backgroundColor: settings?.background_color || '#F5F0E8',
      };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F0E8] flex items-center justify-center">
        <div className="animate-pulse">
          <div className="w-20 h-20 bg-[#E8E3DA] rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative" style={backgroundStyle}>
      {/* Language toggle */}
      <div className="absolute top-3 right-3 z-10">
        <button
          onClick={() => setLanguage(language === 'en' ? 'pt' : 'en')}
          className="text-[#8B8578] text-xs hover:text-[#5C5C5C] transition-colors px-2 py-1"
        >
          {language === 'en' ? 'PT' : 'EN'}
        </button>
      </div>

      {/* Main content */}
      <div className="max-w-sm mx-auto px-5 py-8">
        {/* Logo */}
        <div className="text-center mb-3">
          <Image
            src="/images/brand/logo.svg"
            alt="Maída"
            width={100}
            height={45}
            className="mx-auto"
            style={{ filter: 'brightness(0) saturate(100%) invert(45%) sepia(30%) saturate(400%) hue-rotate(334deg) brightness(95%) contrast(90%)' }}
          />
        </div>

        {/* Taglines */}
        <div className="text-center mb-9">
          <p className="font-display text-base text-[#A67C5B] italic mb-1">
            {t(settings.tagline_1, settings.tagline_1_pt)}
          </p>
          <p className="text-[#8B8578] text-xs leading-relaxed px-2">
            {t(settings.tagline_2, settings.tagline_2_pt)}
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-5">
          {sections.map((section) => (
            <div key={section.id} className="space-y-2">
              {section.title && (
                <h2 className="text-[#8B8578] text-[10px] uppercase tracking-wider mb-2">
                  {t(section.title, section.titlePt)}
                </h2>
              )}
              <div className="space-y-2">
                {section.items.map(renderItem)}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <footer className="mt-12 pt-5 border-t border-[#E8E3DA]">
          {/* Icon buttons */}
          <div className="flex justify-center gap-6 mb-4">
            {settings?.footer_directions_url && (
              <a
                href={settings.footer_directions_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-[#8B8578] hover:text-[#A67C5B] transition-colors"
              >
                <span className="text-xs">{t(settings.footer_directions_text, settings.footer_directions_text_pt)}</span>
              </a>
            )}
            {settings?.footer_contact_url && (
              <a
                href={settings.footer_contact_url}
                className="flex items-center gap-1.5 text-[#8B8578] hover:text-[#A67C5B] transition-colors"
              >
                <span className="text-xs">{t(settings.footer_contact_text, settings.footer_contact_text_pt)}</span>
              </a>
            )}
          </div>

          {/* Hours */}
          {settings?.footer_hours && (
            <p className="text-center text-[#8B8578] text-[10px] mb-2">
              {settings.footer_hours}
            </p>
          )}

          {/* Address */}
          {settings?.footer_address_url && settings?.footer_address_text && (
            <a
              href={settings.footer_address_url}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center text-[#A0998C] text-[10px] hover:text-[#A67C5B] transition-colors"
            >
              {settings.footer_address_text}
            </a>
          )}

          {/* Privacy & Cookie Settings */}
          <div className="flex justify-center items-center gap-3 mt-4">
            <a
              href={`/${language}/privacy`}
              className="text-[#A0998C] text-[10px] hover:text-[#A67C5B] transition-colors"
            >
              {language === 'pt' ? 'Política de Privacidade' : 'Privacy Policy'}
            </a>
            <span className="text-[#D4CFC4] text-[10px]">·</span>
            <button
              onClick={openCookieSettings}
              className="text-[#A0998C] text-[10px] hover:text-[#A67C5B] transition-colors"
            >
              {language === 'pt' ? 'Definições de Cookies' : 'Cookie Settings'}
            </button>
          </div>
        </footer>
      </div>

      <CookieConsent locale={language} />

      {/* Animation styles */}
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
