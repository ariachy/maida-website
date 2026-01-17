'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Script from 'next/script';
import { Locale } from '@/lib/i18n';

// reCAPTCHA Enterprise Site Key
const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '6LffXD0sAAAAACfEknWv1dMM2MTVwa3ScqsDP-2U';

interface ContactClientProps {
  translations: any;
  locale: Locale;
}

export default function ContactClient({ translations, locale }: ContactClientProps) {
  const contact = translations?.contact || {};
  const form = contact?.form || {};
  const subjects = contact?.subjects || {};
  const info = contact?.info || {};
  const hours = contact?.hours || {};
  const location = contact?.location || {};
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    website: '', // Honeypot
  });
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [recaptchaLoaded, setRecaptchaLoaded] = useState(false);
  const [timestamp, setTimestamp] = useState(Math.floor(Date.now() / 1000));

  useEffect(() => {
    setTimestamp(Math.floor(Date.now() / 1000));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    setErrorMessage('');

    // Honeypot check
    if (formData.website) {
      setStatus('error');
      setErrorMessage(form?.error || 'Something went wrong. Please try again.');
      return;
    }

    // Time-based check (form submitted too quickly)
    const now = Math.floor(Date.now() / 1000);
    if (now - timestamp < 3) {
      setStatus('error');
      setErrorMessage('Please wait a moment before submitting.');
      return;
    }

    try {
      // Get reCAPTCHA token
      let recaptchaToken = '';
      if (recaptchaLoaded && (window as any).grecaptcha?.enterprise) {
        recaptchaToken = await (window as any).grecaptcha.enterprise.execute(RECAPTCHA_SITE_KEY, { action: 'contact' });
      }

      // Development mode - just log
      if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
        console.log('Contact Form Submission (Dev Mode):', {
          ...formData,
          recaptcha: recaptchaToken ? 'Token received' : 'No token',
        });
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setStatus('success');
        setFormData({ name: '', email: '', subject: '', message: '', website: '' });
        setTimestamp(Math.floor(Date.now() / 1000));
        return;
      }

      // Production mode - call PHP backend
      const response = await fetch('/backend/contact.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          subject: formData.subject || 'General Inquiry',
          message: formData.message,
          website: formData.website,
          _timestamp: timestamp,
          _recaptcha: recaptchaToken,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setStatus('success');
        setFormData({ name: '', email: '', subject: '', message: '', website: '' });
        setTimestamp(Math.floor(Date.now() / 1000));
      } else {
        setStatus('error');
        setErrorMessage(data.message || form?.error || 'Something went wrong. Please try again.');
      }
    } catch (error) {
      setStatus('error');
      setErrorMessage('Failed to send message. Please email us directly at info@maida.pt');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <>
      {/* Load reCAPTCHA Enterprise Script */}
      <Script
        src={`https://www.google.com/recaptcha/enterprise.js?render=${RECAPTCHA_SITE_KEY}`}
        onLoad={() => setRecaptchaLoaded(true)}
      />

      <div className="min-h-screen bg-warm-white pt-32 pb-20">
        <div className="max-w-6xl mx-auto px-6">
          {/* Header */}
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-charcoal mb-4">
              {contact?.title || 'Get in Touch'}
            </h1>
          </motion.div>

          {/* Main Content - Two columns on desktop (1/3 + 2/3) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16 mb-16">
            
            {/* Left Column - Info (shows second on mobile) - 1/3 width on desktop */}
            <motion.div
              className="order-2 lg:order-1 lg:col-span-1 space-y-10 text-center lg:text-left"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {/* Hours */}
              <div>
                <h3 className="font-display text-xl text-charcoal mb-4">{hours?.title || 'Opening Hours'}</h3>
                <div className="space-y-3 text-charcoal/70 text-sm">
                  <div>
                    <p className="text-charcoal font-medium">Mon–Tue</p>
                    <p>{hours?.closedText || 'Closed'}</p>
                  </div>
                  <div>
                    <p className="text-charcoal font-medium">Wed, Thu, Sun</p>
                    <p>12:30 - 23:00</p>
                    <p className="text-xs text-stone">{hours?.midweekKitchen || 'Kitchen closes 22:30'}</p>
                  </div>
                  <div>
                    <p className="text-charcoal font-medium">Fri–Sat</p>
                    <p>12:30 - 01:00</p>
                    <p className="text-xs text-stone">{hours?.weekendKitchen || 'Kitchen closes 23:30'}</p>
                  </div>
                </div>
              </div>

              {/* Location */}
              <div>
                <h3 className="font-display text-xl text-charcoal mb-4">{location?.title || 'Location'}</h3>
                <p className="text-charcoal/70 text-sm">
                  {info?.address || 'Rua da Boavista 66'}<br />
                  {info?.city || '1200-067 Lisboa'}<br />
                  Cais do Sodré
                </p>
                <a
                  href="https://maps.google.com/?q=Rua+da+Boavista+66+Lisboa"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-3 text-terracotta hover:text-terracotta/80 text-sm transition-colors"
                >
                  {location?.directions || 'Get Directions →'}
                </a>
              </div>

              {/* Contact */}
              <div>
                <h3 className="font-display text-xl text-charcoal mb-4">{info?.title || 'Contact'}</h3>
                <p className="text-charcoal/70 text-sm">
                  <a href="mailto:info@maida.pt" className="hover:text-terracotta transition-colors">
                    {info?.email || 'info@maida.pt'}
                  </a>
                </p>
              </div>
            </motion.div>

            {/* Right Column - Contact Form (shows first on mobile) - 2/3 width on desktop */}
            <motion.div
              className="order-1 lg:order-2 lg:col-span-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className="bg-sand/30 p-6 md:p-10">
                <h2 className="font-display text-2xl text-charcoal mb-6 text-center lg:text-left">
                  {form?.title || 'Send us a message'}
                </h2>
                
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Honeypot field - hidden from users */}
                  <input
                    type="text"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    className="absolute -left-[9999px] opacity-0 pointer-events-none"
                    tabIndex={-1}
                    autoComplete="off"
                    aria-hidden="true"
                  />

                  {/* Name */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-charcoal mb-2">
                      {form?.name || 'Your name'} *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white border border-stone/20 focus:outline-none focus:ring-2 focus:ring-terracotta/50 focus:border-terracotta transition-colors"
                      placeholder="John Doe"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-charcoal mb-2">
                      {form?.email || 'Email address'} *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white border border-stone/20 focus:outline-none focus:ring-2 focus:ring-terracotta/50 focus:border-terracotta transition-colors"
                      placeholder="john@example.com"
                    />
                  </div>

                  {/* Subject */}
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-charcoal mb-2">
                      {form?.subject || 'Subject'}
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white border border-stone/20 focus:outline-none focus:ring-2 focus:ring-terracotta/50 focus:border-terracotta transition-colors"
                    >
                      <option value="">{subjects?.select || 'Select a topic'}</option>
                      <option value="General Inquiry">{subjects?.general || 'General inquiry'}</option>
                      <option value="Large Group Reservation">{subjects?.reservation || 'Large group reservation (6+)'}</option>
                      <option value="Private Event">{subjects?.event || 'Private event'}</option>
                      <option value="Feedback">{subjects?.feedback || 'Feedback'}</option>
                      <option value="Other">{subjects?.other || 'Other'}</option>
                    </select>
                  </div>

                  {/* Message */}
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-charcoal mb-2">
                      {form?.message || 'Message'} *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      required
                      rows={5}
                      value={formData.message}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white border border-stone/20 focus:outline-none focus:ring-2 focus:ring-terracotta/50 focus:border-terracotta transition-colors resize-none"
                      placeholder={form?.placeholder || 'How can we help you?'}
                    />
                  </div>

                  {/* Error Message */}
                  {status === 'error' && (
                    <p className="text-red-600 text-sm bg-red-50 p-3">
                      {errorMessage}
                    </p>
                  )}

                  {/* Success Message */}
                  {status === 'success' && (
                    <p className="text-green-700 text-sm bg-green-50 p-3">
                      {form?.success || "Thank you! Your message has been sent. We'll get back to you soon."}
                    </p>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={status === 'sending'}
                    className="w-full bg-terracotta text-warm-white px-6 py-3 font-medium hover:bg-terracotta/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {status === 'sending' ? (form?.sending || 'Sending...') : (form?.send || 'Send message')}
                  </button>

                  {/* reCAPTCHA notice */}
                  <p className="text-xs text-stone/60 text-center">
                    Protected by reCAPTCHA.
                  </p>
                </form>
              </div>
            </motion.div>
          </div>

          {/* Map Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="aspect-[2/1] md:aspect-[3/1] bg-sand/30 overflow-hidden">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2849.8846023983865!2d-9.15119542455817!3d38.70891275780444!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd193332b934a279%3A0x3191bb53cc89ae9!2sma%C3%ADda%20%7C%20Mediterranean%20Flavours%2C%20Lebanese%20Soul!5e1!3m2!1sen!2slb!4v1768684138120!5m2!1sen!2slb"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Maída Restaurant Location"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}
