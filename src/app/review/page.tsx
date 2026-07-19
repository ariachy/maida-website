'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { QRCodeSVG } from 'qrcode.react';

interface ReviewPlatform {
  id: string;
  name: string;
  url: string;
  icon: string;
  isActive: boolean;
  isPrimary: boolean;
  order: number;
}

interface FeedbackForm {
  foodRating: number | null;
  serviceRating: number | null;
  atmosphereRating: number | null;
  message: string;
  name: string;
  email: string;
}

type Screen = 'main' | 'platforms' | 'feedback' | 'thankyou';

export default function ReviewPage() {
  const [screen, setScreen] = useState<Screen>('main');
  const [platforms, setPlatforms] = useState<ReviewPlatform[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [language, setLanguage] = useState<'en' | 'pt'>('en');
  const [form, setForm] = useState<FeedbackForm>({
    foodRating: null,
    serviceRating: null,
    atmosphereRating: null,
    message: '',
    name: '',
    email: '',
  });

  // URL for QR code - goes to platform selection page on user's phone
  const reviewUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/review?mode=select` 
    : '';

  const translations = {
    en: {
      thankYouDining: 'Thank you for dining with us',
      loveToHear: "We'd love to hear your thoughts",
      scanQR: 'Scan with your phone',
      or: 'or',
      tapPhone: 'Tap your phone above',
      nfc: 'NFC',
      whereReview: 'Thank you for being awesome! We really appreciate your support',
      somethingWrong: "Something wasn't right?",
      letUsKnow: 'Let us know directly',
      helpImprove: 'Help us improve your next visit',
      food: 'Food',
      service: 'Service',
      atmosphere: 'Atmosphere',
      anythingElse: "Anything else you'd like to share?",
      optional: 'optional',
      name: 'Name',
      email: 'Email',
      sendFeedback: 'Send Feedback',
      back: 'Back',
      obrigado: 'Obrigado!',
      feedbackHelps: 'Your feedback helps us create a better experience for you.',
      done: 'Done',
      submitting: 'Sending...',
    },
    pt: {
      thankYouDining: 'Obrigado por jantar connosco',
      loveToHear: 'Gostaríamos de ouvir a sua opinião',
      scanQR: 'Digitalize com o telemóvel',
      or: 'ou',
      tapPhone: 'Toque com o telemóvel acima',
      nfc: 'NFC',
      whereReview: 'Obrigado por ser incrível! Agradecemos muito o seu apoio',
      somethingWrong: 'Algo não correu bem?',
      letUsKnow: 'Diga-nos diretamente',
      helpImprove: 'Ajude-nos a melhorar a sua próxima visita',
      food: 'Comida',
      service: 'Serviço',
      atmosphere: 'Ambiente',
      anythingElse: 'Mais alguma coisa que gostaria de partilhar?',
      optional: 'opcional',
      name: 'Nome',
      email: 'Email',
      sendFeedback: 'Enviar Feedback',
      back: 'Voltar',
      obrigado: 'Obrigado!',
      feedbackHelps: 'O seu feedback ajuda-nos a criar uma melhor experiência para si.',
      done: 'Concluído',
      submitting: 'A enviar...',
    },
  };

  const t = translations[language];

  // Fetch active platforms
  useEffect(() => {
    fetch('/api/review/platforms')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setPlatforms(data.platforms);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleRating = (field: keyof FeedbackForm, value: number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmitFeedback = async () => {
    if (!form.foodRating || !form.serviceRating || !form.atmosphereRating) {
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch('/api/review/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          foodRating: form.foodRating,
          serviceRating: form.serviceRating,
          atmosphereRating: form.atmosphereRating,
          message: form.message || null,
          name: form.name || null,
          email: form.email || null,
        }),
      });

      if (response.ok) {
        setScreen('thankyou');
        // Reset form
        setForm({
          foodRating: null,
          serviceRating: null,
          atmosphereRating: null,
          message: '',
          name: '',
          email: '',
        });
      }
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    } finally {
      setSubmitting(false);
    }
  };

  // Auto-return to main screen after thank you
  useEffect(() => {
    if (screen === 'thankyou') {
      const timer = setTimeout(() => {
        setScreen('main');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [screen]);

  // Check if opened from QR/NFC scan (select mode) — show platforms immediately
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('mode') === 'select') {
        setScreen('platforms');
      }
    }
  }, []);

  const RatingSelector = ({
    label,
    value,
    onChange,
  }: {
    label: string;
    value: number | null;
    onChange: (val: number) => void;
  }) => {
    const emojis = ['😞', '😕', '😐', '😊', '😍'];

    return (
      <div className="mb-6">
        <p className="text-warm-white text-sm mb-3 font-medium">{label}</p>
        <div className="flex justify-between gap-2">
          {emojis.map((emoji, index) => (
            <button
              key={index}
              onClick={() => onChange(index + 1)}
              className={`flex-1 py-3 text-2xl rounded-lg transition-all duration-200 ${
                value === index + 1
                  ? 'bg-terracotta scale-110'
                  : 'bg-white/10 hover:bg-white/20'
              }`}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
    );
  };

  const PlatformIcon = ({ platform, size = 'normal' }: { platform: ReviewPlatform; size?: 'normal' | 'large' }) => {
    const sizeClass = size === 'large' ? 'w-8 h-8' : 'w-6 h-6';
    
    const icons: Record<string, JSX.Element> = {
      google: (
        <svg className={sizeClass} viewBox="0 0 24 24" fill="currentColor">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
      ),
      tripadvisor: (
        <svg className={sizeClass} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm4-6c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z" />
        </svg>
      ),
      thefork: (
        <svg className={sizeClass} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2L9 9H2l5.5 4.5L5 22l7-5 7 5-2.5-8.5L22 9h-7L12 2z" />
        </svg>
      ),
    };

    return icons[platform.icon] || <span className={size === 'large' ? 'text-2xl' : 'text-xl'}>⭐</span>;
  };

  if (loading && screen === 'main') {
    return (
      <div className="min-h-screen bg-charcoal flex items-center justify-center">
        <div className="animate-pulse">
          <div className="w-32 h-32 bg-white/10 rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-charcoal text-warm-white flex flex-col">
      {/* Language toggle */}
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={() => setLanguage(language === 'en' ? 'pt' : 'en')}
          className="text-stone text-sm hover:text-warm-white transition-colors px-3 py-1 rounded border border-white/10"
        >
          {language === 'en' ? 'PT' : 'EN'}
        </button>
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* SCREEN 1: iPad Landscape Kiosk Screen */}
          {screen === 'main' && (
            <div className="fixed inset-0 flex items-center justify-center animate-fadeUp" style={{ backgroundColor: '#FEFCF9' }}>
              {/* Subtle dot texture */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(171,87,65,0.02) 1px, transparent 0)',
                  backgroundSize: '28px 28px',
                }}
              />

              {/* Geometric corner pattern — bottom left */}
              <svg
                className="absolute bottom-0 left-0 pointer-events-none"
                style={{ width: '140px', height: '140px', opacity: 0.05 }}
                viewBox="0 0 140 140"
                fill="none"
              >
                <path d="M0 140L70 70L0 0" stroke="#ab5741" strokeWidth="1.5" />
                <path d="M20 140L70 90L20 40" stroke="#ab5741" strokeWidth="1" />
                <path d="M40 140L70 110L40 80" stroke="#ab5741" strokeWidth="0.8" />
                <circle cx="70" cy="70" r="35" stroke="#ab5741" strokeWidth="1" />
                <circle cx="70" cy="70" r="18" stroke="#ab5741" strokeWidth="0.8" />
              </svg>

              {/* Geometric corner pattern — top right */}
              <svg
                className="absolute top-0 right-0 pointer-events-none"
                style={{ width: '140px', height: '140px', opacity: 0.05, transform: 'rotate(180deg)' }}
                viewBox="0 0 140 140"
                fill="none"
              >
                <path d="M0 140L70 70L0 0" stroke="#ab5741" strokeWidth="1.5" />
                <path d="M20 140L70 90L20 40" stroke="#ab5741" strokeWidth="1" />
                <path d="M40 140L70 110L40 80" stroke="#ab5741" strokeWidth="0.8" />
                <circle cx="70" cy="70" r="35" stroke="#ab5741" strokeWidth="1" />
                <circle cx="70" cy="70" r="18" stroke="#ab5741" strokeWidth="0.8" />
              </svg>

              {/* Language toggle */}
              <div className="absolute top-5 right-6 z-10 flex gap-1 rounded-full p-1" style={{ backgroundColor: '#E8E0D5' }}>
                <button
                  onClick={() => setLanguage('en')}
                  className="px-4 py-1.5 rounded-full text-xs font-medium transition-all"
                  style={{
                    backgroundColor: language === 'en' ? '#ab5741' : 'transparent',
                    color: language === 'en' ? '#FEFCF9' : '#043335',
                  }}
                >
                  EN
                </button>
                <button
                  onClick={() => setLanguage('pt')}
                  className="px-4 py-1.5 rounded-full text-xs font-medium transition-all"
                  style={{
                    backgroundColor: language === 'pt' ? '#ab5741' : 'transparent',
                    color: language === 'pt' ? '#FEFCF9' : '#043335',
                  }}
                >
                  PT
                </button>
              </div>

              {/* Two-column layout */}
              <div className="relative z-10 flex items-center w-full max-w-3xl mx-auto px-12">
                {/* LEFT — Branding & message */}
                <div className="flex-1 flex flex-col items-center justify-center pr-12">
                  <Image
                    src="/images/brand/logo.svg"
                    alt="Maída"
                    width={160}
                    height={64}
                    className="h-16 w-auto mb-10"
                    priority
                  />

                  <h1
                    className="text-3xl font-bold text-center mb-3 leading-tight"
                    style={{ color: '#043335', fontFamily: 'Georgia, Cambria, serif' }}
                  >
                    {t.thankYouDining}
                  </h1>

                  <p className="text-sm text-center" style={{ color: '#4c5e36' }}>
                    {t.loveToHear}
                  </p>

                  {/* Decorative divider */}
                  <div className="flex items-center gap-3 mt-6 w-20">
                    <div className="flex-1 h-px" style={{ backgroundColor: '#E8E0D5' }} />
                    <span style={{ color: '#ab5741', fontSize: '11px' }}>✦</span>
                    <div className="flex-1 h-px" style={{ backgroundColor: '#E8E0D5' }} />
                  </div>
                </div>

                {/* CENTER — Divider line */}
                <div className="w-px self-stretch my-6" style={{ backgroundColor: '#E8E0D5' }} />

                {/* RIGHT — NFC + QR */}
                <div className="flex-1 flex flex-col items-center justify-center pl-12">
                  {/* NFC section */}
                  <div className="flex flex-col items-center mb-7">
                    <svg
                      width="24"
                      height="30"
                      viewBox="0 0 32 40"
                      fill="none"
                      className="mb-1.5 animate-bounce-gentle"
                    >
                      <path d="M16 0L4 16h9v24h6V16h9L16 0z" fill="#ab5741" opacity="0.65" />
                    </svg>
                    <span className="text-sm font-medium tracking-wide" style={{ color: '#ab5741' }}>
                      {t.tapPhone}
                    </span>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#ab5741"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{ opacity: 0.6 }}
                      >
                        <path d="M6 8.32a7.43 7.43 0 0 1 0 7.36" />
                        <path d="M9.46 6.21a11.76 11.76 0 0 1 0 11.58" />
                        <path d="M12.91 4.1a15.91 15.91 0 0 1 .01 15.8" />
                        <path d="M16.37 2a20.16 20.16 0 0 1 0 20" />
                      </svg>
                      <span className="text-xs font-medium" style={{ color: '#ab5741', opacity: 0.6 }}>
                        {t.nfc}
                      </span>
                    </div>
                  </div>

                  {/* OR divider */}
                  <div className="flex items-center gap-4 w-36 mb-7">
                    <div className="flex-1 h-px" style={{ backgroundColor: '#E8E0D5' }} />
                    <span className="text-xs font-medium uppercase tracking-widest" style={{ color: 'rgba(4,51,53,0.3)' }}>
                      {t.or}
                    </span>
                    <div className="flex-1 h-px" style={{ backgroundColor: '#E8E0D5' }} />
                  </div>

                  {/* QR Code */}
                  <div className="p-3.5 rounded-xl mb-2.5" style={{ backgroundColor: '#ffffff', border: '1.5px solid #E8E0D5' }}>
                    <QRCodeSVG
                      value={reviewUrl}
                      size={140}
                      bgColor="#ffffff"
                      fgColor="#043335"
                      level="M"
                      includeMargin={false}
                    />
                  </div>
                  <span className="text-xs font-medium" style={{ color: '#043335', opacity: 0.6 }}>
                    {t.scanQR}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* SCREEN 2: Platform Selection (shown on phone after NFC tap) */}
          {screen === 'platforms' && (
            <div className="text-center animate-fadeUp">
              {/* Logo */}
              <div className="mb-8">
                <Image
                  src="/images/brand/logo.svg"
                  alt="Maída"
                  width={160}
                  height={72}
                  className="mx-auto"
                  style={{ filter: 'brightness(0) saturate(100%) invert(58%) sepia(30%) saturate(600%) hue-rotate(334deg) brightness(90%) contrast(90%)' }}
                />
              </div>

              <h2 className="font-display text-xl font-light mb-8">
                {t.whereReview}
              </h2>

              {/* All platforms - same size buttons */}
              <div className="flex flex-col gap-3">
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="w-6 h-6 border-2 border-white/10 border-t-terracotta rounded-full animate-spin" />
                  </div>
                ) : (
                  platforms.filter(p => p.isActive).map((platform) => (
                  <a
                    key={platform.id}
                    href={platform.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-3 w-full bg-white/10 hover:bg-white/20 text-warm-white py-4 px-6 rounded-xl transition-all"
                  >
                    <span className="font-medium text-lg">Review on {platform.name}</span>
                  </a>
                ))
                )}
              </div>

              {/* Divider */}
              <div className="flex items-center gap-4 my-8">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-stone text-xs">{t.somethingWrong}</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>

              {/* Direct feedback button - same size as platform buttons */}
              <button
                onClick={() => setScreen('feedback')}
                className="flex items-center justify-center gap-3 w-full bg-white/5 hover:bg-white/10 border border-white/20 text-warm-white py-4 px-6 rounded-xl transition-all"
              >
                <svg className="w-8 h-8 text-stone" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span className="font-medium text-lg">{t.letUsKnow}</span>
              </button>
            </div>
          )}

          {/* SCREEN 3: Feedback Form */}
          {screen === 'feedback' && (
            <div className="animate-fadeUp">
              {/* Logo */}
              <div className="mb-6 text-center">
                <Image
                  src="/images/brand/logo.svg"
                  alt="Maída"
                  width={140}
                  height={63}
                  className="mx-auto"
                  style={{ filter: 'brightness(0) saturate(100%) invert(58%) sepia(30%) saturate(600%) hue-rotate(334deg) brightness(90%) contrast(90%)' }}
                />
              </div>

              <h2 className="font-display text-xl font-light text-center mb-8">
                {t.helpImprove}
              </h2>

              {/* Ratings */}
              <RatingSelector
                label={t.food}
                value={form.foodRating}
                onChange={(val) => handleRating('foodRating', val)}
              />
              <RatingSelector
                label={t.service}
                value={form.serviceRating}
                onChange={(val) => handleRating('serviceRating', val)}
              />
              <RatingSelector
                label={t.atmosphere}
                value={form.atmosphereRating}
                onChange={(val) => handleRating('atmosphereRating', val)}
              />

              {/* Message */}
              <div className="mb-6">
                <label className="text-warm-white text-sm mb-2 block">
                  {t.anythingElse}
                </label>
                <textarea
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-xl p-4 text-warm-white placeholder-stone resize-none h-24 focus:outline-none focus:border-terracotta"
                  placeholder=""
                />
              </div>

              {/* Name & Email */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div>
                  <label className="text-stone text-xs mb-1 block">
                    {t.name} <span className="opacity-50">({t.optional})</span>
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-warm-white text-sm focus:outline-none focus:border-terracotta"
                  />
                </div>
                <div>
                  <label className="text-stone text-xs mb-1 block">
                    {t.email} <span className="opacity-50">({t.optional})</span>
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-warm-white text-sm focus:outline-none focus:border-terracotta"
                  />
                </div>
              </div>

              {/* Submit */}
              <button
                onClick={handleSubmitFeedback}
                disabled={
                  !form.foodRating ||
                  !form.serviceRating ||
                  !form.atmosphereRating ||
                  submitting
                }
                className="w-full bg-terracotta hover:bg-terracotta-light disabled:bg-white/20 disabled:cursor-not-allowed text-warm-white py-4 rounded-xl font-medium transition-all"
              >
                {submitting ? t.submitting : t.sendFeedback}
              </button>

              {/* Back */}
              <button
                onClick={() => setScreen('platforms')}
                className="w-full text-stone hover:text-warm-white py-4 text-sm transition-colors"
              >
                ← {t.back}
              </button>
            </div>
          )}

          {/* SCREEN 4: Thank You */}
          {screen === 'thankyou' && (
            <div className="text-center animate-fadeUp">
              {/* Logo */}
              <div className="mb-8">
                <Image
                  src="/images/brand/logo.svg"
                  alt="Maída"
                  width={160}
                  height={72}
                  className="mx-auto"
                  style={{ filter: 'brightness(0) saturate(100%) invert(58%) sepia(30%) saturate(600%) hue-rotate(334deg) brightness(90%) contrast(90%)' }}
                />
              </div>

              {/* Checkmark */}
              <div className="w-20 h-20 bg-terracotta rounded-full flex items-center justify-center mx-auto mb-8">
                <svg
                  className="w-10 h-10 text-warm-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>

              <h2 className="font-display text-2xl font-light mb-4">
                {t.obrigado}
              </h2>
              <p className="text-stone mb-10">{t.feedbackHelps}</p>

              <button
                onClick={() => setScreen('platforms')}
                className="bg-white/10 hover:bg-white/20 text-warm-white px-8 py-3 rounded-xl transition-all"
              >
                {t.done}
              </button>

              <p className="text-stone/50 text-xs mt-8">
                Auto-returning in 5 seconds...
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-3">
        <p className="text-stone/50 text-xs">
          Rua da Boavista 66 · Cais do Sodré · Lisboa
        </p>
      </div>

      <style jsx global>{`
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeUp {
          animation: fadeUp 0.5s ease-out forwards;
        }
        @keyframes float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        .animate-float {
          animation: float 2s ease-in-out infinite;
        }
        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(10px);
          }
        }
        .animate-bounce-slow {
          animation: bounce-slow 1.5s ease-in-out infinite;
        }
        @keyframes bounce-gentle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        .animate-bounce-gentle {
          animation: bounce-gentle 2.2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
