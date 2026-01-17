'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Music, Calendar, PartyPopper, X, Send, CheckCircle, Loader2 } from 'lucide-react';
import { Locale } from '@/lib/i18n';

interface MaidaLiveClientProps {
  translations: any;
  locale: Locale;
}

export default function MaidaLiveClient({ translations, locale }: MaidaLiveClientProps) {
  const maidaLive = translations?.maidaLive || {};
  const nights = maidaLive?.nights || {};
  const privateEvents = maidaLive?.privateEvents || {};
  const djApplication = maidaLive?.djApplication || {};
  const djForm = djApplication?.form || {};
  const nav = translations?.nav || {};
  
  const [isDJModalOpen, setIsDJModalOpen] = useState(false);
  const [activeNight, setActiveNight] = useState<'thursday' | 'friday' | 'saturday' | null>(null);

  // Thursday themes rotation
  const thursdayThemes = maidaLive?.thursdayThemes || [
    { week: '1st', theme: 'Decades Night', description: '80s, 90s, 00s hits' },
    { week: '2nd', theme: 'World Music', description: 'Arabic, French, Latin & more' },
    { week: '3rd', theme: 'Jazz Night', description: 'Smooth jazz, soulful vibes' },
    { week: '4th', theme: 'To Be Announced', description: 'Follow us for surprises' },
  ];

  // Genre options for DJ form
  const genreOptions = [
    'House',
    'Deep House',
    'Techno',
    'Electronica',
    'Commercial / Top 40',
    '80s / 90s / 00s',
    'Jazz',
    'World / Arabic',
    'Funk / Soul',
  ];

  const handleReserveClick = () => {
    if (typeof window !== 'undefined' && (window as any).umaiWidget) {
      (window as any).umaiWidget.config({
        apiKey: 'd541f212-d5ca-4839-ab2b-7f9c99e1c96c',
        widgetType: 'reservation',
      });
      (window as any).umaiWidget.openWidget();
    }
  };

  // Handle reserve for specific day
  const handleReserve = (day: string) => {
    handleReserveClick();
  };

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8, ease: [0.19, 1, 0.22, 1] }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  return (
    <div className="bg-charcoal/95 text-white min-h-screen">
      {/* Hero Section - matching Story/Menu pages */}
      <section className="relative min-h-[calc(100svh-100px)] md:min-h-[calc(100svh-120px)] flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="/images/atmosphere/dj.webp"
            alt="DJ at Maída"
            fill
            className="object-cover object-bottom"
            priority
          />
          <div className="absolute inset-0 bg-charcoal/60" />
        </div>

        {/* Animated gradient orbs */}
        <div className="absolute top-1/4 right-1/4 w-[300px] h-[300px] rounded-full bg-terracotta/20 blur-[100px] animate-pulse" />
        <div className="absolute bottom-1/4 left-1/4 w-[200px] h-[200px] rounded-full bg-purple-500/10 blur-[80px] animate-pulse" style={{ animationDelay: '1s' }} />

        {/* Content - with top offset for navbar */}
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center pt-16 md:pt-20">
          <motion.p
            className="inline-flex items-center gap-3 text-xs tracking-[0.2em] uppercase text-terracotta-light mb-4 md:mb-6 whitespace-nowrap"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <span className="w-8 h-px bg-terracotta-light" />
            {maidaLive?.heroTagline || 'Music • Culture • Atmosphere'}
            <span className="w-8 h-px bg-terracotta-light" />
          </motion.p>

          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold mb-4 md:mb-6 leading-[1.1]">
            <span className="block overflow-hidden">
              <motion.span
                className="block"
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                transition={{ duration: 1.2, delay: 0.3, ease: [0.19, 1, 0.22, 1] }}
              >
                <span className="italic text-terracotta">Maída</span> Live
              </motion.span>
            </span>
          </h1>

          <motion.p
            className="text-base md:text-xl text-sand/90 max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            {maidaLive?.heroSubtitle || 'Where dinner becomes an experience. Music, culture, and atmosphere.'}
          </motion.p>
        </div>
      </section>

      {/* The Nights Section */}
      <section className="pt-12 pb-16 md:pt-16 md:pb-24 px-6 bg-warm-white">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <h2 className="font-display text-3xl md:text-5xl font-medium mb-4 text-charcoal">
              {maidaLive?.weeklyProgramTitle || 'Our weekly program'}
            </h2>
          </motion.div>

          {/* Cards */}
          <motion.div 
            className="flex flex-col gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={staggerContainer}
          >
            {/* Row 1: Thursday and Friday side by side on desktop */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Thursday Card */}
              <motion.div
                className="group relative overflow-hidden cursor-pointer"
                variants={fadeInUp}
                onClick={() => setActiveNight(activeNight === 'thursday' ? null : 'thursday')}
              >
                <div className="relative bg-gradient-to-br from-sand/60 to-sand/30 p-8 flex flex-col min-h-[280px]">
                  {/* Icon */}
                  <div className="w-14 h-14 rounded-full bg-charcoal/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Calendar className="w-7 h-7 text-charcoal" />
                  </div>

                  <h3 className="font-display text-3xl mb-2 text-charcoal">{nights?.thursday?.title || 'Thursdays'}</h3>
                  <p className="text-charcoal/80 text-lg mb-4">{nights?.thursday?.subtitle || 'Cultural Rotation'}</p>
                  
                  <p className="text-charcoal/60 mb-6">
                    {nights?.thursday?.description || 'Every Thursday brings a different flavour. Not just music - a cultural journey through sound.'}
                  </p>

                  {/* Expanded content */}
                  <AnimatePresence>
                    {activeNight === 'thursday' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <p className="text-xs uppercase tracking-widest text-charcoal/60 mb-4">{maidaLive?.monthlyRotation || 'Monthly Rotation'}</p>
                        <div className="grid grid-cols-2 gap-3">
                          {thursdayThemes.map((item: any, index: number) => (
                            <div 
                              key={index}
                              className="bg-charcoal/5 p-4 hover:bg-charcoal/10 transition-colors"
                            >
                              <p className="text-charcoal/60 text-sm font-medium">{item.week} {maidaLive?.week || 'Week'}</p>
                              <p className="text-charcoal font-display text-lg">{item.theme}</p>
                              <p className="text-charcoal/50 text-sm">{item.description}</p>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Click hint */}
                  <p className="mt-auto pt-4 text-xs text-charcoal/40">
                    {activeNight === 'thursday' ? (maidaLive?.clickToCollapse || 'Click to collapse') : (maidaLive?.clickToSeeSchedule || 'Click to see schedule')}
                  </p>
                </div>
              </motion.div>

              {/* Friday Card */}
              <motion.div
                className="group relative overflow-hidden cursor-pointer"
                variants={fadeInUp}
                onClick={() => setActiveNight(activeNight === 'friday' ? null : 'friday')}
              >
                <div className="relative bg-gradient-to-br from-sage/40 to-sage/20 p-8 flex flex-col min-h-[280px]">
                  {/* Icon */}
                  <div className="w-14 h-14 rounded-full bg-charcoal/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Music className="w-7 h-7 text-charcoal" />
                  </div>

                  <h3 className="font-display text-3xl mb-2 text-charcoal">{nights?.friday?.title || 'Fridays'}</h3>
                  <p className="text-charcoal/80 text-lg mb-4">{nights?.friday?.subtitle || 'Dinner & DJ'}</p>
                  
                  <p className="text-charcoal/60 mb-6">
                    {nights?.friday?.description || 'The weekend begins. Live DJ sets create the perfect backdrop for dinner and drinks.'}
                  </p>

                  {/* Expanded content */}
                  <AnimatePresence>
                    {activeNight === 'friday' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden space-y-4"
                      >
                        <div className="bg-charcoal/5 p-6">
                          <p className="text-charcoal font-display text-xl mb-2">{maidaLive?.theVibe || 'The Vibe'}</p>
                          <p className="text-charcoal/60">
                            {nights?.friday?.vibeDescription || 'Not a party - an elevated dinner experience. The music complements your meal, the energy builds naturally, and the night unfolds at your pace.'}
                          </p>
                        </div>
                        <div className="flex gap-4">
                          <div className="bg-charcoal/5 p-4 flex-1">
                            <p className="text-charcoal/60 text-sm">{maidaLive?.hours || 'Hours'}</p>
                            <p className="text-charcoal font-display text-lg">12:30 - 00:00</p>
                          </div>
                          <div className="bg-charcoal/5 p-4 flex-1">
                            <p className="text-charcoal/60 text-sm">{maidaLive?.djSetsFrom || 'DJ Sets from'}</p>
                            <p className="text-charcoal font-display text-lg">21:00</p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Click hint */}
                  <p className="mt-auto pt-4 text-xs text-charcoal/40">
                    {activeNight === 'friday' ? (maidaLive?.clickToCollapse || 'Click to collapse') : (maidaLive?.clickToLearnMore || 'Click to learn more')}
                  </p>
                </div>
              </motion.div>
            </div>

            {/* Row 2: Saturday full width */}
            <motion.div
              className="group relative overflow-hidden cursor-pointer"
              variants={fadeInUp}
              onClick={() => setActiveNight(activeNight === 'saturday' ? null : 'saturday')}
            >
              <div className="relative bg-gradient-to-br from-terracotta/40 to-terracotta/20 p-8 flex flex-col min-h-[280px]">
                {/* Icon */}
                <div className="w-14 h-14 rounded-full bg-charcoal/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <PartyPopper className="w-7 h-7 text-charcoal" />
                </div>

                <h3 className="font-display text-3xl mb-2 text-charcoal">{nights?.saturday?.title || 'Saturdays'}</h3>
                <p className="text-charcoal/80 text-lg mb-4">{nights?.saturday?.subtitle || 'The Full Journey'}</p>
                
                <p className="text-charcoal/60 mb-6">
                  {nights?.saturday?.description || 'The full journey - dinner, drinks, and dancing until 02:00.'}
                </p>

                {/* Expanded content */}
                <AnimatePresence>
                  {activeNight === 'saturday' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden space-y-4"
                    >
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="bg-charcoal/5 p-6">
                          <p className="text-charcoal font-display text-xl mb-2">{maidaLive?.theJourney || 'The Journey'}</p>
                          <p className="text-charcoal/60">
                            {nights?.saturday?.journeyDescription || 'Start with dinner, stay for the party. Our Saturday nights are legendary - the food, the drinks, the music, all building to a peak.'}
                          </p>
                        </div>
                        <div className="space-y-4">
                          <div className="flex gap-4">
                            <div className="bg-charcoal/5 p-4 flex-1">
                              <p className="text-charcoal/60 text-sm">{maidaLive?.hours || 'Hours'}</p>
                              <p className="text-charcoal font-display text-lg">12:30 - 02:00</p>
                            </div>
                            <div className="bg-charcoal/5 p-4 flex-1">
                              <p className="text-charcoal/60 text-sm">{maidaLive?.partyMode || 'Party Mode'}</p>
                              <p className="text-charcoal font-display text-lg">{maidaLive?.from || 'From'} 23:00</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Click hint */}
                <p className="mt-auto pt-4 text-xs text-charcoal/40">
                  {activeNight === 'saturday' ? (maidaLive?.clickToCollapse || 'Click to collapse') : (maidaLive?.clickToLearnMore || 'Click to learn more')}
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ============================================
          PRIVATE EVENTS + DJ APPLICATION - Combined Section
          ============================================ */}
      <section className="py-16 md:py-20 px-6 bg-charcoal">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 md:gap-16">
            {/* Private Events */}
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="font-display text-2xl md:text-3xl font-medium text-white mb-3">
                {privateEvents?.title || 'Enjoying'} <span className="italic text-terracotta">Maída</span> Live?
              </h2>
              <p className="text-lg text-sand mb-2">
                {privateEvents?.subtitle || 'Make it private.'}
              </p>
              <p className="text-sand/60 mb-6 text-sm">
                {privateEvents?.description || 'Host your next celebration, corporate event, or private gathering with us.'}
              </p>
              <Link href={`/${locale}/contact`} className="inline-block bg-warm-white text-charcoal px-6 py-3 text-sm font-medium hover:bg-sand transition-colors">
                {privateEvents?.cta || 'Contact us'}
              </Link>
            </motion.div>

            {/* Divider - mobile only */}
            <div className="md:hidden w-16 h-px bg-sand/30 mx-auto" />

            {/* DJ Application */}
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <h2 className="font-display text-2xl md:text-3xl font-medium text-white mb-3">
                {djApplication?.title || 'Are you a DJ?'}
              </h2>
              <p className="text-lg text-sand mb-2">
                {djApplication?.subtitle || 'Join our rotation.'}
              </p>
              <p className="text-sand/60 mb-6 text-sm">
                {djApplication?.description || 'If your sound fits our vibe, we want to hear from you.'}
              </p>
              <button
                onClick={() => setIsDJModalOpen(true)}
                className="inline-block bg-terracotta text-warm-white px-6 py-3 text-sm font-medium hover:bg-terracotta/90 transition-colors"
              >
                {djApplication?.cta || 'Apply to play'}
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============================================
          FINAL CTA - Terracotta with Emblem Pattern
          ============================================ */}
      <section 
        className="relative py-16 md:py-20 px-6 overflow-hidden"
        style={{ background: 'linear-gradient(135deg, rgb(198, 125, 94) 0%, rgb(166, 93, 63) 100%)' }}
      >
        {/* Emblem Pattern - darker for visibility on terracotta */}
        <div 
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage: `url('/images/brand/emblem.svg')`,
            backgroundSize: '100px',
            backgroundRepeat: 'repeat',
            filter: 'brightness(0)',
          }}
        />
        
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <motion.h2 
            className="font-display text-fluid-3xl font-light text-warm-white mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
             {maidaLive?.ctaTitle || 'An evolving atmosphere of food, drinks,'} <span className="italic">{maidaLive?.ctaTitleHighlight || 'and music'}</span>
          </motion.h2>

          <motion.p 
            className="text-lg text-warm-white/90 mb-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            {maidaLive?.ctaHashtag || '#MeetMeAtMaída'}
          </motion.p>

          <motion.button
            onClick={handleReserveClick}
            className="btn bg-charcoal text-warm-white hover:bg-warm-white hover:text-charcoal"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            {nav?.bookTable || maidaLive?.ctaButton || 'Reserve a Table'}
          </motion.button>
        </div>
      </section>

      {/* DJ Application Modal */}
      <DJApplicationModal 
        isOpen={isDJModalOpen} 
        onClose={() => setIsDJModalOpen(false)}
        translations={{ djForm, djApplication }}
      />
    </div>
  );
}

