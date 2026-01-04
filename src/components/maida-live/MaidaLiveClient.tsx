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

// Thursday themes rotation
const thursdayThemes = [
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

export default function MaidaLiveClient({ translations, locale }: MaidaLiveClientProps) {
  const [isDJModalOpen, setIsDJModalOpen] = useState(false);
  const [activeNight, setActiveNight] = useState<'thursday' | 'friday' | 'saturday' | null>(null);

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
      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="/images/atmosphere/dj.webp"
            alt="DJ at Maída"
            fill
            className="object-cover object-bottom"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-charcoal/70 via-charcoal/50 to-charcoal" />
        </div>

        {/* Animated gradient orbs */}
        <div className="absolute top-1/4 right-1/4 w-[300px] h-[300px] rounded-full bg-terracotta/20 blur-[100px] animate-pulse" />
        <div className="absolute bottom-1/4 left-1/4 w-[200px] h-[200px] rounded-full bg-purple-500/10 blur-[80px] animate-pulse" style={{ animationDelay: '1s' }} />

        {/* Content */}
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center pt-20">
          <motion.p
            className="inline-flex items-center gap-3 text-xs tracking-[0.3em] uppercase text-terracotta-light mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <span className="w-8 h-px bg-terracotta-light" />
            Music • Culture • Atmosphere
            <span className="w-8 h-px bg-terracotta-light" />
          </motion.p>

          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-medium mb-6">
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
        </div>
      </section>

      {/* The Concept Section */}
      <section className="pt-12 pb-16 md:pt-16 md:pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={staggerContainer}
          >
            <motion.h2 
              className="font-display text-3xl md:text-5xl font-medium mb-8"
              variants={fadeInUp}
            >
              More than music.<br />
              <span className="text-terracotta italic">It's curated culture.</span>
            </motion.h2>

            <motion.p 
              className="text-lg text-sand/70 max-w-2xl mx-auto leading-relaxed"
              variants={fadeInUp}
            >
              The dining experience. The atmosphere evolves.
            </motion.p>
          </motion.div>
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
              Our weekly program
            </h2>
            <p className="text-stone">Click to explore each experience</p>
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

                  <h3 className="font-display text-3xl mb-2 text-charcoal">Thursdays</h3>
                  <p className="text-charcoal/80 text-lg mb-4">Cultural Rotation</p>
                  
                  <p className="text-charcoal/60 mb-6">
                    Every Thursday brings a different flavour. Not just music - a cultural journey through sound.
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
                        <p className="text-xs uppercase tracking-widest text-charcoal/60 mb-4">Monthly Rotation</p>
                        <div className="grid grid-cols-2 gap-3">
                          {thursdayThemes.map((item, index) => (
                            <div 
                              key={index}
                              className="bg-charcoal/5 p-4 hover:bg-charcoal/10 transition-colors"
                            >
                              <p className="text-charcoal/60 text-sm font-medium">{item.week} Week</p>
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
                    {activeNight === 'thursday' ? 'Click to collapse' : 'Click to see schedule'}
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

                  <h3 className="font-display text-3xl mb-2 text-charcoal">Fridays</h3>
                  <p className="text-charcoal/80 text-lg mb-4">DJ Dinner</p>
                  
                  <p className="text-charcoal/60 mb-6">
                    The weekend begins. Live DJ sets create the perfect backdrop for dinner and drinks.
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
                          <p className="text-charcoal font-display text-xl mb-2">The Vibe</p>
                          <p className="text-charcoal/60">
                            Not a party - an elevated dinner experience. The music complements your meal, 
                            the energy builds naturally, and the night unfolds at your pace.
                          </p>
                        </div>
                        <div className="flex gap-4">
                          <div className="bg-charcoal/5 p-4 flex-1">
                            <p className="text-charcoal/60 text-sm">Hours</p>
                            <p className="text-charcoal font-display text-lg">12:30 - 00:00</p>
                          </div>
                          <div className="bg-charcoal/5 p-4 flex-1">
                            <p className="text-charcoal/60 text-sm">DJ Sets from</p>
                            <p className="text-charcoal font-display text-lg">21:00</p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Click hint */}
                  <p className="mt-auto pt-4 text-xs text-charcoal/40">
                    {activeNight === 'friday' ? 'Click to collapse' : 'Click to learn more'}
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

                <h3 className="font-display text-3xl mb-2 text-charcoal">Saturdays</h3>
                <p className="text-charcoal/80 text-lg mb-4">The Full Journey</p>
                
                <p className="text-charcoal/60 mb-6">
                  The full journey - dinner, drinks, and dancing until 02:00.
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
                          <p className="text-charcoal font-display text-xl mb-2">The Journey</p>
                          <p className="text-charcoal/60">
                            Start with dinner, stay for the party. Our Saturday nights are legendary - 
                            the food, the drinks, the music, all building to a peak.
                          </p>
                        </div>
                        <div className="space-y-4">
                          <div className="flex gap-4">
                            <div className="bg-charcoal/5 p-4 flex-1">
                              <p className="text-charcoal/60 text-sm">Hours</p>
                              <p className="text-charcoal font-display text-lg">12:30 - 02:00</p>
                            </div>
                            <div className="bg-charcoal/5 p-4 flex-1">
                              <p className="text-charcoal/60 text-sm">Party Mode</p>
                              <p className="text-charcoal font-display text-lg">From 23:00</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Click hint */}
                <p className="mt-auto pt-4 text-xs text-charcoal/40">
                  {activeNight === 'saturday' ? 'Click to collapse' : 'Click to learn more'}
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ============================================
          ENJOYING MAÍDA LIVE - Light Background
          ============================================ */}
      <section className="py-16 md:py-20 px-6 bg-cream">
        <motion.div
          className="text-center max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="font-display text-3xl md:text-4xl font-medium text-charcoal mb-4">
            Enjoying <span className="italic text-terracotta">Maída</span> Live?
          </h2>
          <p className="text-xl text-stone mb-4">
            Make it private.
          </p>
          <p className="text-stone/70 mb-8">
            Host your next celebration, corporate event, or private gathering with us.
          </p>
          <Link href={`/${locale}/contact`} className="inline-block bg-charcoal text-warm-white px-8 py-3 text-base font-medium hover:bg-charcoal/90 transition-colors">
            Contact us
          </Link>
        </motion.div>
      </section>

      {/* ============================================
          DJ APPLICATION CTA - Dark Background (no icon)
          ============================================ */}
      <section className="py-16 md:py-20 px-6 bg-charcoal">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.h2 
              className="font-display text-3xl md:text-5xl font-medium mb-6 text-white"
              variants={fadeInUp}
            >
              Are you a DJ?
            </motion.h2>

            <motion.p 
              className="text-lg text-sand/70 max-w-xl mx-auto mb-10"
              variants={fadeInUp}
            >
              We're always looking for talented DJs to join our rotation. 
              If your sound fits our vibe, we want to hear from you.
            </motion.p>

            <motion.button
              onClick={() => setIsDJModalOpen(true)}
              className="bg-terracotta text-warm-white px-10 py-4 text-lg font-medium hover:bg-terracotta/90 transition-colors"
              variants={fadeInUp}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              Apply to play
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* ============================================
          FINAL CTA - Terracotta with Emblem Pattern
          ============================================ */}
      <section 
        className="relative py-16 md:py-20 px-6 overflow-hidden"
        style={{ background: 'linear-gradient(135deg, rgb(198, 125, 94) 0%, rgb(166, 93, 63) 100%)' }}
      >
        {/* Emblem Pattern */}
        <div 
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage: `url('/images/brand/emblem.svg')`,
            backgroundSize: '100px',
            backgroundRepeat: 'repeat',
            filter: 'brightness(0)',
          }}
        />
        
        <motion.div
          className="relative z-10 max-w-3xl mx-auto text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="font-display text-4xl md:text-5xl font-medium text-warm-white mb-8">
            Meet me at <span className="italic">Maída</span>
          </h2>
          <button 
            onClick={handleReserveClick} 
            className="bg-charcoal text-warm-white px-10 py-4 text-lg font-medium hover:bg-warm-white hover:text-charcoal transition-colors"
          >
            Reserve now
          </button>
        </motion.div>
      </section>

      {/* DJ Application Modal */}
      <DJApplicationModal 
        isOpen={isDJModalOpen} 
        onClose={() => setIsDJModalOpen(false)} 
      />
    </div>
  );
}

// DJ Application Modal Component
function DJApplicationModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
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
      setErrorMessage('Please fill in all required fields and select at least one genre.');
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
        setErrorMessage(result.message || 'Something went wrong. Please try again.');
      }
    } catch (error) {
      setStatus('error');
      setErrorMessage('Network error. Please try again.');
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
                <h3 className="font-display text-2xl text-white">DJ Application</h3>
                <p className="text-sand/60 text-sm">Join the <span className="italic text-terracotta">Maída</span> Live rotation</p>
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
                  <h4 className="font-display text-2xl text-white mb-3">Application sent!</h4>
                  <p className="text-sand/70 mb-8">
                    Thanks for your interest! We'll review your application and get back to you if there's a fit.
                  </p>
                  <button
                    onClick={() => { resetForm(); onClose(); }}
                    className="btn btn-primary"
                  >
                    Close
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Name */}
                  <div>
                    <label className="block text-sm text-sand/80 mb-2">Full name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white placeholder:text-sand/40 focus:outline-none focus:border-terracotta transition-colors"
                      placeholder="Your name or DJ name"
                      required
                    />
                  </div>

                  {/* Email & Phone */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-sand/80 mb-2">Email *</label>
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
                      <label className="block text-sm text-sand/80 mb-2">Phone *</label>
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
                    <label className="block text-sm text-sand/80 mb-3">Genres you play *</label>
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
                      placeholder="Other genres (optional)"
                    />
                  </div>

                  {/* Music Link */}
                  <div>
                    <label className="block text-sm text-sand/80 mb-2">Music link (optional)</label>
                    <input
                      type="url"
                      value={formData.musicLink}
                      onChange={(e) => setFormData(prev => ({ ...prev, musicLink: e.target.value }))}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white placeholder:text-sand/40 focus:outline-none focus:border-terracotta transition-colors"
                      placeholder="SoundCloud, Mixcloud, Spotify, etc."
                    />
                    <p className="text-xs text-sand/40 mt-1">Share a link to your mixes or music</p>
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-sm text-sand/80 mb-2">Tell us about yourself (optional)</label>
                    <textarea
                      value={formData.message}
                      onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                      rows={3}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white placeholder:text-sand/40 focus:outline-none focus:border-terracotta transition-colors resize-none"
                      placeholder="Brief bio, experience, why Maída..."
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
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Submit application
                      </>
                    )}
                  </button>

                  {/* Privacy note */}
                  <p className="text-xs text-sand/40 text-center">
                    By submitting, you agree to be contacted about DJ opportunities at <span className="italic text-terracotta">Maída</span>.
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