// DJ Application Modal Component
function DJApplicationModal({ isOpen, onClose, translations }: { isOpen: boolean; onClose: () => void; translations: any }) {
  const djForm = translations?.djForm || {};
  const djApplication = translations?.djApplication || {};
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    genres: [] as string[],
    otherGenre: '',
    musicLink: '',
    message: '',
  });
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // Genre options for DJ form
  const genreOptions = [
    'House',
    'Deep House',
    'Techno',
    'Electronica',
    'Commercial / Top 40',
    '80s / 90s / 00s',
    'Jazz',
    'World / Arabic',
    'Funk / Soul',
  ];

  const handleGenreToggle = (genre: string) => {
    setFormData(prev => ({
      ...prev,
      genres: prev.genres.includes(genre)
        ? prev.genres.filter(g => g !== genre)
        : [...prev.genres, genre]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    setErrorMessage('');

    // Validation
    if (!formData.name || !formData.email || !formData.phone || formData.genres.length === 0) {
      setStatus('error');
      setErrorMessage(djForm?.validationError || 'Please fill in all required fields and select at least one genre.');
      return;
    }

    try {
      // Check if dev mode
      const isDev = typeof window !== 'undefined' && 
        (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

      if (isDev) {
        console.log('📧 DEV MODE - DJ Application:', formData);
        await new Promise(resolve => setTimeout(resolve, 1000));
        setStatus('success');
        return;
      }

      // Get reCAPTCHA token
      let recaptchaToken = '';
      if (typeof window !== 'undefined' && (window as any).grecaptcha?.enterprise) {
        try {
          recaptchaToken = await (window as any).grecaptcha.enterprise.execute(
            '6LffXD0sAAAAACfEknWv1dMM2MTVwa3ScqsDP-2U',
            { action: 'DJ_APPLICATION' }
          );
        } catch (err) {
          console.error('reCAPTCHA error:', err);
        }
      }

      const response = await fetch('/backend/dj-apply.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          genres: formData.otherGenre 
            ? [...formData.genres, `Other: ${formData.otherGenre}`]
            : formData.genres,
          _recaptcha: recaptchaToken,
          _timestamp: Math.floor(Date.now() / 1000),
        }),
      });

      const result = await response.json();

      if (result.success) {
        setStatus('success');
      } else {
        setStatus('error');
        setErrorMessage(result.message || djForm?.error || 'Something went wrong. Please try again.');
      }
    } catch (error) {
      setStatus('error');
      setErrorMessage(djForm?.networkError || 'Network error. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      genres: [],
      otherGenre: '',
      musicLink: '',
      message: '',
    });
    setStatus('idle');
    setErrorMessage('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal Container - Centered */}
          <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
            <motion.div
              className="w-full max-w-2xl max-h-[90vh] bg-charcoal overflow-hidden flex flex-col"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3, ease: [0.19, 1, 0.22, 1] }}
            >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div>
                <h3 className="font-display text-2xl text-white">{djForm?.modalTitle || 'DJ Application'}</h3>
                <p className="text-sand/60 text-sm">{djForm?.modalSubtitle || 'Join the'} <span className="italic text-terracotta">Maída</span> Live {djForm?.rotation || 'rotation'}</p>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Form Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {status === 'success' ? (
                <motion.div
                  className="text-center py-12"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-10 h-10 text-green-400" />
                  </div>
                  <h4 className="font-display text-2xl text-white mb-3">{djForm?.successTitle || 'Application sent!'}</h4>
                  <p className="text-sand/70 mb-8">
                    {djForm?.successMessage || "Thanks for your interest! We'll review your application and get back to you if there's a fit."}
                  </p>
                  <button
                    onClick={() => { resetForm(); onClose(); }}
                    className="btn btn-primary"
                  >
                    {djForm?.close || 'Close'}
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Name */}
                  <div>
                    <label className="block text-sm text-sand/80 mb-2">{djForm?.name || 'Full name'} *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white placeholder:text-sand/40 focus:outline-none focus:border-terracotta transition-colors"
                      placeholder={djForm?.namePlaceholder || 'Your name or DJ name'}
                      required
                    />
                  </div>

                  {/* Email & Phone */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-sand/80 mb-2">{djForm?.email || 'Email'} *</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white placeholder:text-sand/40 focus:outline-none focus:border-terracotta transition-colors"
                        placeholder="your@email.com"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-sand/80 mb-2">{djForm?.phone || 'Phone'} *</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white placeholder:text-sand/40 focus:outline-none focus:border-terracotta transition-colors"
                        placeholder="+351 XXX XXX XXX"
                        required
                      />
                    </div>
                  </div>

                  {/* Genres */}
                  <div>
                    <label className="block text-sm text-sand/80 mb-3">{djForm?.genres || 'Genres you play'} *</label>
                    <div className="flex flex-wrap gap-2">
                      {genreOptions.map((genre) => (
                        <button
                          key={genre}
                          type="button"
                          onClick={() => handleGenreToggle(genre)}
                          className={`px-4 py-2 text-sm transition-all ${
                            formData.genres.includes(genre)
                              ? 'bg-terracotta text-white'
                              : 'bg-white/5 text-sand/70 hover:bg-white/10'
                          }`}
                        >
                          {genre}
                        </button>
                      ))}
                    </div>
                    {/* Other genre input */}
                    <input
                      type="text"
                      value={formData.otherGenre}
                      onChange={(e) => setFormData(prev => ({ ...prev, otherGenre: e.target.value }))}
                      className="mt-3 w-full px-4 py-3 bg-white/5 border border-white/10 text-white placeholder:text-sand/40 focus:outline-none focus:border-terracotta transition-colors"
                      placeholder={djForm?.otherGenresPlaceholder || 'Other genres (optional)'}
                    />
                  </div>

                  {/* Music Link */}
                  <div>
                    <label className="block text-sm text-sand/80 mb-2">{djForm?.musicLink || 'Music link (optional)'}</label>
                    <input
                      type="url"
                      value={formData.musicLink}
                      onChange={(e) => setFormData(prev => ({ ...prev, musicLink: e.target.value }))}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white placeholder:text-sand/40 focus:outline-none focus:border-terracotta transition-colors"
                      placeholder="SoundCloud, Mixcloud, Spotify, etc."
                    />
                    <p className="text-xs text-sand/40 mt-1">{djForm?.musicLinkHint || 'Share a link to your mixes or music'}</p>
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-sm text-sand/80 mb-2">{djForm?.message || 'Tell us about yourself (optional)'}</label>
                    <textarea
                      value={formData.message}
                      onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                      rows={3}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white placeholder:text-sand/40 focus:outline-none focus:border-terracotta transition-colors resize-none"
                      placeholder={djForm?.messagePlaceholder || 'Brief bio, experience, why Maída...'}
                    />
                  </div>

                  {/* Error message */}
                  {status === 'error' && (
                    <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                      {errorMessage}
                    </div>
                  )}

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={status === 'sending'}
                    className="w-full bg-terracotta text-warm-white py-3 flex items-center justify-center gap-2 font-medium hover:bg-terracotta/90 transition-colors disabled:opacity-50"
                  >
                    {status === 'sending' ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        {djForm?.sending || 'Sending...'}
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        {djForm?.submit || 'Submit application'}
                      </>
                    )}
                  </button>

                  {/* Privacy note */}
                  <p className="text-xs text-sand/40 text-center">
                    {djForm?.privacyNote || 'By submitting, you agree to be contacted about DJ opportunities at'} <span className="italic text-terracotta">Maída</span>.
                  </p>
                </form>
              )}
            </div>
          </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
